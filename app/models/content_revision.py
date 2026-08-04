"""Immutable version snapshots for editorial content."""
from datetime import datetime

from sqlalchemy import DateTime, Integer, JSON, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class ContentRevision(Base):
    """One append-only snapshot of a Blog, News, Project, Insight, or Case Study."""

    __tablename__ = "content_revisions"
    __table_args__ = (
        UniqueConstraint("content_type", "content_id", "version", name="uq_content_revision_version"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    content_type: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    content_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    version: Mapped[int] = mapped_column(Integer, nullable=False)
    action: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    snapshot: Mapped[dict] = mapped_column(JSON, nullable=False)
    changed_fields: Mapped[list | None] = mapped_column(JSON, nullable=True)
    actor_id: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)
    source: Mapped[str] = mapped_column(
        String(64), nullable=False, default="cms_api", server_default="cms_api", index=True
    )
    approval_reference: Mapped[str | None] = mapped_column(String(128), nullable=True, index=True)
    status_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    restored_from_revision_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False, index=True
    )
