import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.jobstores.memory import MemoryJobStore

logger = logging.getLogger(__name__)

# Initialize the scheduler
# MemoryJobStore is sufficient since we just want a simple loop to query the DB
# without the overhead of Redis/Celery for now.
jobstores = {
    'default': MemoryJobStore()
}

scheduler = AsyncIOScheduler(jobstores=jobstores, timezone="UTC")

def start_scheduler():
    """Start the APScheduler instance."""
    if not scheduler.running:
        scheduler.start()
        logger.info("APScheduler started successfully.")

def stop_scheduler():
    """Stop the APScheduler instance."""
    if scheduler.running:
        scheduler.shutdown()
        logger.info("APScheduler stopped.")
