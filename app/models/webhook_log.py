"""
Webhook Log model — audit trail of webhook delivery attempts.
"""
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String, Text, ForeignKey, func
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

    webhook = relationship("Webhook", back_populates="logs")
