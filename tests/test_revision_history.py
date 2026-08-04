from app.models.audit_event import AuditEvent
from app.schemas.blog import BlogCreate, BlogUpdate
from app.services import blog as blog_service
from app.services.revision_history import list_content_revisions, restore_content_revision


def test_content_updates_create_immutable_sequential_revisions(db_session):
    blog = blog_service.create_blog(
        db_session,
        BlogCreate(title="Original title", author="Editor", content="Original body"),
        status_actor_id=1,
    )
    updated = blog_service.update_blog(
        db_session,
        blog.id,
        BlogUpdate(title="Updated title"),
        status_actor_id=1,
    )

    history = list_content_revisions(db_session, "blog", blog.id)

    assert updated.title == "Updated title"
    assert history["total"] == 2
    assert history["items"][0].version == 2
    assert history["items"][0].action == "updated"
    assert history["items"][0].source == "cms_api"
    assert history["items"][0].approval_reference is None
    assert history["items"][0].snapshot["title"] == "Updated title"
    assert history["items"][1].snapshot["title"] == "Original title"


def test_restore_creates_a_new_revision_without_deleting_history(db_session):
    blog = blog_service.create_blog(
        db_session,
        BlogCreate(title="Version one", author="Editor", content="Body one"),
        status_actor_id=1,
    )
    blog_service.update_blog(
        db_session,
        blog.id,
        BlogUpdate(title="Version two", content="Body two"),
        status_actor_id=1,
    )

    restored = restore_content_revision(
        db_session,
        content_type="blog",
        content_id=blog.id,
        version=1,
        actor_id=1,
        reason="Restore the original approved copy",
    )
    history = list_content_revisions(db_session, "blog", blog.id)

    assert restored.title == "Version one"
    assert restored.content == "Body one"
    assert history["total"] == 3
    assert history["items"][0].version == 3
    assert history["items"][0].action == "restored"
    assert history["items"][0].restored_from_revision_id == history["items"][2].id
    assert (
        db_session.query(AuditEvent)
        .filter(AuditEvent.subject_type == "blog", AuditEvent.subject_id == blog.id)
        .count()
        == 3
    )
