from app.models.webhook import Webhook


def test_webhook_content_types_round_trip_on_test_database(db_session):
    """SQLite tests retain webhook subscriptions as a JSON list."""
    webhook = Webhook(
        url="https://example.com/webhooks/content",
        event="content.published",
        content_types=["blog", "news"],
        secret="test-secret",
    )
    db_session.add(webhook)
    db_session.commit()
    db_session.refresh(webhook)

    assert webhook.content_types == ["blog", "news"]
