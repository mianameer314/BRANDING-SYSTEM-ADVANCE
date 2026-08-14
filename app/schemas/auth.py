from pydantic import BaseModel, EmailStr

class VerifyEmailRequest(BaseModel):
    email: EmailStr
    otp_code: str

class ResendOtpRequest(BaseModel):
    email: EmailStr
    purpose: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp_code: str
    new_password: str
