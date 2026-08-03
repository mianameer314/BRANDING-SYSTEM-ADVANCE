"""
Content validator.

Ensures a referenced content object actually exists before
creating likes, comments, favorites, downloads, etc.
"""

from sqlalchemy.orm import Session

from app.models.blog import Blog
from app.models.news import News
from app.models.case_study import CaseStudy
from app.models.insight import Insight
from app.models.project import Project
from app.models.resource import Resource

from fastapi import HTTPException, status

CONTENT_MODELS = {
    "blog": Blog,
    "news": News,
    "case_study": CaseStudy,
    "insight": Insight,
    "project": Project,
    "resource": Resource,
}


def validate_content_exists(
    db: Session,
    content_type: str,
    content_id: int,
):
    """
    Returns the content object if it exists.

    Raises:
        HTTPException: If the content type is invalid or the referenced content does not exist.
    """

    model = CONTENT_MODELS.get(content_type.lower())

    if model is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported content type '{content_type}'."
        )

    obj = (
        db.query(model)
        .filter(model.id == content_id)
        .first()
    )

    if obj is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{content_type.capitalize()} with ID {content_id} does not exist."
        )

    return obj