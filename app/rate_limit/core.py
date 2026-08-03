"""
Rate Limiter Core — Redis connection lifecycle management.

Handles:
    - Connecting to Redis via redis.asyncio on application startup
    - Gracefully closing the Redis connection on shutdown
    - Fail-open behavior: if Redis is unavailable, the application continues
      without rate limiting and logs a warning
"""

import logging

import redis.asyncio as aioredis

from app.core.config import settings

logger = logging.getLogger(__name__)

# Module-level Redis client reference — shared across the application
redis_client: aioredis.Redis | None = None


async def init_rate_limiter() -> None:
    """
    Connect to Redis and verify the connection with a PING.

    Called during FastAPI startup. If Redis is unavailable, the application
    starts in fail-open mode — all requests pass through without rate limiting.
    """
    global redis_client

    try:
        client = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
        )
        await client.ping()
        redis_client = client
        
        # Initialize fastapi-limiter globally
        from fastapi_limiter import FastAPILimiter
        await FastAPILimiter.init(client)
        
        logger.info("Rate Limiter: Redis connected successfully at %s", settings.REDIS_URL)
    except Exception as e:
        redis_client = None
        from fastapi_limiter import FastAPILimiter
        FastAPILimiter.redis = None  # Ensure it's explicitly disabled
        # In fail-open mode, FastAPILimiter.redis will be None
        logger.warning(
            "Rate Limiter: Redis unavailable — running in fail-open mode. "
            "Rate limiting is DISABLED. Error: %s",
            e,
        )


async def close_rate_limiter() -> None:
    """
    Gracefully close the Redis connection on application shutdown.
    """
    global redis_client

    if redis_client is not None:
        try:
            await redis_client.aclose()
            logger.info("Rate Limiter: Redis connection closed.")
        except Exception as e:
            logger.warning("Rate Limiter: Error closing Redis connection: %s", e)
        finally:
            redis_client = None


def get_redis_client() -> aioredis.Redis | None:
    """
    Return the current Redis client, or None if Redis is unavailable.
    Used by the BucketFactory to create RedisBuckets.
    """
    return redis_client
