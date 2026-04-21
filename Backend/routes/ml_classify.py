from fastapi import APIRouter

router = APIRouter()

@router.post("/classify")
def classify_alert(alert_data: dict):
    return {"status": "success", "classification": "benign", "confidence": 0.99}
