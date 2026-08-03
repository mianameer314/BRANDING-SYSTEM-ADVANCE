"""
News model — short, timely announcements.
"""
from sqlalchemy import Boolean, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base
from app.models.base import ContentMixin


class News(ContentMixin, Base):
    __tablename__ = "news"

    headline: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    source: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
