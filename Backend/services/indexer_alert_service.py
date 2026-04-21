import os
from datetime import datetime, timedelta, timezone
from typing import Any

import requests
from dotenv import load_dotenv

load_dotenv()


class IndexerAlertService:
    def __init__(self) -> None:
        self.base_url = os.getenv("WAZUH_INDEXER_URL", "").rstrip("/")
        self.username = os.getenv("WAZUH_INDEXER_USERNAME", "")
        self.password = os.getenv("WAZUH_INDEXER_PASSWORD", "")
        self.index_pattern = os.getenv("WAZUH_INDEX_PATTERN", "wazuh-alerts-*")
        self.verify_ssl = os.getenv("WAZUH_VERIFY_SSL", "false").lower() == "true"

    def fetch_alerts(self, limit: int = 200, hours: int = 24) -> list[dict[str, Any]]:
        if not self.base_url or not self.username or not self.password:
            raise RuntimeError("Wazuh indexer credentials are not configured")

        query = {
            "size": limit,
            "sort": [{"timestamp": {"order": "desc"}}],
            "query": {
                "range": {
                    "timestamp": {
                        "gte": (datetime.now(timezone.utc) - timedelta(hours=hours)).isoformat(),
                    }
                }
            },
        }

        response = requests.get(
            f"{self.base_url}/{self.index_pattern}/_search",
            auth=(self.username, self.password),
            json=query,
            verify=self.verify_ssl,
            timeout=15,
        )
        response.raise_for_status()

        hits = response.json().get("hits", {}).get("hits", [])
        return [self.normalize_hit(hit) for hit in hits]

    def fetch_raw_alerts(self, limit: int = 50) -> list[dict[str, Any]]:
        if not self.base_url or not self.username or not self.password:
            raise RuntimeError("Wazuh indexer credentials are not configured")

        query = {
            "size": limit,
            "sort": [{"timestamp": {"order": "desc"}}],
            "query": {"match_all": {}},
        }

        response = requests.get(
            f"{self.base_url}/{self.index_pattern}/_search?pretty",
            auth=(self.username, self.password),
            json=query,
            verify=self.verify_ssl,
            timeout=20,
        )
        response.raise_for_status()
        return response.json().get("hits", {}).get("hits", [])

    def normalize_hit(self, hit: dict[str, Any]) -> dict[str, Any]:
        source = hit.get("_source", {})
        rule = source.get("rule", {})
        agent = source.get("agent", {})
        data = source.get("data", {})
        description = rule.get("description") or source.get("full_log") or "Wazuh alert"
        level = self._coerce_int(rule.get("level"))

        return {
            "external_alert_id": str(hit.get("_id") or source.get("id") or source.get("timestamp")),
            "timestamp": self._parse_timestamp(source.get("timestamp")),
            "rule_id": self._safe_str(rule.get("id")),
            "rule_level": level,
            "severity": self._severity_from_level(level),
            "rule_description": description,
            "source_ip": self._safe_str(
                data.get("srcip")
                or data.get("src_ip")
                or source.get("srcip")
                or source.get("src_ip")
            ),
            "agent_name": self._safe_str(agent.get("name")),
            "status": "new",
            "raw_data": source,
        }

    @staticmethod
    def _safe_str(value: Any) -> str | None:
        return None if value in (None, "") else str(value)

    @staticmethod
    def _coerce_int(value: Any) -> int | None:
        try:
            if value is None:
                return None
            return int(value)
        except (TypeError, ValueError):
            return None

    @staticmethod
    def _parse_timestamp(value: Any) -> datetime:
        if isinstance(value, datetime):
            return value if value.tzinfo else value.replace(tzinfo=timezone.utc)

        if not value:
            return datetime.now(timezone.utc)

        text = str(value).replace("Z", "+00:00")
        try:
            parsed = datetime.fromisoformat(text)
        except ValueError:
            return datetime.now(timezone.utc)
        return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)

    @staticmethod
    def _severity_from_level(level: int | None) -> str:
        if level is None:
            return "Info"
        if level >= 15:
            return "Critical"
        if level >= 10:
            return "High"
        if level >= 6:
            return "Medium"
        if level >= 3:
            return "Low"
        return "Info"
