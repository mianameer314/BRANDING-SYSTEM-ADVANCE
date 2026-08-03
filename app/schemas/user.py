"""
User schemas — authentication, registration, and user management.
"""
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, computed_field

from app.core.permissions import UserRole, ROLE_PERMISSIONS


# ------------------------------------------------------------------
# Registration
# ------------------------------------------------------------------

class UserRegister(BaseModel):
    """Request body for public user registration."""

    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str


# ------------------------------------------------------------------
# Admin Create User
# ------------------------------------------------------------------

class UserCreate(UserRegister):
    """
    Request body for admin creating a new user.

    Allowed roles:
    - super_admin
    - admin
    - editor
    - user
    - viewer
    """

    role: UserRole = UserRole.user


# ------------------------------------------------------------------
# Admin Update User
# ------------------------------------------------------------------

class UserUpdate(BaseModel):
    """Admin updating another user."""

    full_name: str | None = None
    role: UserRole | None = None
    is_active: bool | None = None


# ------------------------------------------------------------------
# User Profile Update
# ------------------------------------------------------------------

class UserProfileUpdate(BaseModel):
    """User updating their own profile."""

    full_name: str


# ------------------------------------------------------------------
# Change Password
# ------------------------------------------------------------------

class ChangePasswordRequest(BaseModel):
    """Request to change password."""

    current_password: str
    new_password: str = Field(..., min_length=8)


# ------------------------------------------------------------------
# User Response
# ------------------------------------------------------------------

class UserOut(BaseModel):
    """Response model (never exposes password)."""

    id: int
    email: EmailStr
    full_name: str
    role: UserRole
    is_active: bool
    created_at: datetime
    updated_at: datetime

    @computed_field
    @property
    def permissions(self) -> list[str]:
        return sorted(list(ROLE_PERMISSIONS.get(self.role, set())))

    class Config:
        from_attributes = True


# ------------------------------------------------------------------
# Authentication
# ------------------------------------------------------------------

class Token(BaseModel):
    """JWT response."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    """Decoded JWT payload."""

    sub: str                 # email
    role: UserRole | None = None
    type: str                # access / refresh
    exp: int