import logging
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models import Blog, News, Project, Insight, CaseStudy
from app.models.audit_event import AuditEvent

logger = logging.getLogger(__name__)

CONTENT_MODELS = {
    "blog": Blog,
    "news": News,
    "project": Project,
    "insight": Insight,
    "case_study": CaseStudy,
}

def publish_scheduled_content():
    """
    Scans all content models for items where status='scheduled' and 
    published_at <= current_time, and transitions them to 'published'.
    """
    logger.info("Running scheduled content publisher...")
    db: Session = SessionLocal()
    try:
        now = datetime.now(timezone.utc)
        published_count = 0
        
        for ct, model in CONTENT_MODELS.items():
            # Find scheduled items whose publish date has passed
            scheduled_items = db.query(model).filter(
                model.status == "scheduled",
                model.published_at <= now
            ).all()
            
            for item in scheduled_items:
                item.status = "published"
                item.status_changed_at = now
                item.status_change_reason = "Automatically published on schedule"
                
                # Log audit event
                audit_log = AuditEvent(
                    subject_type=ct,
                    subject_id=item.id,
                    event_type="content_published",
                    actor_id=None, # System action
                    details={"reason": "Automatically published on schedule", "published_at": item.published_at.isoformat()}
                )
                db.add(audit_log)
                published_count += 1
                logger.info(f"Automatically published {ct} {item.id}")
                
        db.commit()
        if published_count > 0:
            logger.info(f"Successfully published {published_count} scheduled item(s).")
            
    except Exception as e:
        db.rollback()
        logger.error(f"Error publishing scheduled content: {e}")
    finally:
        db.close()

def register_tasks(scheduler):
    """Register all tasks for this module with the provided scheduler."""
    # Run every minute
    scheduler.add_job(
        publish_scheduled_content,
        'interval',
        minutes=1,
        id='publish_scheduled_content_job',
        replace_existing=True
    )
    logger.info("Registered publish_scheduled_content job.")
