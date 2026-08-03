"""
Comment service.
"""

from sqlalchemy.orm import Session

from app.models.comment import Comment
from app.schemas.comment import CommentCreate, CommentUpdate
from app.services.content_validator import validate_content_exists


def create_comment(
    db: Session,
    user_id: int,
    data: CommentCreate,
) -> Comment:
    """
    Create a comment only if the referenced content exists.
    """

    validate_content_exists(
        db=db,
        content_type=data.content_type,
        content_id=data.content_id,
    )

    comment = Comment(
        user_id=user_id,
        content_type=data.content_type,
        content_id=data.content_id,
        body=data.body,
    )

    db.add(comment)
    db.commit()
    db.refresh(comment)

    return comment


def get_comment(
    db: Session,
    comment_id: int,
) -> Comment | None:

    return (
        db.query(Comment)
        .filter(Comment.id == comment_id)
        .first()
    )


def update_comment(
    db: Session,
    comment_id: int,
    data: CommentUpdate,
) -> Comment | None:

    comment = get_comment(db, comment_id)

    if comment is None:
        return None

    comment.body = data.body

    db.commit()
    db.refresh(comment)

    return comment


def delete_comment(
    db: Session,
    comment_id: int,
) -> bool:

    comment = get_comment(db, comment_id)

    if comment is None:
        return False

    db.delete(comment)
    db.commit()

    return True


def list_comments(
    db: Session,
    content_type: str,
    content_id: int,
    page: int = 1,
    per_page: int = 20,
) -> dict:
    """
    Returns approved comments for an existing content item.
    """

    validate_content_exists(
        db=db,
        content_type=content_type,
        content_id=content_id,
    )

    query = (
        db.query(Comment)
        .filter(
            Comment.content_type == content_type,
            Comment.content_id == content_id,
            Comment.is_approved.is_(True),
        )
    )

    total = query.count()

    items = (
        query.order_by(Comment.created_at.desc())
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