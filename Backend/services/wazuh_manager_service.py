import os
from typing import Any

import requests
from dotenv import load_dotenv
from requests.auth import HTTPBasicAuth

load_dotenv()


class WazuhManagerService:
    def __init__(self) -> None:
        self.base_url = os.getenv("WAZUH_API_URL", "").rstrip("/")
        self.username = os.getenv("WAZUH_USERNAME", "")
        self.password = os.getenv("WAZUH_PASSWORD", "")
        self.verify_ssl = os.getenv("WAZUH_VERIFY_SSL", "false").lower() == "true"
        self.token: str | None = None

    def _authenticate(self) -> None:
        if self.token:
            return
        if not self.base_url or not self.username or not self.password:
            raise RuntimeError("Wazuh manager credentials are not configured")

        response = requests.post(
            f"{self.base_url}/security/user/authenticate",
            auth=HTTPBasicAuth(self.username, self.password),
            verify=self.verify_ssl,
            timeout=10,
        )
        response.raise_for_status()
        self.token = response.json()["data"]["token"]

    def _get(self, path: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
        self._authenticate()
        response = requests.get(
            f"{self.base_url}{path}",
            headers={"Authorization": f"Bearer {self.token}"},
            params=params,
            verify=self.verify_ssl,
            timeout=10,
        )
        response.raise_for_status()
        return response.json()

    def get_logs(self, limit: int = 25) -> dict[str, Any]:
        return self._get("/manager/logs", params={"limit": limit})

    def get_agents(self) -> dict[str, Any]:
        return self._get("/agents")
