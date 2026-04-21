from datetime import datetime, timedelta, timezone
import logging

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app_models import Alert
from app_schemas import StatsResponse, SyncResponse
from db import get_db
from services.auth import get_current_user
from services.indexer_alert_service import IndexerAlertService
from services.ml_service import classify_alert
from services.wazuh_manager_service import WazuhManagerService

router = APIRouter()
logger = logging.getLogger(__name__)

indexer_service = IndexerAlertService()
manager_service = WazuhManagerService()


@router.post("/sync", response_model=SyncResponse)
def sync_alerts(
    hours: int = Query(default=24, ge=1, le=168),
    limit: int = Query(default=200, ge=1, le=1000),
    _: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        alerts = indexer_service.fetch_alerts(limit=limit, hours=hours)
    except Exception as exc:
        logger.exception("Wazuh alert sync failed")
        raise HTTPException(status_code=502, detail="Failed to sync alerts from Wazuh") from exc

    new_alerts = 0
    updated_alerts = 0
    auto_classified = 0
    pending_classification = 0
    for alert_data in alerts:
        existing = db.query(Alert).filter(Alert.external_alert_id == alert_data["external_alert_id"]).first()
        if existing:
            updated_alerts += 1
            continue

        alert = Alert(**alert_data)
        classify_result = classify_alert(alert)
        if classify_result["classification_status"] == "classified":
            auto_classified += 1
        else:
            pending_classification += 1
        db.add(alert)
        new_alerts += 1

    db.commit()
    return SyncResponse(
        status="success",
        message=f"Processed {len(alerts)} alerts",
        new_alerts=new_alerts,
        updated_alerts=updated_alerts,
        total_processed=len(alerts),
        auto_classified=auto_classified,
        pending_classification=pending_classification,
    )


@router.get("/stats", response_model=StatsResponse)
def get_stats(
    hours: int = Query(default=24, ge=1, le=168),
    _: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    time_threshold = datetime.now(timezone.utc) - timedelta(hours=hours)
    base_query = db.query(Alert).filter(Alert.timestamp >= time_threshold)

    return StatsResponse(
        total_alerts=base_query.count(),
        critical_alerts=base_query.filter(Alert.severity == "Critical").count(),
        high_alerts=base_query.filter(Alert.severity == "High").count(),
        false_positives=base_query.filter(Alert.is_false_positive.is_(True)).count(),
        llm_enriched=base_query.filter(Alert.llm_summary.isnot(None)).count(),
        open_alerts=base_query.filter(Alert.status == "new").count(),
        investigating_alerts=base_query.filter(Alert.status == "investigating").count(),
    )


@router.get("/agents")
def get_agents(_: dict = Depends(get_current_user)):
    try:
        return manager_service.get_agents()
    except Exception as exc:
        logger.exception("Wazuh agents request failed")
        raise HTTPException(status_code=502, detail="Failed to fetch Wazuh agents") from exc


@router.get("/logs")
def get_logs(
    limit: int = Query(default=25, ge=1, le=200),
    _: dict = Depends(get_current_user),
):
    try:
        return manager_service.get_logs(limit=limit)
    except Exception as exc:
        logger.exception("Wazuh logs request failed")
        raise HTTPException(status_code=502, detail="Failed to fetch Wazuh logs") from exc


@router.get("/indexer-alerts")
def get_indexer_alerts(
    limit: int = Query(default=50, ge=1, le=500),
    _: dict = Depends(get_current_user),
):
    try:
        alerts = indexer_service.fetch_raw_alerts(limit=limit)
        return {
            "data": {
                "affected_items": alerts,
                "total_affected_items": len(alerts),
            }
        }
    except Exception as exc:
        logger.exception("Wazuh indexer alerts request failed")
        raise HTTPException(status_code=502, detail="Failed to fetch Wazuh indexer alerts") from exc
