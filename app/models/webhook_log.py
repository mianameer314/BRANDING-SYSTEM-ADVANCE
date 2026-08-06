"""
Webhook Log model — audit trail of webhook delivery attempts.
"""
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String, Text, ForeignKey, func, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class WebhookLog(Base):
    __tablename__ = "webhook_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    webhook_id: Mapped[int] = mapped_column(Integer, ForeignKey("webhooks.id", ondelete="CASCADE"), index=True)
    
    event: Mapped[str] = mapped_column(String(50), nullable=False)
    content_type: Mapped[str] = mapped_column(String(30), nullable=False)
    content_id: Mapped[int] = mapped_column(Integer, nullable=False)
    
    request_url: Mapped[str] = mapped_column(String(2048), nullable=False)
    request_body: Mapped[str] = mapped_column(Text, nullable=False)
    
    response_status: Mapped[int | None] = mapped_column(Integer, nullable=True)
    response_body: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    success: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    delivered_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    
    delivery_id: Mapped[str | None] = mapped_column(String(36), nullable=True, unique=True, index=True)
    dedup_key: Mapped[str | None] = mapped_column(String(64), nullable=True)

    __table_args__ = (
        UniqueConstraint("webhook_id", "dedup_key", name="uq_webhook_log_webhook_dedup"),
    )

    webhook = relationship("Webhook", back_populates="logs")
