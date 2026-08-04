"""Add revision history and audit event tables.

Revision ID: f4c7d2a9e821
Revises: a3a214d9ba6c
Create Date: 2026-08-04
"""
from alembic import op
import sqlalchemy as sa


revision = "f4c7d2a9e821"
down_revision = "a3a214d9ba6c"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "content_revisions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("content_type", sa.String(length=32), nullable=False),
        sa.Column("content_id", sa.Integer(), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.Column("action", sa.String(length=32), nullable=False),
        sa.Column("snapshot", sa.JSON(), nullable=False),
        sa.Column("changed_fields", sa.JSON(), nullable=True),
        sa.Column("actor_id", sa.Integer(), nullable=True),
        sa.Column("status_reason", sa.Text(), nullable=True),
        sa.Column("restored_from_revision_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.UniqueConstraint("content_type", "content_id", "version", name="uq_content_revision_version"),
    )
    op.create_index("ix_content_revisions_content_type", "content_revisions", ["content_type"])
    op.create_index("ix_content_revisions_content_id", "content_revisions", ["content_id"])
    op.create_index("ix_content_revisions_action", "content_revisions", ["action"])
    op.create_index("ix_content_revisions_actor_id", "content_revisions", ["actor_id"])
    op.create_index("ix_content_revisions_created_at", "content_revisions", ["created_at"])

    op.create_table(
        "audit_events",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("event_type", sa.String(length=64), nullable=False),
        sa.Column("subject_type", sa.String(length=32), nullable=False),
        sa.Column("subject_id", sa.Integer(), nullable=True),
        sa.Column("actor_id", sa.Integer(), nullable=True),
        sa.Column("details", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
    )
    op.create_index("ix_audit_events_event_type", "audit_events", ["event_type"])
    op.create_index("ix_audit_events_subject_type", "audit_events", ["subject_type"])
    op.create_index("ix_audit_events_subject_id", "audit_events", ["subject_id"])
    op.create_index("ix_audit_events_actor_id", "audit_events", ["actor_id"])
    op.create_index("ix_audit_events_created_at", "audit_events", ["created_at"])


def downgrade() -> None:
    op.drop_table("audit_events")
    op.drop_table("content_revisions")
