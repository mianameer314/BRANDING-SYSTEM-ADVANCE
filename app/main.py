"""
O2geeks Headless CMS — FastAPI Application Entry Point.
Registers all content-type routers and bootstraps admin user on startup.
"""
import logging
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.v1 import ai, audit, auth, blogs, case_studies, insights, interactions, news, operations, preview, projects, resources, stats, users, webhooks
from app.api.idempotency import IdempotentReplayException, idempotency_exception_handler
from app.core.config import settings
from app.core.scheduler import start_scheduler, stop_scheduler, scheduler
from app.tasks.publish_scheduled import register_tasks as register_publish_tasks

from sqlalchemy import text
from app.db.session import SessionLocal

# ── Logging Configuration ────────────────────────────────────
log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)
logging.basicConfig(
    level=log_level,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

tags_metadata = [
    # ── Core Identity & Security ──
    {
        "name": "Authentication",
        "description": "Operations for user registration, login, and token refresh.",
    },
    {
        "name": "User Management",
        "description": "User profile management and admin user control.",
    },
    
    # ── Editorial Content Types ──
    {
        "name": "Blogs",
        "description": "Manage long-form articles and thought pieces. Supports multimedia and rich text.",
    },
    {
        "name": "News",
        "description": "Manage timely announcements, company updates, and press releases.",
    },
    {
        "name": "Projects",
        "description": "Showcase company work, client solutions, and portfolios.",
    },
    {
        "name": "Insights",
        "description": "Data-driven analysis, commentary, and market reports.",
    },
    {
        "name": "Case Studies",
        "description": "Detailed client success stories with business metrics.",
    },
    
    # ── Supporting Content & Engagement ──
    {
        "name": "Resources",
        "description": "Downloadable gated files and assets linked to content.",
    },
    {
        "name": "Preview",
        "description": "Secure short-lived token generation for real-time iframe previews.",
    },
    {
        "name": "Interactions",
        "description": "User engagement features (likes, comments, favorites).<br/><br/>⚠️ **NOTE:** *These endpoints are currently available via API only and are not yet implemented in the Admin Dashboard UI.*",
    },
    
    # ── Automation & Auditing ──
    {
        "name": "AI Content Assistant",
        "description": "AI-powered content generation endpoints for rapid drafting.",
    },
    {
        "name": "Webhooks",
        "description": "Manage outbound webhooks for real-time content publish events.",
    },
    {
        "name": "Audit & Revisions",
        "description": "Immutable content revisions and operational audit events.",
    },
    
    # ── Infrastructure ──
    {
        "name": "System",
        "description": "Health checks, metrics, and system status endpoints.",
    },
    {
        "name": "Stats",
        "description": "Aggregated content statistics for the Admin Dashboard overview.",
    },
    {
        "name": "Operations Console",
        "description": "Aggregated workflow metrics and consolidated review queues.",
    },
]

app = FastAPI(
    title=settings.APP_NAME,
    description="""
**Backend API for the O2geeks Branding System**

This API powers the decoupled content management backend. It provides robust RESTful endpoints for delivering and managing multi-format content.

### Key Capabilities:
- **Authentication**: JWT-based secure access with Refresh Tokens.
- **RBAC**: Strict Role-Based Access Control (Super Admin, Admin, Editor, User).
- **Controlled Lifecycle**: 7-state publishing workflow (`draft` to `archived`) with enforced content locking.
- **Audit Trails**: Immutable revision history logs for all content modifications.
- **Resilience**: API Idempotency for safe network retries and Redis-backed Rate Limiting.
- **Webhooks**: Real-time HTTP dispatching for content publication events.
- **Media**: Dual-provider (Local + AWS S3) Multipart/Form-Data uploads.
""",
    version="1.0.0",
    openapi_tags=tags_metadata,
    docs_url="/docs" if settings.DEBUG or settings.APP_ENV != "production" else "/docs",
    redoc_url="/redoc" if settings.DEBUG or settings.APP_ENV != "production" else "/redoc",
)

# ── CORS & Security Middleware ───────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.CORS_ORIGINS.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware, allowed_hosts=["*"]
)

# ── Global Exception Handler ─────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Exception: {exc}", exc_info=settings.DEBUG)
    if settings.DEBUG:
        return JSONResponse(status_code=500, content={"detail": str(exc)})
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error"}
    )

app.add_exception_handler(IdempotentReplayException, idempotency_exception_handler)


# ── Static Files / Media Mount ───────────────────────────────
# Serve uploaded files at /media/* when using local storage

if settings.STORAGE_PROVIDER == "local":
    storage_path = Path(settings.LOCAL_STORAGE_PATH)
    storage_path.mkdir(parents=True, exist_ok=True)
    app.mount(
        settings.MEDIA_URL,
        StaticFiles(directory=str(storage_path)),
        name="media",
    )
    logger.info("Mounted local media at %s → %s", settings.MEDIA_URL, storage_path.resolve())

# ── Router Registration ──────────────────────────────────────
# All content-type routers are mounted under /api/v1

API_V1_PREFIX = "/api/v1"

