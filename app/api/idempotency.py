import hashlib
import json
from typing import Annotated

from fastapi import Depends, Header, HTTPException, Request, status
from fastapi.responses import JSONResponse

from app.api.deps import DbDep, get_current_user
from app.models.api_idempotency_record import ApiIdempotencyRecord
from app.models.user import User


class IdempotentReplayException(Exception):
    def __init__(self, status_code: int, body: dict):
        self.status_code = status_code
        self.body = body


class IdempotencyContext:
    def __init__(self, key_hash: str, fingerprint: str, endpoint: str, user_id: int):
        self.key_hash = key_hash
        self.fingerprint = fingerprint
        self.endpoint = endpoint
        self.user_id = user_id

    def save(self, db, status_code: int, body: dict):
        """Saves the idempotency record to the database."""
        record = ApiIdempotencyRecord(
            user_id=self.user_id,
            idempotency_key=self.key_hash,
            endpoint=self.endpoint,
            request_fingerprint=self.fingerprint,
            response_status=status_code,
            response_body=body,
        )
        db.add(record)
        db.commit()


async def get_idempotency_context(
    request: Request,
    db: DbDep,
    user: Annotated[User, Depends(get_current_user)],
    idempotency_key: str | None = Header(None, alias="Idempotency-Key"),
) -> IdempotencyContext | None:
    """
    FastAPI dependency for idempotency.
    Returns an IdempotencyContext if the header is present, which the route handler MUST use to save the response.
    Raises IdempotentReplayException if a replay hit is detected.
    Raises HTTPException 409 if a conflict is detected.
    """
    if not idempotency_key:
        return None

    # Hash the idempotency key for storage
    key_hash = hashlib.sha256(idempotency_key.encode("utf-8")).hexdigest()

    endpoint = f"{request.method} {request.url.path}"

    # Generate request fingerprint
    # Read the body carefully since it could be JSON or Form data
    try:
        body = await request.json()
        body_str = json.dumps(body, sort_keys=True)
    except Exception:
        # If it's multipart/form-data, fingerprint the form fields
        try:
            form = await request.form()
            # Extract only string fields and filenames, not raw file bytes
            form_dict = {}
            for k, v in form.items():
                if hasattr(v, "filename"):
                    form_dict[k] = {"filename": getattr(v, "filename", "")}
                else:
                    form_dict[k] = v
            body_str = json.dumps(form_dict, sort_keys=True)
        except Exception:
            body_str = ""

    fingerprint_input = f"{request.method}|{request.url.path}|{body_str}"
    fingerprint = hashlib.sha256(fingerprint_input.encode("utf-8")).hexdigest()

    # Check for existing record
    from datetime import datetime, timezone
    
    now = datetime.now(timezone.utc)

    record = (
        db.query(ApiIdempotencyRecord)
        .filter(
            ApiIdempotencyRecord.user_id == user.id,
            ApiIdempotencyRecord.endpoint == endpoint,
            ApiIdempotencyRecord.idempotency_key == key_hash,
        )
        .first()
    )

    if record:
        # Normalize expires_at to timezone-aware (SQLite returns naive datetimes)
        expires_at = record.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        # Treat expired records as a miss
        if expires_at < now:
            # we could delete it, but the janitor handles it. We just proceed.
            pass
        elif record.request_fingerprint == fingerprint:
            # Replay hit
            raise IdempotentReplayException(record.response_status, record.response_body)
        else:
            # Conflict
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Idempotency key already used with a different request",
            )

    return IdempotencyContext(key_hash, fingerprint, endpoint, user.id)


IdempotencyDep = Annotated[IdempotencyContext | None, Depends(get_idempotency_context)]

def idempotency_exception_handler(request: Request, exc: IdempotentReplayException):
    """Exception handler for IdempotentReplayException, to return the saved response."""
    return JSONResponse(
        status_code=exc.status_code,
        content=exc.body,
        headers={"X-Idempotent-Replay": "true"},
    )
