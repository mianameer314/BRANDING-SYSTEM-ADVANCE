"""
Auth routes — register, login, refresh, profile, password.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr

from app.api.deps import CurrentUser, DbDep, RefreshUser
from app.core.security import create_access_token, create_refresh_token, verify_password, hash_password
from app.models.user import User
from app.schemas.user import ChangePasswordRequest, Token, UserOut, UserRegister, UserProfileUpdate
from app.schemas.auth import VerifyEmailRequest, ResendOtpRequest, ForgotPasswordRequest, ResetPasswordRequest
from app.services import user as user_service
from app.services.otp import create_and_send_otp, verify_otp
from app.rate_limit import LOGIN_LIMIT, REGISTER_LIMIT, REFRESH_LIMIT, AUTH_GET_LIMIT, CONTENT_UPDATE_LIMIT

router = APIRouter(prefix="/auth", tags=["Authentication"])


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/register", status_code=status.HTTP_201_CREATED, dependencies=[Depends(REGISTER_LIMIT)])
async def register(data: UserRegister, db: DbDep):
    """Public user registration. Creates unverified user and sends OTP."""
    existing_user = user_service.get_user_by_email(db, data.email)
    if existing_user:
        if existing_user.email_verified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )
        # If not verified, we can resend OTP
        await create_and_send_otp(db, existing_user.email, purpose="signup")
        return {"message": "Verification code sent."}

    user = user_service.register_user(db, data)
    await create_and_send_otp(db, user.email, purpose="signup")
    return {"message": "User created. Verification code sent."}

@router.post("/verify-email", response_model=Token)
def verify_email(data: VerifyEmailRequest, db: DbDep):
    """Verify email via OTP and return tokens."""
    is_valid = verify_otp(db, email=data.email, purpose="signup", otp_code=data.otp_code)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code."
        )
    
    user = user_service.get_user_by_email(db, data.email)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
    user.is_active = True
    user.email_verified = True
    db.commit()

    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    refresh_token = create_refresh_token(subject=user.email)
    return Token(access_token=access_token, refresh_token=refresh_token)

@router.post("/resend-otp")
async def resend_otp(data: ResendOtpRequest, db: DbDep):
    user = user_service.get_user_by_email(db, data.email)
    if not user:
        # Silently succeed for security
        return {"message": "If the email is registered, a code has been sent."}
    
    await create_and_send_otp(db, user.email, purpose=data.purpose)
    return {"message": "If the email is registered, a code has been sent."}

@router.post("/forgot-password")
async def forgot_password(data: ForgotPasswordRequest, db: DbDep):
    user = user_service.get_user_by_email(db, data.email)
    if not user:
        return {"message": "If the email is registered, a reset code has been sent."}
        
    await create_and_send_otp(db, user.email, purpose="reset")
    return {"message": "If the email is registered, a reset code has been sent."}

@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest, db: DbDep):
    is_valid = verify_otp(db, email=data.email, purpose="reset", otp_code=data.otp_code)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset code."
        )
        
    user = user_service.get_user_by_email(db, data.email)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
    user.hashed_password = hash_password(data.new_password)
    db.commit()
    return {"message": "Password reset successfully."}


@router.post("/login", response_model=Token, dependencies=[Depends(LOGIN_LIMIT)])
def login(data: LoginRequest, db: DbDep):
    """Authenticate and get access + refresh tokens."""
    user = user_service.get_user_by_email(db, data.email)
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )

    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    refresh_token = create_refresh_token(subject=user.email)

    return Token(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=Token, dependencies=[Depends(REFRESH_LIMIT)])
def refresh_token(current_user: RefreshUser):
    """Get new tokens using a refresh token."""
    access_token = create_access_token(data={"sub": current_user.email, "role": current_user.role})
    refresh_token = create_refresh_token(subject=current_user.email)

    return Token(access_token=access_token, refresh_token=refresh_token)


@router.get("/me", response_model=UserOut, dependencies=[Depends(AUTH_GET_LIMIT)])
def get_current_user_profile(current_user: CurrentUser):
    """Get current user profile."""
    return current_user


@router.put("/me", response_model=UserOut, dependencies=[Depends(CONTENT_UPDATE_LIMIT)])
def update_profile(data: UserProfileUpdate, current_user: CurrentUser, db: DbDep):
    """Update current user's name."""
    current_user.full_name = data.full_name
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/change-password", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(LOGIN_LIMIT)])
def change_password(data: ChangePasswordRequest, current_user: CurrentUser, db: DbDep):
    """Change own password."""
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password",
        )
    
    current_user.hashed_password = hash_password(data.new_password)
    db.commit()
    return None
