from types import SimpleNamespace

import pytest
from fastapi import HTTPException

from app.core.permissions import enforce_publish_permission
from app.schemas.common import ContentStatus
from app.services.content_lifecycle import (
    apply_content_status_transition,
    validate_initial_status,
    validate_status_transition,
)


def test_content_status_includes_controlled_lifecycle_states():
    assert {status.value for status in ContentStatus} == {
        "draft",
        "in_review",
        "changes_requested",
        "approved",
        "scheduled",
        "published",
        "unpublished",
        "archived",
    }


def test_initial_status_allows_existing_direct_publish_behavior():
    assert validate_initial_status(ContentStatus.published) == "published"


def test_valid_lifecycle_transition_is_allowed():
    assert validate_status_transition("in_review", ContentStatus.approved) == "approved"


def test_invalid_lifecycle_transition_is_rejected():
    with pytest.raises(HTTPException) as exc_info:
        validate_status_transition("draft", ContentStatus.approved)

    assert exc_info.value.status_code == 400
    assert "Invalid content status transition" in exc_info.value.detail


def test_publish_transition_sets_published_at_once():
    content = SimpleNamespace(status="approved", published_at=None)

    apply_content_status_transition(content, ContentStatus.published)

    assert content.status == "published"
    assert content.published_at is not None


def test_editor_cannot_approve_or_publish_content():
    editor = SimpleNamespace(role="editor")

    with pytest.raises(HTTPException) as approve_exc:
        enforce_publish_permission(editor, ContentStatus.approved)
    assert approve_exc.value.status_code == 403

    with pytest.raises(HTTPException) as publish_exc:
        enforce_publish_permission(editor, ContentStatus.published)
    assert publish_exc.value.status_code == 403


def test_admin_can_approve_and_publish_content():
    admin = SimpleNamespace(role="admin")

    enforce_publish_permission(admin, ContentStatus.approved)
    enforce_publish_permission(admin, ContentStatus.published)
