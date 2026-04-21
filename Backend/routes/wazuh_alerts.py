from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from database import get_db
from services.wazuh_service import WazuhService
from models import Alert
from schemas import AlertResponse
from typing import List
from datetime import datetime

router = APIRouter()
wazuh_service = WazuhService()

@router.post("/sync")
async def sync_wazuh_alerts(
    background_tasks: BackgroundTasks,
    hours: int = 24,
    db: Session = Depends(get_db)
):
    """
    Fetch alerts from Wazuh and store in database
    """
    try:
        # Fetch alerts from Wazuh
        alerts = wazuh_service.fetch_alerts(limit=500, hours=hours)
        
        new_alerts = 0
        updated_alerts = 0
        
        for alert_data in alerts:
            # Check if alert already exists
            existing = db.query(Alert).filter(
                Alert.alert_id == alert_data["alert_id"]
            ).first()
            
            if existing:
                updated_alerts += 1
                continue
            
            # Create new alert
            new_alert = Alert(
                alert_id=alert_data["alert_id"],
                timestamp=datetime.fromisoformat(alert_data["timestamp"].replace('Z', '+00:00')),
                severity=alert_data["severity"],
                rule_id=alert_data["rule_id"],
                rule_description=alert_data["rule_description"],
                source_ip=alert_data["source_ip"],
                agent_name=alert_data["agent_name"],
                raw_data=alert_data["raw_data"]
            )
            
            db.add(new_alert)
            new_alerts += 1
        
        db.commit()
        
        return {
            "status": "success",
            "message": f"Synced {new_alerts} new alerts, {updated_alerts} already existed",
            "new_alerts": new_alerts,
            "total_processed": len(alerts)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[AlertResponse])
def get_alerts(
    skip: int = 0,
    limit: int = 100,
    severity: str = None,
    db: Session = Depends(get_db)
):
    """Get alerts from database with filters"""
    query = db.query(Alert)
    
    if severity:
        query = query.filter(Alert.severity == severity.upper())
    
    alerts = query.order_by(Alert.timestamp.desc()).offset(skip).limit(limit).all()
    return alerts

@router.get("/stats")
def get_alert_stats(hours: int = 24, db: Session = Depends(get_db)):
    """Get dashboard statistics"""
    from datetime import datetime, timedelta
    from sqlalchemy import func
    
    time_threshold = datetime.utcnow() - timedelta(hours=hours)
    
    # Total alerts
    total = db.query(func.count(Alert.id)).filter(
        Alert.timestamp >= time_threshold
    ).scalar()
    
    # High priority
    high_priority = db.query(func.count(Alert.id)).filter(
        Alert.timestamp >= time_threshold,
        Alert.severity == "HIGH"
    ).scalar()
    
    # False positives (ML classified)
    false_positives = db.query(func.count(Alert.id)).filter(
        Alert.timestamp >= time_threshold,
        Alert.is_false_positive == True,
        Alert.ml_confidence >= 0.9
    ).scalar()
    
    # LLM enriched
    llm_enriched = db.query(func.count(Alert.id)).filter(
        Alert.timestamp >= time_threshold,
        Alert.llm_summary.isnot(None)
    ).scalar()
    
    return {
        "total_alerts": total or 0,
        "high_priority": high_priority or 0,
        "false_positives": false_positives or 0,
        "llm_enriched": llm_enriched or 0
    }