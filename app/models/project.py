"""
Project model — showcase of work/products the company has built.
"""
from datetime import datetime

from sqlalchemy import JSON, Boolean, DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base
from app.models.base import ContentMixin


class Project(ContentMixin, Base):
    __tablename__ = "projects"

    name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    client: Mapped[str | None] = mapped_column(String(200), nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    short_desc: Mapped[str | None] = mapped_column(String(300), nullable=True)
    gallery: Mapped[list | None] = mapped_column(JSON, nullable=True, default=list)
    technologies: Mapped[list | None] = mapped_column(JSON, nullable=True, default=list)
    category: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    project_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
