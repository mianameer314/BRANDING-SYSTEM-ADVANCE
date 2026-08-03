"""
User service — user management and registration.
"""
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.permissions import UserRole
from app.core.security import hash_password
from app.models.user import User
from app.schemas.user import UserCreate, UserRegister, UserUpdate


# ---------------------------------------------------------
# Queries
# ---------------------------------------------------------

def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def get_user(db: Session, user_id: int) -> User | None:
    return db.query(User).filter(User.id == user_id).first()


# ---------------------------------------------------------
# Registration
# ---------------------------------------------------------

def register_user(db: Session, data: UserRegister) -> User:
    """Public user registration."""

    existing = get_user_by_email(db, data.email)

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    user = User(
        email=data.email,
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
        role=UserRole.user.value,
        is_active=True,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


# ---------------------------------------------------------
# Create User (Super Admin Only)
# ---------------------------------------------------------

def create_user(
    db: Session,
    current_user: User,
    data: UserCreate,
) -> User:
    """
    Create a user.

    Access already protected by:
        require_permission("manage_users")

    Therefore only Super Admin can reach here.
    """

    existing = get_user_by_email(db, data.email)

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    user = User(
        email=data.email,
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
        role=data.role.value,
        is_active=True,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


# ---------------------------------------------------------
# List Users
# ---------------------------------------------------------

def list_users(
    db: Session,
    *,
    page: int = 1,
    per_page: int = 10,
    role: str | None = None,
) -> dict:

    query = db.query(User)

    if role:
        query = query.filter(User.role == role)

    total = query.count()

    items = (
        query.order_by(User.created_at.desc())
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


# ---------------------------------------------------------
# Update User (Super Admin Only)
# ---------------------------------------------------------

def update_user(
    db: Session,
    current_user: User,
    user_id: int,
    data: UserUpdate,
) -> User | None:

    target_user = get_user(db, user_id)

    if not target_user:
        return None

    # Prevent Super Admin from removing
    # their own Super Admin role

    if (
        current_user.id == target_user.id
        and data.role is not None
        and data.role != UserRole.super_admin
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot change your own Super Admin role.",
        )

    update_data = data.model_dump(exclude_unset=True)

    # Convert enum to string before saving

    if "role" in update_data and update_data["role"] is not None:
        update_data["role"] = update_data["role"].value

    for field, value in update_data.items():
        setattr(target_user, field, value)

    db.commit()
    db.refresh(target_user)

    return target_user