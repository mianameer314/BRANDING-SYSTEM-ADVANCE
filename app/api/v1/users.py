"""
User Management routes — Super Admin only.
"""
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.deps import DbDep
from app.core.permissions import require_permission
from app.models.user import User
from app.schemas.common import PaginatedResponse
from app.schemas.user import UserCreate, UserOut, UserUpdate
from app.services import user as user_service
from app.rate_limit import USER_MANAGEMENT_LIMIT

router = APIRouter(prefix="/users", tags=["User Management"])


# ---------------------------------------------------------
# Only users with "manage_users" permission can access.
# Currently only Super Admin has this permission.
# ---------------------------------------------------------

ManageUsersDep = Annotated[
    User,
    Depends(require_permission("manage_users"))
]


# ---------------------------------------------------------
# List Users
# ---------------------------------------------------------

@router.get("", response_model=PaginatedResponse[UserOut], dependencies=[Depends(USER_MANAGEMENT_LIMIT)])
def list_users(
    db: DbDep,
    current_user: ManageUsersDep,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    role: str | None = None,
):
    """List all users."""

    return user_service.list_users(
        db=db,
        page=page,
        per_page=per_page,
        role=role,
    )


# ---------------------------------------------------------
# Create User
# ---------------------------------------------------------

@router.post("", response_model=UserOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(USER_MANAGEMENT_LIMIT)])
def create_user(
    data: UserCreate,
    db: DbDep,
    current_user: ManageUsersDep,
):
    """Create a new user."""

    return user_service.create_user(
        db=db,
        current_user=current_user,
        data=data,
    )


# ---------------------------------------------------------
# Get User
# ---------------------------------------------------------

@router.get("/{user_id}", response_model=UserOut, dependencies=[Depends(USER_MANAGEMENT_LIMIT)])
def get_user(
    user_id: int,
    db: DbDep,
    current_user: ManageUsersDep,
):
    """Get a user by ID."""

    user = user_service.get_user(db, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return user


# ---------------------------------------------------------
# Update User
# ---------------------------------------------------------

@router.put("/{user_id}", response_model=UserOut, dependencies=[Depends(USER_MANAGEMENT_LIMIT)])
def update_user(
    user_id: int,
    data: UserUpdate,
    db: DbDep,
    current_user: ManageUsersDep,
):
    """Update a user's information."""

    user = user_service.update_user(
        db=db,
        current_user=current_user,
        user_id=user_id,
        data=data,
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return user


# ---------------------------------------------------------
# Deactivate User (Soft Delete)
# ---------------------------------------------------------

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(USER_MANAGEMENT_LIMIT)])
def deactivate_user(
    user_id: int,
    db: DbDep,
    current_user: ManageUsersDep,
):
    """Deactivate a user."""

    user = user_service.get_user(db, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Prevent Super Admin from deactivating themselves.

    if current_user.id == user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot deactivate your own account.",
        )

    user.is_active = False

    db.commit()

    return None