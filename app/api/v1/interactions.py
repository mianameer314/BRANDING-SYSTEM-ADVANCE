"""
Interaction routes — Favorites, Likes, and Comments.
"""
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.deps import CurrentUser, DbDep
from app.core.permissions import require_permission
from app.models.user import User
from app.schemas.common import PaginatedResponse
from app.schemas.favorite import FavoriteCreate, FavoriteOut, FavoriteCheck
from app.schemas.like import LikeCreate, LikeOut, LikeCheck
from app.schemas.comment import CommentCreate, CommentOut, CommentUpdate
from app.services import favorite as favorite_service
from app.services import like as like_service
from app.services import comment as comment_service
from app.rate_limit import LIKE_LIMIT, COMMENT_LIMIT, AUTH_GET_LIMIT, PUBLIC_GET_LIMIT, CONTENT_DELETE_LIMIT

router = APIRouter(tags=["Interactions"])

InteractDep = Annotated[User, Depends(require_permission("interact"))]

# ── Favorites ──────────────────────────────────────────────────

@router.post("/favorites", response_model=FavoriteOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(LIKE_LIMIT)])
def add_favorite(data: FavoriteCreate, db: DbDep, user: InteractDep):
    fav = favorite_service.add_favorite(db, user.id, data)
    if not fav:
        raise HTTPException(status_code=400, detail="Already favorited")
    return fav

@router.delete("/favorites/{favorite_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(LIKE_LIMIT)])
def remove_favorite(favorite_id: int, db: DbDep, user: InteractDep):
    if not favorite_service.remove_favorite(db, user.id, favorite_id):
        raise HTTPException(status_code=404, detail="Favorite not found")

@router.get("/favorites", response_model=PaginatedResponse[FavoriteOut], dependencies=[Depends(AUTH_GET_LIMIT)])
def list_favorites(
    db: DbDep, user: InteractDep, page: int = 1, per_page: int = 20, content_type: str | None = None
):
    return favorite_service.list_favorites(db, user.id, page, per_page, content_type)

@router.get("/favorites/check", response_model=FavoriteCheck, dependencies=[Depends(AUTH_GET_LIMIT)])
def check_favorite(db: DbDep, user: InteractDep, content_type: str, content_id: int):
    is_fav = favorite_service.check_favorite(db, user.id, content_type, content_id)
    return {"is_favorited": is_fav}

# ── Likes ──────────────────────────────────────────────────────

@router.post("/likes", response_model=LikeOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(LIKE_LIMIT)])
def add_like(data: LikeCreate, db: DbDep, user: InteractDep):
    like = like_service.add_like(db, user.id, data)
    if not like:
        raise HTTPException(status_code=400, detail="Already liked")
    return like

@router.delete("/likes/{like_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(LIKE_LIMIT)])
def remove_like(like_id: int, db: DbDep, user: InteractDep):
    if not like_service.remove_like(db, user.id, like_id):
        raise HTTPException(status_code=404, detail="Like not found")

@router.get("/likes/check", response_model=LikeCheck, dependencies=[Depends(AUTH_GET_LIMIT)])
def check_like(db: DbDep, user: InteractDep, content_type: str, content_id: int):
    is_liked = like_service.check_like(db, user.id, content_type, content_id)
    return {"is_liked": is_liked}

# ── Comments ───────────────────────────────────────────────────

@router.get("/comments", response_model=PaginatedResponse[CommentOut], dependencies=[Depends(PUBLIC_GET_LIMIT)])
def list_comments(db: DbDep, content_type: str, content_id: int, page: int = 1, per_page: int = 20):
    return comment_service.list_comments(db, content_type, content_id, page, per_page)

@router.post("/comments", response_model=CommentOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(COMMENT_LIMIT)])
def create_comment(data: CommentCreate, db: DbDep, user: InteractDep):
    return comment_service.create_comment(db, user.id, data)

@router.put("/comments/{comment_id}", response_model=CommentOut, dependencies=[Depends(COMMENT_LIMIT)])
def update_comment(comment_id: int, data: CommentUpdate, db: DbDep, user: InteractDep):
    comment = comment_service.get_comment(db, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    if comment.user_id != user.id and user.role not in ("admin", "super_admin"):
        raise HTTPException(status_code=403, detail="Not authorized to edit this comment")
    return comment_service.update_comment(db, comment_id, data)

@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(CONTENT_DELETE_LIMIT)])
def delete_comment(comment_id: int, db: DbDep, user: InteractDep):
    comment = comment_service.get_comment(db, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    if comment.user_id != user.id and user.role not in ("admin", "super_admin"):
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")
    comment_service.delete_comment(db, comment_id)
