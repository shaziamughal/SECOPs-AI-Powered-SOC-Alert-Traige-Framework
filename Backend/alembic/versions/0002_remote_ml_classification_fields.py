"""add remote ml classification lifecycle fields

Revision ID: 0002_remote_ml_classification_fields
Revises: 0001_initial_schema
Create Date: 2026-04-10
"""

from alembic import op
import sqlalchemy as sa


revision = "0002_remote_ml_classification_fields"
down_revision = "0001_initial_schema"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "alerts",
        sa.Column("ml_classification_status", sa.String(length=50), nullable=False, server_default="unclassified"),
    )
    op.add_column(
        "alerts",
        sa.Column("ml_classification_attempts", sa.Integer(), nullable=False, server_default="0"),
    )
    op.add_column("alerts", sa.Column("ml_classification_last_error", sa.Text(), nullable=True))
    op.add_column("alerts", sa.Column("ml_classification_next_retry_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("alerts", sa.Column("ml_classifier_provider", sa.String(length=50), nullable=True))

    op.create_index("ix_alerts_ml_classification_status", "alerts", ["ml_classification_status"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_alerts_ml_classification_status", table_name="alerts")
    op.drop_column("alerts", "ml_classifier_provider")
    op.drop_column("alerts", "ml_classification_next_retry_at")
    op.drop_column("alerts", "ml_classification_last_error")
    op.drop_column("alerts", "ml_classification_attempts")
    op.drop_column("alerts", "ml_classification_status")