# Define common HTTP error responses to inject globally into Swagger UI docs
COMMON_RESPONSES = {
    400: {"description": "Bad Request (e.g., Validation Error or Duplicate Data)"},
    401: {"description": "Unauthorized (Missing or Invalid JWT Token)"},
    403: {"description": "Forbidden (Insufficient Permissions or Deactivated Account)"},
    404: {"description": "Not Found (The requested resource does not exist)"},
    429: {"description": "Too Many Requests (Rate limit exceeded for this endpoint)"},
    500: {"description": "Internal Server Error (Unexpected system failure)"},
}

app.include_router(auth.router, prefix=API_V1_PREFIX, responses=COMMON_RESPONSES)
app.include_router(blogs.router, prefix=API_V1_PREFIX, responses=COMMON_RESPONSES)
app.include_router(news.router, prefix=API_V1_PREFIX, responses=COMMON_RESPONSES)
app.include_router(projects.router, prefix=API_V1_PREFIX, responses=COMMON_RESPONSES)
app.include_router(insights.router, prefix=API_V1_PREFIX, responses=COMMON_RESPONSES)
app.include_router(case_studies.router, prefix=API_V1_PREFIX, responses=COMMON_RESPONSES)
app.include_router(users.router, prefix=API_V1_PREFIX, responses=COMMON_RESPONSES)
app.include_router(interactions.router, prefix=API_V1_PREFIX, responses=COMMON_RESPONSES)
app.include_router(resources.router, prefix=API_V1_PREFIX, responses=COMMON_RESPONSES)
app.include_router(preview.router, prefix=API_V1_PREFIX, responses=COMMON_RESPONSES)
app.include_router(ai.router, prefix=API_V1_PREFIX, responses=COMMON_RESPONSES)
app.include_router(webhooks.router, prefix=API_V1_PREFIX, responses=COMMON_RESPONSES)
app.include_router(audit.router, prefix=API_V1_PREFIX, responses=COMMON_RESPONSES)
app.include_router(stats.router, prefix=API_V1_PREFIX, responses=COMMON_RESPONSES)
app.include_router(operations.router, prefix=API_V1_PREFIX, responses=COMMON_RESPONSES)

@app.get("/", tags=["System"])
def root():
    return {
        "project": "O2geeks Headless CMS",
        "version": "1.0.0",
        "status": "Running Successfully",
        "message": "Welcome to the O2geeks Branding System API",
        "documentation": "/docs",
        "health_check": "/healthz",
    }


# ── System Endpoints ─────────────────────────────────────────

@app.get("/healthz", tags=["System"])
def health_check():

    db = SessionLocal()

    try:
        db.execute(text("SELECT 1"))

        return {
            "status": "healthy",
            "database": "Connected",
            "storage": settings.STORAGE_PROVIDER,
            "system": "O2geeks Headless CMS API"
        }

    except Exception as e:

        return {
            "status": "unhealthy",
            "database": "Disconnected",
            "error": str(e)
        }

    finally:
        db.close()


# ── Startup Events ───────────────────────────────────────────

@app.on_event("startup")
def startup_validation():
    """Fail fast if database or environment is misconfigured."""
    from app.db.session import SessionLocal
    from sqlalchemy import text
    import sys
    
    logger.info(f"Starting {settings.APP_NAME} in {settings.APP_ENV} mode")
    
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        logger.info("Startup Validation: Database connected successfully.")
    except Exception as e:
        logger.critical(f"Startup Validation Failed: Could not connect to the database. Error: {e}")
        sys.exit(1)


@app.on_event("startup")
def bootstrap_admin():
    """Create default admin user on first startup if none exists."""
    from app.core.security import hash_password
    from app.db.session import SessionLocal
    from app.models.user import User

    try:
        db = SessionLocal()
        try:
            existing_admin = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
            if not existing_admin:
                admin = User(
                    email=settings.ADMIN_EMAIL,
                    hashed_password=hash_password(settings.ADMIN_PASSWORD),
                    full_name="Super Admin",
                    role="super_admin",
                    is_active=True,
                )
                db.add(admin)
                db.commit()
                logger.info("Bootstrap: Admin user created (%s)", settings.ADMIN_EMAIL)
            else:
                existing_admin.hashed_password = hash_password(settings.ADMIN_PASSWORD)
                existing_admin.is_active = True
                db.commit()
                logger.info("Bootstrap: Admin user credentials synced (%s)", existing_admin.email)
        finally:
            db.close()
    except Exception as e:
        logger.warning("Bootstrap: Database not available yet -- skipping admin creation (%s)", e)


@app.on_event("startup")
def init_storage():
    """Initialise the storage service on startup (creates directories / validates S3 connection)."""
    from app.services.storage import get_storage_service
    storage = get_storage_service()
    logger.info("Storage service ready: provider=%s", settings.STORAGE_PROVIDER)


@app.on_event("startup")
async def startup_rate_limiter():
    """Connect to Redis and initialize the rate limiter on startup."""
    from app.rate_limit.core import init_rate_limiter
    await init_rate_limiter()


@app.on_event("startup")
def startup_scheduler():
    """Register tasks and start the background scheduler."""
    register_publish_tasks(scheduler)
    start_scheduler()


@app.on_event("shutdown")
async def shutdown_rate_limiter():
    """Gracefully close Redis connection on shutdown."""
    from app.rate_limit.core import close_rate_limiter
    await close_rate_limiter()


@app.on_event("shutdown")
def shutdown_scheduler_event():
    """Gracefully stop the background scheduler."""
    stop_scheduler()
