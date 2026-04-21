import requests
from requests.auth import HTTPBasicAuth
import urllib3
import os

urllib3.disable_warnings()

class WazuhClient:
    def __init__(self):
        from dotenv import load_dotenv
        load_dotenv()
        
        self.base_url = os.getenv("WAZUH_API_URL", "https://192.168.40.47:55000")
        self.username = os.getenv("WAZUH_USERNAME", "wazuh")
        self.password = os.getenv("WAZUH_PASSWORD", "wazuh")
        self.token = None
        self.headers = {}
        # Don't authenticate on init - do it lazily when needed

    def authenticate(self):
        try:
            response = requests.post(
                f"{self.base_url}/security/user/authenticate",
                auth=HTTPBasicAuth(self.username, self.password),
                verify=False,
                timeout=10
            )
            if response.status_code == 200:
                self.token = response.json()["data"]["token"]
                self.headers = {"Authorization": f"Bearer {self.token}"}
            else:
                raise Exception(f"Auth failed: {response.text}")
        except Exception as e:
            raise Exception(f"Auth error: {str(e)}")

    def get_logs(self, limit=10):
        if not self.token:
            self.authenticate()
        
        try:
            response = requests.get(
                f"{self.base_url}/manager/logs",
                headers=self.headers,
                params={"limit": limit},
                verify=False,
                timeout=10
            )
            if response.status_code == 200:
                return response.json()
            return {"error": f"Status {response.status_code}", "detail": response.text}
        except Exception as e:
            return {"error": "Request failed", "detail": str(e)}

    def get_agents(self):
        if not self.token:
            self.authenticate()
            
        try:
            response = requests.get(
                f"{self.base_url}/agents",
                headers=self.headers,
                verify=False,
                timeout=10
            )
            if response.status_code == 200:
                return response.json()
            return {"error": f"Status {response.status_code}", "detail": response.text}
        except Exception as e:
            return {"error": "Request failed", "detail": str(e)}

if __name__ == "__main__":
    client = WazuhClient()
    client.authenticate()
    print(client.get_logs())
