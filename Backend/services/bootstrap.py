import os

from sqlalchemy import inspect, text
from sqlalchemy.orm import Session

from app_models import User
from db import Base, SessionLocal, engine
from services.auth import hash_password


EXPECTED_ALERT_COLUMNS = {
    "id",
    "external_alert_id",
    "timestamp",
    "rule_id",
    "rule_level",
    "severity",
    "rule_description",
    "source_ip",
    "agent_name",
    "status",
    "raw_data",
    "is_false_positive",
    "ml_confidence",
    "ml_prediction_time",
    "ml_classification_status",
    "ml_classification_attempts",
    "ml_classification_last_error",
    "ml_classification_next_retry_at",
    "ml_classifier_provider",
    "llm_summary",
    "iocs_extracted",
    "investigation_plan",
    "llm_enriched_at",
    "action_taken",
    "analyst_notes",
    "created_at",
    "updated_at",
}


def _table_count(db: Session, table_name: str) -> int:
    return int(db.execute(text(f"SELECT COUNT(*) FROM {table_name}")).scalar_one())


def _drop_legacy_tables(db: Session) -> None:
    inspector = inspect(engine)
    table_names = set(inspector.get_table_names())

    if "alerts" in table_names:
        existing_columns = {column["name"] for column in inspector.get_columns("alerts")}
        if existing_columns != EXPECTED_ALERT_COLUMNS:
            if _table_count(db, "alerts") > 0:
                raise RuntimeError("Existing alerts table uses an incompatible schema and contains data")
            db.execute(text("DROP TABLE alerts"))
            db.commit()

    if "wazuh_alerts" in table_names:
        if _table_count(db, "wazuh_alerts") > 0:
            raise RuntimeError("Legacy wazuh_alerts table still contains data and must be migrated before startup")
        db.execute(text("DROP TABLE wazuh_alerts"))
        db.commit()


def bootstrap_database() -> None:
    db: Session = SessionLocal()
    try:
        _drop_legacy_tables(db)
        Base.metadata.create_all(bind=engine)

        admin_username = os.getenv("ADMIN_USERNAME", "admin")
        existing = db.query(User).filter(User.username == admin_username).first()
        if existing:
            return

        admin_password = os.getenv("ADMIN_PASSWORD", "")
        admin_display_name = os.getenv("ADMIN_DISPLAY_NAME", "Admin Analyst")

        if not admin_password:
            raise RuntimeError("ADMIN_PASSWORD must be set before first bootstrap")

        user = User(
            username=admin_username,
            password_hash=hash_password(admin_password),
            display_name=admin_display_name,
            role="admin",
        )
        db.add(user)
        db.commit()
    finally:
        db.close()
