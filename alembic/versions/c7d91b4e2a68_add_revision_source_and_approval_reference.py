"""Add traceable source and approval reference to revision records.

Revision ID: c7d91b4e2a68
Revises: f4c7d2a9e821
Create Date: 2026-08-04
"""

from alembic import op
import sqlalchemy as sa


revision = "c7d91b4e2a68"
down_revision = "f4c7d2a9e821"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "content_revisions",
        sa.Column("source", sa.String(length=64), server_default="cms_api", nullable=False),
    )
    op.add_column(
        "content_revisions",
        sa.Column("approval_reference", sa.String(length=128), nullable=True),
    )
    op.create_index("ix_content_revisions_source", "content_revisions", ["source"])
    op.create_index(
        "ix_content_revisions_approval_reference",
        "content_revisions",
        ["approval_reference"],
    )


def downgrade() -> None:
    op.drop_index("ix_content_revisions_approval_reference", table_name="content_revisions")
    op.drop_index("ix_content_revisions_source", table_name="content_revisions")
    op.drop_column("content_revisions", "approval_reference")
    op.drop_column("content_revisions", "source")
