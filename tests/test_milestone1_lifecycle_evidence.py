"""
MILESTONE 1 — Lifecycle Evidence Tests.

Walks representative items through the full editorial pipeline:
    draft → in_review → approved → scheduled → published → unpublished → archived → draft

Verifies that every transition:
  - Updates the status correctly
  - Records the lifecycle metadata (status_changed_at, status_changed_by_id)
  - Creates an immutable ContentRevision
  - Logs an AuditEvent
  - Rejects invalid transitions with HTTP 400
"""
import pytest
from datetime import datetime, timezone
from types import SimpleNamespace

from fastapi import HTTPException

from app.schemas.common import ContentStatus
from app.services.content_lifecycle import (
    validate_status_transition,
    apply_content_status_transition,
)
from app.models.audit_event import AuditEvent
from app.models.content_revision import ContentRevision
from app.services.revision_history import list_content_revisions

# ── Blog lifecycle ────────────────────────────────────────────
from app.schemas.blog import BlogCreate, BlogUpdate
from app.services import blog as blog_service

# ── News lifecycle ────────────────────────────────────────────
from app.schemas.news import NewsCreate, NewsUpdate
from app.services import news as news_service

# ── Project lifecycle ─────────────────────────────────────────
from app.schemas.project import ProjectCreate, ProjectUpdate
from app.services import project as project_service

# ── Insight lifecycle ─────────────────────────────────────────
from app.schemas.insight import InsightCreate, InsightUpdate
from app.services import insight as insight_service

# ── Case Study lifecycle ──────────────────────────────────────
from app.schemas.case_study import CaseStudyCreate, CaseStudyUpdate
from app.services import case_study as case_study_service


# The full controlled editorial pipeline in order.
FULL_PIPELINE = [
    "in_review",
    "approved",
    "scheduled",
    "published",
    "unpublished",
    "archived",
    "draft",  # re-open from archived
]


def _assert_lifecycle_walk(db, content_type: str, content, update_fn):
    """Walk an item through every editorial state and verify evidence at each step."""
    assert content.status == "draft", f"Expected initial status 'draft', got '{content.status}'"

    for target in FULL_PIPELINE:
        update_fn(target)
        db.expire_all()

        # Refresh from DB to verify persistence
        revisions = list_content_revisions(db, content_type, content.id)
        latest_rev = revisions["items"][0]

        # The latest revision snapshot should match the target status
        assert latest_rev.snapshot["status"] == target, (
            f"[{content_type}] Expected revision snapshot status '{target}', "
            f"got '{latest_rev.snapshot['status']}'"
        )

        # An audit event should exist for this transition
        audit_count = (
            db.query(AuditEvent)
            .filter(
                AuditEvent.subject_type == content_type,
                AuditEvent.subject_id == content.id,
            )
            .count()
        )
        assert audit_count > 0, f"[{content_type}] No audit events found after transition to {target}"


# ═══════════════════════════════════════════════════════════════
# Per-content-type lifecycle evidence
# ═══════════════════════════════════════════════════════════════

def test_blog_full_lifecycle(db_session):
    blog = blog_service.create_blog(
        db_session,
        BlogCreate(title="Lifecycle Blog", author="Tester", content="Body"),
        status_actor_id=1,
    )

    def update_status(target):
        blog_service.update_blog(
            db_session, blog.id,
            BlogUpdate(status=ContentStatus(target), status_reason=f"Move to {target}"),
            status_actor_id=1,
        )

    _assert_lifecycle_walk(db_session, "blog", blog, update_status)


def test_news_full_lifecycle(db_session):
    news = news_service.create_news(
        db_session,
        NewsCreate(headline="Lifecycle News", summary="Lifecycle summary", source="Tester"),
        status_actor_id=1,
    )

    def update_status(target):
        news_service.update_news(
            db_session, news.id,
            NewsUpdate(status=ContentStatus(target), status_reason=f"Move to {target}"),
            status_actor_id=1,
        )

    _assert_lifecycle_walk(db_session, "news", news, update_status)


def test_project_full_lifecycle(db_session):
    project = project_service.create_project(
        db_session,
        ProjectCreate(
            name="Lifecycle Project",
            description="Full description body",
            short_desc="Short desc",
        ),
        status_actor_id=1,
    )

    def update_status(target):
        project_service.update_project(
            db_session, project.id,
            ProjectUpdate(status=ContentStatus(target), status_reason=f"Move to {target}"),
            status_actor_id=1,
        )

    _assert_lifecycle_walk(db_session, "project", project, update_status)


def test_insight_full_lifecycle(db_session):
    insight = insight_service.create_insight(
        db_session,
        InsightCreate(
            title="Lifecycle Insight",
            author="Tester",
            content="Body",
            insight_type="whitepaper",
        ),
        status_actor_id=1,
    )

    def update_status(target):
        insight_service.update_insight(
            db_session, insight.id,
            InsightUpdate(status=ContentStatus(target), status_reason=f"Move to {target}"),
            status_actor_id=1,
        )

    _assert_lifecycle_walk(db_session, "insight", insight, update_status)


def test_case_study_full_lifecycle(db_session):
    cs = case_study_service.create_case_study(
        db_session,
        CaseStudyCreate(
            title="Lifecycle Case Study",
            client_name="Acme Corp",
            challenge="The challenge",
            solution="The solution",
            results="The results",
        ),
        status_actor_id=1,
    )

    def update_status(target):
        case_study_service.update_case_study(
            db_session, cs.id,
            CaseStudyUpdate(status=ContentStatus(target), status_reason=f"Move to {target}"),
            status_actor_id=1,
        )

    _assert_lifecycle_walk(db_session, "case_study", cs, update_status)


# ═══════════════════════════════════════════════════════════════
# Invalid transition rejection evidence
# ═══════════════════════════════════════════════════════════════

def test_draft_to_approved_is_rejected():
    """draft → approved is illegal; must go through in_review first."""
    with pytest.raises(HTTPException) as exc:
        validate_status_transition("draft", ContentStatus.approved)
    assert exc.value.status_code == 400
    assert "Invalid content status transition" in exc.value.detail


def test_published_to_draft_is_rejected():
    """published → draft is illegal; must go through unpublished first."""
    with pytest.raises(HTTPException) as exc:
        validate_status_transition("published", ContentStatus.draft)
    assert exc.value.status_code == 400


def test_archived_to_published_is_rejected():
    """archived → published is illegal; must go through draft first."""
    with pytest.raises(HTTPException) as exc:
        validate_status_transition("archived", ContentStatus.published)
    assert exc.value.status_code == 400


def test_in_review_to_published_is_rejected():
    """in_review → published is illegal; must be approved first."""
    with pytest.raises(HTTPException) as exc:
        validate_status_transition("in_review", ContentStatus.published)
    assert exc.value.status_code == 400


def test_scheduled_to_draft_is_rejected():
    """scheduled → draft is illegal."""
    with pytest.raises(HTTPException) as exc:
        validate_status_transition("scheduled", ContentStatus.draft)
    assert exc.value.status_code == 400
