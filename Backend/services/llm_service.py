import json
import os
import re
from datetime import datetime, timezone
from typing import Any

import requests

from app_models import Alert

IP_REGEX = re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b")
DOMAIN_REGEX = re.compile(r"\b(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}\b")
SHA256_REGEX = re.compile(r"\b[a-fA-F0-9]{64}\b")


def _extract_iocs(text: str) -> list[dict[str, str]]:
    items: list[dict[str, str]] = []
    seen: set[tuple[str, str]] = set()

    for value in IP_REGEX.findall(text):
        key = ("ip", value)
        if key not in seen:
            seen.add(key)
            items.append({"type": "ip", "value": value})

    for value in DOMAIN_REGEX.findall(text):
        if value.count(".") < 1 or value.replace(".", "").isdigit():
            continue
        key = ("domain", value)
        if key not in seen:
            seen.add(key)
            items.append({"type": "domain", "value": value})

    for value in SHA256_REGEX.findall(text):
        key = ("sha256", value.lower())
        if key not in seen:
            seen.add(key)
            items.append({"type": "sha256", "value": value.lower()})

    return items


def _build_investigation_plan(alert: Alert, iocs: list[dict[str, str]]) -> list[str]:
    plan = [
        "Validate the triggering rule and review the original Wazuh payload.",
        "Confirm host ownership and recent activity for the impacted endpoint.",
    ]
    if iocs:
        plan.append("Check extracted IOCs against internal threat intel and blocking controls.")
    if alert.source_ip:
        plan.append(f"Investigate network activity related to source IP {alert.source_ip}.")
    if alert.severity in {"Critical", "High"}:
        plan.append("Escalate for immediate containment and isolate the affected host if necessary.")
    else:
        plan.append("Correlate with adjacent low-severity events before closing as benign.")
    return plan


def _heuristic_summary(alert: Alert, iocs: list[dict[str, str]]) -> str:
    ioc_text = ", ".join(f"{item['type']}:{item['value']}" for item in iocs[:5]) or "no obvious IOCs"
    return (
        f"{alert.severity} alert triggered by rule "
        f"{alert.rule_id or 'unknown'} on {alert.agent_name or 'an unmanaged source'}. "
        f"The event references {ioc_text} and should be reviewed alongside the raw Wazuh payload."
    )


def _normalize_iocs(value: Any) -> list[dict[str, str]]:
    if not isinstance(value, list):
        return []

    normalized: list[dict[str, str]] = []
    for item in value:
        if isinstance(item, dict):
            item_type = str(item.get("type", "ioc")).strip() or "ioc"
            item_value = str(item.get("value", "")).strip()
            if item_value:
                normalized.append({"type": item_type, "value": item_value})
        elif isinstance(item, str) and item.strip():
            normalized.append({"type": "ioc", "value": item.strip()})
    return normalized


def _normalize_plan(value: Any) -> list[str]:
    if isinstance(value, list):
        return [str(step).strip() for step in value if str(step).strip()]
    if isinstance(value, str) and value.strip():
        return [value.strip()]
    return []


def _remote_enrichment(alert: Alert) -> dict[str, Any] | None:
    remote_url = os.getenv("LLM_REMOTE_URL", "").strip()
    if not remote_url:
        return None

    timeout = int(os.getenv("LLM_REMOTE_TIMEOUT_SECONDS", "20"))
    api_key = os.getenv("LLM_REMOTE_API_KEY", "").strip()
    api_key_header = os.getenv("LLM_REMOTE_API_KEY_HEADER", "X-API-Key").strip() or "X-API-Key"

    headers: dict[str, str] = {"Content-Type": "application/json"}
    if api_key:
        headers[api_key_header] = api_key

    alert_payload = {
        "id": alert.id,
        "external_alert_id": alert.external_alert_id,
        "timestamp": alert.timestamp.isoformat() if alert.timestamp else None,
        "severity": alert.severity,
        "rule_id": alert.rule_id,
        "rule_level": alert.rule_level,
        "rule_description": alert.rule_description,
        "source_ip": alert.source_ip,
        "agent_name": alert.agent_name,
        "status": alert.status,
        "raw_data": alert.raw_data or {},
    }
    payload = {"alert": json.dumps(alert_payload, ensure_ascii=True)}

    response = requests.post(
        remote_url,
        headers=headers,
        json=payload,
        timeout=timeout,
    )
    response.raise_for_status()
    data = response.json()
    return data if isinstance(data, dict) else None


def _gemini_summary(alert: Alert, iocs: list[dict[str, str]]) -> str | None:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None

    prompt = (
        "You are assisting a SOC analyst. Summarize the alert in 3 concise sentences.\n"
        f"Severity: {alert.severity}\n"
        f"Rule description: {alert.rule_description}\n"
        f"Agent: {alert.agent_name}\n"
        f"Source IP: {alert.source_ip}\n"
        f"IOCs: {json.dumps(iocs)}\n"
        f"Raw alert: {json.dumps(alert.raw_data or {}, ensure_ascii=True)}"
    )
    response = requests.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
        params={"key": api_key},
        json={"contents": [{"parts": [{"text": prompt}]}]},
        timeout=20,
    )
    response.raise_for_status()
    payload = response.json()
    candidates = payload.get("candidates", [])
    if not candidates:
        return None

    parts = candidates[0].get("content", {}).get("parts", [])
    text = "".join(part.get("text", "") for part in parts).strip()
    return text or None


def enrich_alert(alert: Alert) -> dict[str, object]:
    raw_text = json.dumps(alert.raw_data or {}, ensure_ascii=True)
    combined_text = f"{alert.rule_description}\n{raw_text}"
    iocs = _extract_iocs(combined_text)
    investigation_plan = _build_investigation_plan(alert, iocs)

    provider = "heuristic"
    summary = _heuristic_summary(alert, iocs)

    try:
        remote = _remote_enrichment(alert)
        if remote:
            remote_summary = (
                remote.get("llm_summary")
                or remote.get("summary")
                or remote.get("analysis")
                or remote.get("result")
            )
            remote_iocs = _normalize_iocs(
                remote.get("iocs_extracted")
                or remote.get("iocs")
                or remote.get("indicators")
            )
            remote_plan = _normalize_plan(
                remote.get("investigation_plan")
                or remote.get("plan")
                or remote.get("recommended_actions")
            )

            if isinstance(remote_summary, str) and remote_summary.strip():
                summary = remote_summary.strip()
                provider = "remote"
            if remote_iocs:
                iocs = remote_iocs
            if remote_plan:
                investigation_plan = remote_plan
    except Exception:
        provider = "heuristic"

    try:
        gemini_summary = _gemini_summary(alert, iocs)
        if gemini_summary and provider != "remote":
            summary = gemini_summary
            provider = "gemini"
    except Exception:
        if provider not in {"remote", "gemini"}:
            provider = "heuristic"

    alert.llm_summary = summary
    alert.iocs_extracted = iocs
    alert.investigation_plan = investigation_plan
    alert.llm_enriched_at = datetime.now(timezone.utc)
    if alert.status == "new":
        alert.status = "investigating"

    return {
        "llm_summary": summary,
        "iocs_extracted": iocs,
        "investigation_plan": investigation_plan,
        "provider": provider,
    }
