"""
Application configuration.
Loads all configuration from environment variables (.env locally, Railway Variables in production).
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ==========================================================
    # Application
    # ==========================================================
    APP_NAME: str
    APP_ENV: str
    DEBUG: bool
    LOG_LEVEL: str

    # ==========================================================
    # Database
    # ==========================================================
    DATABASE_URL: str

    # ==========================================================
    # JWT
    # ==========================================================
    JWT_SECRET: str
    JWT_ALGORITHM: str
    JWT_ACCESS_EXPIRY_MINUTES: int
    JWT_REFRESH_EXPIRY_DAYS: int

    # ==========================================================
    # Default Admin
    # ==========================================================
    ADMIN_EMAIL: str
    ADMIN_PASSWORD: str

    # ==========================================================
    # CORS
    # ==========================================================
    CORS_ORIGINS: str

    # ==========================================================
    # Storage
    # ==========================================================
    STORAGE_PROVIDER: str
    MEDIA_URL: str
    LOCAL_STORAGE_PATH: str

    # ==========================================================
    # AWS S3
    # ==========================================================
    AWS_ACCESS_KEY_ID: str
    AWS_SECRET_ACCESS_KEY: str
    AWS_REGION: str
    AWS_BUCKET_NAME: str
    AWS_ENDPOINT_URL: str

    # ==========================================================
    # Upload Limits
    # ==========================================================
    MAX_IMAGE_SIZE_MB: int
    MAX_FILE_SIZE_MB: int
    IMAGE_MAX_WIDTH: int
    ALLOWED_IMAGE_TYPES: str

    # ==========================================================
    # Redis
    # ==========================================================
    REDIS_URL: str

    # ==========================================================
    # AI Content Generation (OpenRouter)
    # ==========================================================
    OPENROUTER_API_KEY: str = ""
    OPENROUTER_MODEL: str = "openai/gpt-4o"

    # ==========================================================
    # Rate Limiting
    # ==========================================================
    RATE_LIMIT_LOGIN: str
    RATE_LIMIT_REGISTER: str
    RATE_LIMIT_REFRESH: str
    RATE_LIMIT_PUBLIC_GET: str
    RATE_LIMIT_AUTH_GET: str
    RATE_LIMIT_CREATE: str
    RATE_LIMIT_UPDATE: str
    RATE_LIMIT_DELETE: str
    RATE_LIMIT_UPLOAD: str
    RATE_LIMIT_COMMENT: str
    RATE_LIMIT_LIKE: str
    RATE_LIMIT_USER_MGT: str
    RATE_LIMIT_AI_GENERATE: str = "20/3600"

    # ==========================================================
    # Webhooks
    # ==========================================================
    WEBHOOK_ENABLED: bool = True
    WEBHOOK_SIGNING_ENABLED: bool = True
    WEBHOOK_TIMEOUT: int = 10
    WEBHOOK_USER_AGENT: str = "O2Geeks-Webhook/1.0"

    # ==========================================================
    # Email / FastAPI-Mail
    # ==========================================================
    MAIL_USERNAME: str = "dummy"
    MAIL_PASSWORD: str = "dummy"
    MAIL_FROM: str = "noreply@example.com"
    MAIL_PORT: int = 587
    MAIL_SERVER: str = "smtp.example.com"
    MAIL_FROM_NAME: str = "O2geek Headless CMS"
    MAIL_STARTTLS: bool = True
    MAIL_SSL_TLS: bool = False
    USE_CREDENTIALS: bool = True
    VALIDATE_CERTS: bool = True

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()