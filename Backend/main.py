# from fastapi import FastAPI
# from database import insert_alert, cursor
# from wazuh_client import WazuhClient

# app = FastAPI(title="SOC Alerts API")

# wazuh = WazuhClient()

# @app.get("/fetch-alerts")
# def fetch_alerts(limit: int = 50):
#     alerts = wazuh.get_alerts(limit)
#     for alert in alerts:
#         insert_alert(alert)
#     return {"status": "success", "alerts_fetched": len(alerts)}

# @app.get("/alerts")
# def get_alerts():
#     cursor.execute("SELECT * FROM wazuh_alerts ORDER BY timestamp DESC LIMIT 50")
#     rows = cursor.fetchall()
#     data = [
#         {
#             "id": r[0],
#             "rule_id": r[1],
#             "rule_level": r[2],
#             "rule_description": r[3],
#             "agent_name": r[4],
#             "timestamp": r[5],
#             "raw": r[6]
#         } for r in rows
#     ]
#     return {"alerts": data}


import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import alerts, auth, wazuh
from services.bootstrap import bootstrap_database


@asynccontextmanager
async def lifespan(_: FastAPI):
    bootstrap_database()
    yield


app = FastAPI(title="SOC Triage Platform API", lifespan=lifespan)


def _allowed_frontend_origins() -> list[str]:
    configured = os.getenv("FRONTEND_ORIGINS", "").strip()
    if configured:
        return [origin.strip() for origin in configured.split(",") if origin.strip()]
    return ["http://localhost:5173", "http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_frontend_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(wazuh.router, prefix="/api/wazuh", tags=["Wazuh"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["Alerts"])
