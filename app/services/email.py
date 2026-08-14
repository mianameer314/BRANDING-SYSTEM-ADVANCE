"""
Email service using fastapi-mail.
Handles sending OTPs for registration and password resets.
"""
import logging
from pathlib import Path
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import EmailStr

from app.core.config import settings

logger = logging.getLogger(__name__)

conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_FROM_NAME=settings.MAIL_FROM_NAME,
    MAIL_STARTTLS=settings.MAIL_STARTTLS,
    MAIL_SSL_TLS=settings.MAIL_SSL_TLS,
    USE_CREDENTIALS=settings.USE_CREDENTIALS,
    VALIDATE_CERTS=settings.VALIDATE_CERTS,
    SUPPRESS_SEND=1 if settings.APP_ENV == "testing" else 0,
)

fm = FastMail(conf)

async def send_otp_email(email_to: EmailStr, otp_code: str, purpose: str):
    """
    Sends an OTP email depending on the purpose ('signup' or 'reset').
    """
    if purpose == 'signup':
        subject = f"{settings.APP_NAME} - Verify Your Email"
        body = f"""
        <h2>Welcome to {settings.APP_NAME}!</h2>
        <p>Your email verification code is:</p>
        <h1 style="font-size: 32px; letter-spacing: 5px; color: #10b981;">{otp_code}</h1>
        <p>This code will expire in 15 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
        """
    elif purpose == 'reset':
        subject = f"{settings.APP_NAME} - Reset Your Password"
        body = f"""
        <h2>Reset Your Password</h2>
        <p>We received a request to reset your password. Your reset code is:</p>
        <h1 style="font-size: 32px; letter-spacing: 5px; color: #f59e0b;">{otp_code}</h1>
        <p>This code will expire in 15 minutes.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
        """
    else:
        raise ValueError(f"Unknown OTP purpose: {purpose}")

    message = MessageSchema(
        subject=subject,
        recipients=[email_to],
        body=body,
        subtype=MessageType.html
    )

    try:
        await fm.send_message(message)
        logger.info(f"OTP email ({purpose}) sent to {email_to}")
    except Exception as e:
        logger.error(f"Failed to send email to {email_to}: {str(e)}")
        raise
