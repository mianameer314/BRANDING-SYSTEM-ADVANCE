"""
Webhook model — registers external endpoints to be notified on publish events.
"""
from datetime import datetime

from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy import Boolean, DateTime, Integer, JSON, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


# PostgreSQL stores webhook subscriptions as a native ARRAY.  The test suite
# uses SQLite, which cannot compile ARRAY, so it stores the same Python list as
# JSON.  The base type remains ARRAY for production PostgreSQL and migrations.
WEBHOOK_CONTENT_TYPES = ARRAY(String).with_variant(JSON(), "sqlite")


class Webhook(Base):
    __tablename__ = "webhooks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    url: Mapped[str] = mapped_column(String(2048), nullable=False)
    event: Mapped[str] = mapped_column(String(50), nullable=False)
    content_types: Mapped[list[str]] = mapped_column(
        WEBHOOK_CONTENT_TYPES, nullable=False, default=list
    )
    secret: Mapped[str] = mapped_column(String(128), nullable=False)
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    logs = relationship("WebhookLog", back_populates="webhook")
