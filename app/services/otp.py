"""
OTP service for generating and validating one-time passwords.
"""
import logging
import random
import string
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.otp import OTP
from app.services.email import send_otp_email

logger = logging.getLogger(__name__)

def generate_otp_code(length: int = 6) -> str:
    """Generate a random N-digit OTP code."""
    return "".join(random.choices(string.digits, k=length))

async def create_and_send_otp(db: Session, email: str, purpose: str) -> OTP:
    """
    Invalidates previous OTPs for this purpose, creates a new one, 
    and sends it via email.
    """
    # Invalidate old OTPs for this email and purpose
    db.query(OTP).filter(
        OTP.email == email, 
        OTP.purpose == purpose, 
        OTP.is_used == False
    ).update({"is_used": True})
    
    # Generate new 6-digit OTP
    otp_code = generate_otp_code(6)
    
    # Expires in 15 minutes
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)
    
    new_otp = OTP(
        email=email,
        otp_code=otp_code,
        purpose=purpose,
        expires_at=expires_at,
        is_used=False
    )
    
    db.add(new_otp)
    db.commit()
    db.refresh(new_otp)
    
    # Send Email
    logger.info("Generated OTP for %s (%s): %s", email, purpose, otp_code)
    try:
        await send_otp_email(email_to=email, otp_code=otp_code, purpose=purpose)
    except Exception as e:
        logger.warning(
            "Could not send email to %s via SMTP (%s). Falling back to logger. OTP code: %s",
            email, e, otp_code
        )
    
    return new_otp

def verify_otp(db: Session, email: str, purpose: str, otp_code: str) -> bool:
    """
    Validates the OTP code. If valid, marks it as used.
    """
    otp_record = db.query(OTP).filter(
        OTP.email == email,
        OTP.purpose == purpose,
        OTP.otp_code == otp_code,
        OTP.is_used == False
    ).order_by(desc(OTP.created_at)).first()
    
    if not otp_record:
        return False
        
    # Check if expired
    if otp_record.expires_at < datetime.now(timezone.utc):
        return False
        
    # Mark as used
    otp_record.is_used = True
    db.commit()
    
    return True
