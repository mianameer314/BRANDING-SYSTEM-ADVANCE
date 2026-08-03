from typing import Any

from sqlalchemy import select, func
from sqlalchemy.orm import Query

from app.models.like import Like
from app.models.comment import Comment


def get_content_type_string(model: Any) -> str:
    """Map the SQLAlchemy model class to the singular content_type string used in likes/comments."""
    table_name = model.__tablename__
    mapping = {
        "blogs": "blog",
        "news": "news",
        "projects": "project",
        "insights": "insight",
        "case_studies": "case_study",
        "resources": "resource",
    }
    return mapping.get(table_name, table_name)


def apply_interaction_annotations(query: Query, model: Any, user_id: int | None = None) -> Query:
    """
    Adds scalar subqueries for `likes_count` and `comments_count` to avoid N+1 query problems.
    Optionally adds `is_liked` if a user_id is provided.
    """
    content_type_str = get_content_type_string(model)
    
    # Subquery for likes_count
    likes_sq = (
        select(func.count(Like.id))
        .where(
            Like.content_type == content_type_str,
            Like.content_id == model.id
        )
        .correlate(model)
        .scalar_subquery()
        .label("likes_count")
    )

    # Subquery for comments_count
    comments_sq = (
        select(func.count(Comment.id))
        .where(
            Comment.content_type == content_type_str,
            Comment.content_id == model.id
        )
        .correlate(model)
        .scalar_subquery()
        .label("comments_count")
    )

    query = query.add_columns(likes_sq, comments_sq)

    if user_id:
        is_liked_sq = (
            select(func.count(Like.id) > 0)
            .where(
                Like.content_type == content_type_str,
                Like.content_id == model.id,
                Like.user_id == user_id
            )
            .correlate(model)
            .scalar_subquery()
            .label("is_liked")
        )
        query = query.add_columns(is_liked_sq)

    return query


def format_interaction_results(rows: list, has_user: bool = False) -> list[Any]:
    """
    Parses SQLAlchemy Row objects returned by `apply_interaction_annotations`
    and maps the returned interaction counts as runtime attributes onto the ORM model instances.
    This allows Pydantic to cleanly serialize them using from_attributes=True.
    """
    results = []
    for row in rows:
        if has_user:
            item, likes, comments, is_liked = row
        else:
            item, likes, comments = row
            is_liked = False
            
        item.likes_count = likes or 0
        item.comments_count = comments or 0
        item.is_liked = is_liked or False
        results.append(item)
    return results
