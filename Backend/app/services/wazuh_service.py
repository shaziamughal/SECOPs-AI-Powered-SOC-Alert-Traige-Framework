from app.integrations.wazuh_client import WazuhClient

# WazuhClient reads configuration from environment variables automatically
wazuh = WazuhClient()

def fetch_latest_alerts(limit=50):
    """Fetch manager logs from Wazuh (currently maps to get_logs)"""
    return wazuh.get_logs(limit)

def fetch_agents():
    """Fetch list of Wazuh agents"""
    return wazuh.get_agents()

