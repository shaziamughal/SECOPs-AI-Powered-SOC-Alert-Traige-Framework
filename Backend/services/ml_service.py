import os
from datetime import datetime, timedelta, timezone

import requests

from app_models import Alert

FALSE_POSITIVE_KEYWORDS = {
    "update",
    "system update",
    "package install",
    "service started",
    "heartbeat",
}
MALICIOUS_KEYWORDS = {
    "brute force",
    "powershell",
    "malware",
    "ransomware",
    "suspicious",
    "trojan",
    "attack",
    "encoded command",
}


def _as_bool(value: object) -> bool:
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        normalized = value.strip().lower()
        if normalized in {"false_positive", "fp", "benign", "false", "0"}:
            return True
        if normalized in {"true_positive", "tp", "malicious", "actionable", "true", "1"}:
            return False
    raise ValueError("Remote classifier returned unsupported label")


def _int_setting(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, str(default)))
    except ValueError:
        return default


def _float_setting(name: str, default: float) -> float:
    try:
        return float(os.getenv(name, str(default)))
    except ValueError:
        return default


def _local_heuristic(alert: Alert) -> tuple[bool, float, str]:
    text = f"{alert.rule_description} {alert.raw_data or ''}".lower()
    level = alert.rule_level or 0

    reasoning = "Based on alert severity and matching indicators."
    if any(keyword in text for keyword in FALSE_POSITIVE_KEYWORDS) and level <= 4:
        return True, 0.91, "Low-severity operational event matched a known benign pattern."
    if any(keyword in text for keyword in MALICIOUS_KEYWORDS) or level >= 10:
        return False, (0.96 if level >= 12 else 0.88), "Threat-linked keywords and/or elevated rule level indicate a likely true positive."
    return False, 0.62, "The alert lacks strong benign indicators, so it remains actionable."


def _classify_with_remote(alert: Alert) -> tuple[bool, float, str]:
    endpoint = os.getenv("ML_REMOTE_URL", "").strip()
    if not endpoint:
        raise RuntimeError("ML_REMOTE_URL is not configured")

    timeout_seconds = _float_setting("ML_REMOTE_TIMEOUT_SECONDS", 8.0)
    api_key = os.getenv("ML_REMOTE_API_KEY", "").strip()
    api_key_header = os.getenv("ML_REMOTE_API_KEY_HEADER", "X-API-Key").strip() or "X-API-Key"

    payload = {
        "alert_id": alert.id,
        "external_alert_id": alert.external_alert_id,
        "timestamp": alert.timestamp.isoformat(),
        "rule_id": alert.rule_id,
        "rule_level": alert.rule_level,
        "severity": alert.severity,
        "rule_description": alert.rule_description,
        "source_ip": alert.source_ip,
        "agent_name": alert.agent_name,
        "raw_data": alert.raw_data,
    }

    headers = {"Content-Type": "application/json"}
    if api_key:
        headers[api_key_header] = api_key

    response = requests.post(endpoint, json=payload, headers=headers, timeout=timeout_seconds)
    response.raise_for_status()
    body = response.json()

    label_source = body.get("is_false_positive", body.get("classification"))
    is_false_positive = _as_bool(label_source)
    confidence = float(body.get("ml_confidence", body.get("confidence", 0.5)))
    if confidence < 0.0 or confidence > 1.0:
        raise ValueError("Remote classifier returned confidence outside [0, 1]")

    reasoning = str(body.get("reasoning", body.get("explanation", "Remote classifier completed without explanation.")))
    return is_false_positive, confidence, reasoning


def _apply_result(alert: Alert, is_false_positive: bool, confidence: float, reasoning: str, provider: str) -> dict[str, object]:
    alert.is_false_positive = is_false_positive
    alert.ml_confidence = confidence
    alert.ml_prediction_time = datetime.now(timezone.utc)
    alert.ml_classification_status = "classified"
    alert.ml_classification_last_error = None
    alert.ml_classification_next_retry_at = None
    alert.ml_classifier_provider = provider

    if is_false_positive and alert.status == "new":
        alert.status = "triaged"

    return {
        "classification_status": "classified",
        "is_false_positive": is_false_positive,
        "ml_confidence": confidence,
        "reasoning": reasoning,
        "provider": provider,
    }


def _set_pending(alert: Alert, error_message: str) -> dict[str, object]:
    max_attempts = _int_setting("ML_CLASSIFICATION_MAX_RETRIES", 5)
    retry_delay_minutes = _int_setting("ML_CLASSIFICATION_RETRY_DELAY_MINUTES", 10)

    alert.ml_classification_last_error = error_message[:1000]
    if alert.ml_classification_attempts >= max_attempts:
        alert.ml_classification_status = "failed"
        alert.ml_classification_next_retry_at = None
        status = "failed"
        reasoning = "Remote classification failed after maximum retries."
    else:
        alert.ml_classification_status = "pending"
        alert.ml_classification_next_retry_at = datetime.now(timezone.utc) + timedelta(minutes=retry_delay_minutes)
        status = "pending"
        reasoning = "Remote classifier unavailable. Alert marked pending for retry."

    alert.ml_classifier_provider = "remote"
    return {
        "classification_status": status,
        "is_false_positive": alert.is_false_positive,
        "ml_confidence": alert.ml_confidence,
        "reasoning": reasoning,
        "provider": "remote",
    }


def classify_alert(alert: Alert) -> dict[str, object]:
    alert.ml_classification_attempts = (alert.ml_classification_attempts or 0) + 1

    prefer_remote = os.getenv("ML_CLASSIFICATION_PROVIDER", "remote").strip().lower() == "remote"
    allow_local_fallback = os.getenv("ML_CLASSIFICATION_FALLBACK_LOCAL", "false").strip().lower() in {
        "1",
        "true",
        "yes",
    }

    if prefer_remote:
        try:
            is_false_positive, confidence, reasoning = _classify_with_remote(alert)
            return _apply_result(alert, is_false_positive, confidence, reasoning, provider="remote")
        except Exception as exc:
            if allow_local_fallback:
                is_false_positive, confidence, reasoning = _local_heuristic(alert)
                return _apply_result(
                    alert,
                    is_false_positive,
                    confidence,
                    f"Remote classifier unavailable ({exc}). Applied local fallback.",
                    provider="local-fallback",
                )
            return _set_pending(alert, str(exc))

    is_false_positive, confidence, reasoning = _local_heuristic(alert)
    return _apply_result(alert, is_false_positive, confidence, reasoning, provider="local")
