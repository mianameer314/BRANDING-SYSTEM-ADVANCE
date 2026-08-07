from datetime import datetime, timedelta, timezone
from sqlalchemy import Integer, String, DateTime, JSON, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base

def _utc_now() -> datetime:
    return datetime.now(timezone.utc)

def get_default_expiration() -> datetime:
    return datetime.now(timezone.utc) + timedelta(hours=24)

class ApiIdempotencyRecord(Base):
    __tablename__ = "api_idempotency_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    idempotency_key: Mapped[str] = mapped_column(String(128), nullable=False)
    endpoint: Mapped[str] = mapped_column(String(255), nullable=False)
    request_fingerprint: Mapped[str] = mapped_column(String(64), nullable=False)
    response_status: Mapped[int] = mapped_column(Integer, nullable=False)
    response_body: Mapped[dict] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utc_now, index=True, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_default_expiration, index=True, nullable=False)

    __table_args__ = (
        UniqueConstraint("user_id", "endpoint", "idempotency_key", name="uq_api_idempotency_user_endpoint_key"),
    )
