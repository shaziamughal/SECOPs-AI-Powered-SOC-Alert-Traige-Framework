from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Float, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from db import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    display_name: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(100), default="admin")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
    )


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    external_alert_id: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    rule_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    rule_level: Mapped[int | None] = mapped_column(Integer, nullable=True)
    severity: Mapped[str] = mapped_column(String(50), index=True)
    rule_description: Mapped[str] = mapped_column(Text)
    source_ip: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    agent_name: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    status: Mapped[str] = mapped_column(String(50), default="new", index=True)
    raw_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    is_false_positive: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    ml_confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    ml_prediction_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    ml_classification_status: Mapped[str] = mapped_column(String(50), default="unclassified", index=True)
    ml_classification_attempts: Mapped[int] = mapped_column(Integer, default=0)
    ml_classification_last_error: Mapped[str | None] = mapped_column(Text, nullable=True)
    ml_classification_next_retry_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    ml_classifier_provider: Mapped[str | None] = mapped_column(String(50), nullable=True)
    llm_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    iocs_extracted: Mapped[list | dict | None] = mapped_column(JSON, nullable=True)
    investigation_plan: Mapped[list | dict | None] = mapped_column(JSON, nullable=True)
    llm_enriched_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    action_taken: Mapped[str | None] = mapped_column(String(255), nullable=True)
    analyst_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
    )
