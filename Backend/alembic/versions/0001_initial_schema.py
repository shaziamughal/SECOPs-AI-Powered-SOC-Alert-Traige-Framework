"""initial schema

Revision ID: 0001_initial_schema
Revises:
Create Date: 2026-04-10
"""

from alembic import op
import sqlalchemy as sa


revision = "0001_initial_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("username", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("display_name", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=100), nullable=False, server_default="admin"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_users_id", "users", ["id"], unique=False)
    op.create_index("ix_users_username", "users", ["username"], unique=True)

    op.create_table(
        "alerts",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("external_alert_id", sa.String(length=255), nullable=False),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False),
        sa.Column("rule_id", sa.String(length=255), nullable=True),
        sa.Column("rule_level", sa.Integer(), nullable=True),
        sa.Column("severity", sa.String(length=50), nullable=False),
        sa.Column("rule_description", sa.Text(), nullable=False),
        sa.Column("source_ip", sa.String(length=255), nullable=True),
        sa.Column("agent_name", sa.String(length=255), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="new"),
        sa.Column("raw_data", sa.JSON(), nullable=True),
        sa.Column("is_false_positive", sa.Boolean(), nullable=True),
        sa.Column("ml_confidence", sa.Float(), nullable=True),
        sa.Column("ml_prediction_time", sa.DateTime(timezone=True), nullable=True),
        sa.Column("llm_summary", sa.Text(), nullable=True),
        sa.Column("iocs_extracted", sa.JSON(), nullable=True),
        sa.Column("investigation_plan", sa.JSON(), nullable=True),
        sa.Column("llm_enriched_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("action_taken", sa.String(length=255), nullable=True),
        sa.Column("analyst_notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_alerts_id", "alerts", ["id"], unique=False)
    op.create_index("ix_alerts_external_alert_id", "alerts", ["external_alert_id"], unique=True)
    op.create_index("ix_alerts_timestamp", "alerts", ["timestamp"], unique=False)
    op.create_index("ix_alerts_severity", "alerts", ["severity"], unique=False)
    op.create_index("ix_alerts_status", "alerts", ["status"], unique=False)
    op.create_index("ix_alerts_source_ip", "alerts", ["source_ip"], unique=False)
    op.create_index("ix_alerts_agent_name", "alerts", ["agent_name"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_alerts_agent_name", table_name="alerts")
    op.drop_index("ix_alerts_source_ip", table_name="alerts")
    op.drop_index("ix_alerts_status", table_name="alerts")
    op.drop_index("ix_alerts_severity", table_name="alerts")
    op.drop_index("ix_alerts_timestamp", table_name="alerts")
    op.drop_index("ix_alerts_external_alert_id", table_name="alerts")
    op.drop_index("ix_alerts_id", table_name="alerts")
    op.drop_table("alerts")

    op.drop_index("ix_users_username", table_name="users")
    op.drop_index("ix_users_id", table_name="users")
    op.drop_table("users")
