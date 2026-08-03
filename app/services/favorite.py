"""
Favorite service.
"""

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.favorite import Favorite
from app.schemas.favorite import FavoriteCreate
from app.services.content_validator import validate_content_exists


def add_favorite(
    db: Session,
    user_id: int,
    data: FavoriteCreate,
) -> Favorite | None:
    """
    Add a favorite for the authenticated user.

    Raises:
        ValueError: Invalid content_type.
        LookupError: Referenced content does not exist.
    """

    # Validate referenced content
    validate_content_exists(
        db=db,
        content_type=data.content_type,
        content_id=data.content_id,
    )

    favorite = Favorite(
        user_id=user_id,
        content_type=data.content_type,
        content_id=data.content_id,
    )

    try:
        db.add(favorite)
        db.commit()
        db.refresh(favorite)
        return favorite

    except IntegrityError:
        db.rollback()
        return None


def remove_favorite(
    db: Session,
    user_id: int,
    favorite_id: int,
) -> bool:
    """
    Remove one of the current user's favorites.
    """

    favorite = (
        db.query(Favorite)
        .filter(
            Favorite.id == favorite_id,
            Favorite.user_id == user_id,
        )
        .first()
    )

    if favorite is None:
        return False

    db.delete(favorite)
    db.commit()

    return True


def check_favorite(
    db: Session,
    user_id: int,
    content_type: str,
    content_id: int,
) -> bool:
    """
    Check whether the current user has favorited the given content.
    """

    return (
        db.query(Favorite)
        .filter(
            Favorite.user_id == user_id,
            Favorite.content_type == content_type,
            Favorite.content_id == content_id,
        )
        .first()
        is not None
    )


def list_favorites(
    db: Session,
    user_id: int,
    page: int = 1,
    per_page: int = 10,
    content_type: str | None = None,
) -> dict:
    """
    List the authenticated user's favorites with optional filtering.
    """

    query = db.query(Favorite).filter(
        Favorite.user_id == user_id
    )

    if content_type:

        # Validate filter content type
        validate_content_exists(
            db=db,
            content_type=content_type,
            content_id=1,   # Only used to validate the type
        )

        query = query.filter(
            Favorite.content_type == content_type
        )

    total = query.count()

    items = (
        query.order_by(Favorite.created_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )

    return {
        "items": items,
        "total": total,
        "page": page,
        "per_page": per_page,
    }