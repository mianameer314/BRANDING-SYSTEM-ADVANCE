"""
CaseStudy model — detailed client success stories with metrics.
Most complex content type in the system.
"""
from sqlalchemy import JSON, Boolean, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base
from app.models.base import ContentMixin


class CaseStudy(ContentMixin, Base):
    __tablename__ = "case_studies"

    title: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    client_name: Mapped[str] = mapped_column(String(200), nullable=False)
    client_logo: Mapped[str | None] = mapped_column(Text, nullable=True)
    industry: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    challenge: Mapped[str] = mapped_column(Text, nullable=False)
    solution: Mapped[str] = mapped_column(Text, nullable=False)
    results: Mapped[str] = mapped_column(Text, nullable=False)
    metrics: Mapped[list | None] = mapped_column(JSON, nullable=True, default=list)
    testimonial: Mapped[str | None] = mapped_column(Text, nullable=True)
    testimonial_author: Mapped[str | None] = mapped_column(String(200), nullable=True)
    gallery: Mapped[list | None] = mapped_column(JSON, nullable=True, default=list)
    technologies: Mapped[list | None] = mapped_column(JSON, nullable=True, default=list)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
