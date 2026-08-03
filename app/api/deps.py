from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import decode_token
from app.db.session import SessionLocal
from app.models.user import User

# ── Security Scheme ───────────────────────────────────────────

bearer_scheme = HTTPBearer()


# ── Database Session ──────────────────────────────────────────

def get_db():
    """Yield a SQLAlchemy session, auto-close on exit."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


DbDep = Annotated[Session, Depends(get_db)]
TokenDep = Annotated[HTTPAuthorizationCredentials, Depends(bearer_scheme)]


# ── Auth Guards ───────────────────────────────────────────────

def get_current_user(credentials: TokenDep, db: DbDep) -> User:
    """Decode JWT and return the authenticated User, or raise 401."""
    try:
        payload = decode_token(credentials.credentials)
        if payload.get("type") != "access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type, expected access token",
            )
        user_email: str = payload.get("sub")
        if user_email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
            )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    user = db.query(User).filter(User.email == user_email).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account",
        )
    return user


def get_refresh_user(credentials: TokenDep, db: DbDep) -> User:
    """Decode Refresh JWT and return the user."""
    try:
        payload = decode_token(credentials.credentials)
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type, expected refresh token",
            )
        user_email: str = payload.get("sub")
        if user_email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
            )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    user = db.query(User).filter(User.email == user_email).first()
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )
    return user


from fastapi import Request

def get_optional_user(request: Request, db: DbDep) -> User | None:
    """Optionally decode JWT and return the user if present and valid. Never raises."""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
        
    token = auth_header.split(" ")[1]
    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            return None
            
        user_email: str | None = payload.get("sub")
        if user_email is None:
            return None
            
        user = db.query(User).filter(User.email == user_email).first()
        if user is None or not user.is_active:
            return None
            
        return user
    except Exception:
        return None

CurrentUser = Annotated[User, Depends(get_current_user)]
RefreshUser = Annotated[User, Depends(get_refresh_user)]
OptionalUser = Annotated[User | None, Depends(get_optional_user)]

# Provide a backwards-compatible stub for CurrentAdmin that uses require_permission
from app.core.permissions import require_permission
CurrentAdmin = Annotated[User, Depends(require_permission("create"))]

