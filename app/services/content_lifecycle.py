"""
Shared lifecycle rules for CMS content types.
"""
from datetime import datetime, timezone

from fastapi import HTTPException, status


PUBLIC_STATUS = "published"

INITIAL_CONTENT_STATUSES = {
    "draft",
    "in_review",
    "published",
}

ALLOWED_STATUS_TRANSITIONS = {
    "draft": {"in_review", "published", "archived"},
    "in_review": {"draft", "changes_requested", "approved"},
    "changes_requested": {"draft", "in_review", "archived"},
    "approved": {"changes_requested", "scheduled", "published", "archived"},
    "scheduled": {"approved", "published", "archived"},
    "published": {"unpublished", "archived"},
    "unpublished": {"draft", "archived"},
    "archived": {"draft"},
}


def normalize_content_status(value) -> str | None:
    """Return a plain status string from a Pydantic enum or raw value."""
    if value is None:
        return None
    return value.value if hasattr(value, "value") else str(value)


def validate_initial_status(target_status) -> str:
    status_value = normalize_content_status(target_status)
    if status_value not in INITIAL_CONTENT_STATUSES:
        allowed = ", ".join(sorted(INITIAL_CONTENT_STATUSES))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Initial content status '{status_value}' is not allowed. Allowed: {allowed}.",
        )
    return status_value


def validate_status_transition(current_status, target_status) -> str:
    current_value = normalize_content_status(current_status)
    target_value = normalize_content_status(target_status)

    if target_value is None or target_value == current_value:
        return current_value

    allowed_targets = ALLOWED_STATUS_TRANSITIONS.get(current_value)
    if allowed_targets is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Current content status '{current_value}' is not recognized.",
        )

    if target_value not in allowed_targets:
        allowed = ", ".join(sorted(allowed_targets))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Invalid content status transition from '{current_value}' "
                f"to '{target_value}'. Allowed: {allowed}."
            ),
        )

    return target_value


def apply_content_status_transition(content, target_status) -> str:
    target_value = validate_status_transition(content.status, target_status)
    content.status = target_value

    if target_value == PUBLIC_STATUS and content.published_at is None:
        content.published_at = datetime.now(timezone.utc)

    return target_value


def apply_content_status_metadata(content, *, actor_id: int | None = None, reason: str | None = None) -> None:
    """Record who changed content status, when, and why."""
    content.status_changed_at = datetime.now(timezone.utc)
    content.status_changed_by_id = actor_id
    content.status_change_reason = reason
