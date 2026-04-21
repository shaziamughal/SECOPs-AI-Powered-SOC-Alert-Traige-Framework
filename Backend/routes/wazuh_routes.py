from fastapi import APIRouter, HTTPException
import sys
import os

# Add parent directory to path to import wazuh_client
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from wazuh_client import WazuhClient

router = APIRouter()
wazuh_client = WazuhClient()

@router.get("/logs")
def get_wazuh_logs(limit: int = 10):
    """Fetch logs from Wazuh manager."""
    data = wazuh_client.get_logs(limit)
    
    # Check if this is our internal error dict or a Wazuh error response
    if isinstance(data, dict) and data.get("error") != 0:
        detail = data.get("detail") or data.get("message") or "Unknown error"
        raise HTTPException(status_code=500, detail=detail)
    return data

@router.get("/agents")
def get_wazuh_agents():
    """Fetch list of agents."""
    data = wazuh_client.get_agents()
    
    if isinstance(data, dict) and data.get("error") != 0:
        detail = data.get("detail") or data.get("message") or "Unknown error"
        raise HTTPException(status_code=500, detail=detail)
    return data
