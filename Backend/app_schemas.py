from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    display_name: str
    role: str


class LoginRequest(BaseModel):
    username: str
    password: str


class AuthResponse(BaseModel):
    authenticated: bool
    user: UserResponse | None = None


class AlertUpdateRequest(BaseModel):
    status: str | None = None
    action_taken: str | None = None
    analyst_notes: str | None = None


class AlertResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    external_alert_id: str
    timestamp: datetime
    rule_id: str | None = None
    rule_level: int | None = None
    severity: str
    rule_description: str
    source_ip: str | None = None
    agent_name: str | None = None
    status: str
    raw_data: dict[str, Any] | None = None
    is_false_positive: bool | None = None
    ml_confidence: float | None = None
    ml_prediction_time: datetime | None = None
    ml_classification_status: str
    ml_classification_attempts: int
    ml_classification_last_error: str | None = None
    ml_classification_next_retry_at: datetime | None = None
    ml_classifier_provider: str | None = None
    llm_summary: str | None = None
    iocs_extracted: list[dict[str, Any]] | dict[str, Any] | None = None
    investigation_plan: list[str] | dict[str, Any] | None = None
    llm_enriched_at: datetime | None = None
    action_taken: str | None = None
    analyst_notes: str | None = None


class AlertListResponse(BaseModel):
    items: list[AlertResponse]
    total: int


class StatsResponse(BaseModel):
    total_alerts: int
    critical_alerts: int
    high_alerts: int
    false_positives: int
    llm_enriched: int
    open_alerts: int
    investigating_alerts: int


class SyncResponse(BaseModel):
    status: str
    message: str
    new_alerts: int
    updated_alerts: int
    total_processed: int
    auto_classified: int = 0
    pending_classification: int = 0


class ClassificationResponse(BaseModel):
    alert_id: int
    classification_status: str
    is_false_positive: bool | None = None
    ml_confidence: float | None = Field(default=None, ge=0.0, le=1.0)
    reasoning: str
    provider: str


class EnrichmentResponse(BaseModel):
    alert_id: int
    llm_summary: str
    iocs_extracted: list[dict[str, Any]]
    investigation_plan: list[str]
    provider: str
