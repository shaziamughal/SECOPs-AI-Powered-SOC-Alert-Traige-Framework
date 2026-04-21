from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app_models import Alert
from app_schemas import (
    AlertListResponse,
    AlertResponse,
    AlertUpdateRequest,
    ClassificationResponse,
    EnrichmentResponse,
)
from db import get_db
from services.auth import get_current_user
from services.llm_service import enrich_alert
from services.ml_service import classify_alert

router = APIRouter()


@router.post("/classify/retry-pending")
def retry_pending_classifications(
    limit: int = Query(default=50, ge=1, le=500),
    _: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    now = datetime.now(timezone.utc)
    candidates = (
        db.query(Alert)
        .filter(
            Alert.ml_classification_status.in_(["pending", "failed"]),
            or_(
                Alert.ml_classification_next_retry_at.is_(None),
                Alert.ml_classification_next_retry_at <= now,
            ),
        )
        .order_by(Alert.updated_at.asc())
        .limit(limit)
        .all()
    )

    classified = 0
    still_pending = 0
    failed = 0

    for alert in candidates:
        result = classify_alert(alert)
        if result["classification_status"] == "classified":
            classified += 1
        elif result["classification_status"] == "pending":
            still_pending += 1
        else:
            failed += 1
        db.add(alert)

    db.commit()
    return {
        "processed": len(candidates),
        "classified": classified,
        "pending": still_pending,
        "failed": failed,
    }


@router.get("/", response_model=AlertListResponse)
def get_alerts(
    limit: int = Query(default=25, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    severity: str | None = None,
    status: str | None = None,
    search: str | None = None,
    _: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Alert)

    if severity:
        query = query.filter(Alert.severity == severity)
    if status:
        query = query.filter(Alert.status == status)
    if search:
        pattern = f"%{search.lower()}%"
        query = query.filter(
            or_(
                func.lower(Alert.rule_description).like(pattern),
                func.lower(func.coalesce(Alert.source_ip, "")).like(pattern),
                func.lower(func.coalesce(Alert.agent_name, "")).like(pattern),
                func.lower(Alert.external_alert_id).like(pattern),
            )
        )

    total = query.count()
    items = query.order_by(Alert.timestamp.desc()).offset(offset).limit(limit).all()
    return AlertListResponse(items=items, total=total)


@router.get("/{alert_id}", response_model=AlertResponse)
def get_alert(
    alert_id: int,
    _: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert


@router.patch("/{alert_id}", response_model=AlertResponse)
def update_alert(
    alert_id: int,
    payload: AlertUpdateRequest,
    _: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    data = payload.model_dump(exclude_none=True)
    for key, value in data.items():
        setattr(alert, key, value)

    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert


@router.post("/{alert_id}/classify", response_model=ClassificationResponse)
def classify_alert_route(
    alert_id: int,
    _: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    result = classify_alert(alert)
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return ClassificationResponse(alert_id=alert.id, **result)


@router.post("/{alert_id}/enrich", response_model=EnrichmentResponse)
def enrich_alert_route(
    alert_id: int,
    _: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    result = enrich_alert(alert)
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return EnrichmentResponse(alert_id=alert.id, **result)
