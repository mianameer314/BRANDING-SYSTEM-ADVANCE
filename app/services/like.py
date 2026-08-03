"""
Like service.
"""

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.like import Like
from app.schemas.like import LikeCreate
from app.services.content_validator import validate_content_exists


def add_like(
    db: Session,
    user_id: int,
    data: LikeCreate,
) -> Like | None:
    """
    Add a like for the authenticated user.

    Raises:
        ValueError: Invalid content type.
        LookupError: Referenced content does not exist.
    """

    # Validate referenced content exists
    validate_content_exists(
        db=db,
        content_type=data.content_type,
        content_id=data.content_id,
    )

    like = Like(
        user_id=user_id,
        content_type=data.content_type,
        content_id=data.content_id,
    )

    try:
        db.add(like)
        db.commit()
        db.refresh(like)
        return like

    except IntegrityError:
        db.rollback()
        return None  # Already liked


def remove_like(
    db: Session,
    user_id: int,
    like_id: int,
) -> bool:
    """
    Remove a like belonging to the authenticated user.
    """

    like = (
        db.query(Like)
        .filter(
            Like.id == like_id,
            Like.user_id == user_id,
        )
        .first()
    )

    if like is None:
        return False

    db.delete(like)
    db.commit()

    return True


def check_like(
    db: Session,
    user_id: int,
    content_type: str,
    content_id: int,
) -> bool:
    """
    Check whether the authenticated user has liked
    the specified content.
    """

    return (
        db.query(Like)
        .filter(
            Like.user_id == user_id,
            Like.content_type == content_type,
            Like.content_id == content_id,
        )
        .first()
        is not None
    )