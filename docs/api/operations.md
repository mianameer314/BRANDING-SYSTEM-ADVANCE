# Operations Console API

The Operations Console API provides aggregated workflow metrics, consolidated review queues across all content types, scheduling operations, and webhook publish-log management.

---

## Base URL
`/api/v1/operations`

## Authentication
All endpoints require authentication with appropriate permissions:
- **Read endpoints**: `view_drafts` permission (editor, admin, super_admin)
- **Schedule/Publish actions**: `publish` permission (admin, super_admin)
- **Log management**: `manage_webhooks` permission (admin, super_admin)

---

## Endpoints

### 1. Workflow Overview
Aggregated workflow metrics across all content types. Returns counts per lifecycle stage per content type.

- **URL**: `/workflow-overview`
- **Method**: `GET`
- **Permissions**: `view_drafts`

#### Success Response (`200 OK`)
```json
{
  "total_content": 142,
  "stages": {
    "draft": {"total": 23, "by_type": {"blog": 8, "news": 4, "project": 5, "insight": 3, "case_study": 3}},
    "in_review": {"total": 12, "by_type": {"blog": 5, "news": 2, "project": 3, "insight": 1, "case_study": 1}},
    "changes_requested": {"total": 4, "by_type": {"blog": 2, "news": 0, "project": 1, "insight": 1, "case_study": 0}},
    "approved": {"total": 8, "by_type": {"blog": 3, "news": 1, "project": 2, "insight": 1, "case_study": 1}},
    "scheduled": {"total": 5, "by_type": {"blog": 2, "news": 1, "project": 1, "insight": 1, "case_study": 0}},
    "published": {"total": 78, "by_type": {"blog": 30, "news": 15, "project": 18, "insight": 9, "case_study": 6}},
    "unpublished": {"total": 3, "by_type": {"blog": 1, "news": 0, "project": 1, "insight": 1, "case_study": 0}},
    "archived": {"total": 9, "by_type": {"blog": 3, "news": 2, "project": 2, "insight": 1, "case_study": 1}}
  },
  "failed_webhooks": 2,
  "recent_activity": [
    {
      "id": 42,
      "content_type": "blog",
      "title": "Headless CMS in 2026",
      "slug": "headless-cms-2026",
      "status": "published",
      "author": "Jane Doe",
      "created_at": "2026-07-20T11:30:00Z",
      "updated_at": "2026-07-20T12:00:00Z",
      "status_changed_at": "2026-07-20T12:00:00Z",
      "cover_image": "/media/blogs/cover.webp",
      "ai_generated": false
    }
  ]
}
```

---

### 2. Review Queue
Consolidated editorial review queue across all content types (in_review, changes_requested, approved states).

- **URL**: `/review-queue`
- **Method**: `GET`
- **Permissions**: `view_drafts`

#### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page index (ge=1) |
| `per_page` | integer | 20 | Page size (ge=1, le=100) |
| `status` | string | null | Filter: `in_review`, `changes_requested`, `approved` |
| `content_type` | string | null | Filter by content type |
| `search` | string | null | Title search |

#### Success Response (`200 OK`)
```json
{
  "items": [
    {
      "id": 42,
      "content_type": "blog",
      "title": "Headless CMS in 2026",
      "slug": "headless-cms-2026",
      "status": "in_review",
      "author": "Jane Doe",
      "created_at": "2026-07-20T11:30:00Z",
      "status_changed_at": "2026-07-20T12:00:00Z",
      "cover_image": "/media/blogs/cover.webp",
      "ai_generated": false
    }
  ],
  "total": 12,
  "page": 1,
  "per_page": 20,
  "total_pages": 1
}
```

---

### 3. Schedule Queue
Get paginated schedule queue (approved and scheduled content items).

- **URL**: `/schedule-queue`
- **Method**: `GET`
- **Permissions**: `publish`

#### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page index (ge=1) |
| `per_page` | integer | 20 | Page size (ge=1, le=100) |
| `content_type` | string | null | Filter by content type |
| `search` | string | null | Title search |

#### Success Response (`200 OK`)
```json
{
  "items": [
    {
      "id": 45,
      "content_type": "blog",
      "title": "Q3 Product Launch",
      "status": "scheduled",
      "author": "Jane Doe",
      "scheduled_at": "2026-08-01T09:00:00Z",
      "cover_image": "/media/blogs/launch.webp",
      "ai_generated": false
    }
  ],
  "total": 5,
  "page": 1,
  "per_page": 20,
  "total_pages": 1
}
```

---

### 4. Schedule Content
Schedule content for future publication (requires `approved` status).

- **URL**: `/schedule`
- **Method**: `POST`
- **Permissions**: `publish`
- **Content-Type**: `application/json`

#### Request Body
```json
{
  "content_type": "blog",
  "content_id": 45,
  "scheduled_at": "2026-08-01T09:00:00Z",
  "comment": "Scheduled for Q3 launch"
}
```

#### Success Response (`200 OK`)
```json
{
  "message": "Content scheduled",
  "status": "scheduled",
  "scheduled_at": "2026-08-01T09:00:00Z"
}
```

#### Error Responses
- `400 Bad Request`: Content not in approved state
- `403 Forbidden`: Insufficient permissions
- `422 Unprocessable Entity`: Invalid datetime

---

### 5. Reschedule Content
Reschedule already-scheduled content.

- **URL**: `/reschedule`
- **Method**: `POST`
- **Permissions**: `publish`
- **Content-Type**: `application/json`

#### Request Body
```json
{
  "content_type": "blog",
  "content_id": 45,
  "scheduled_at": "2026-08-15T09:00:00Z",
  "comment": "Pushed back 2 weeks"
}
```

#### Success Response (`200 OK`)
```json
{
  "message": "Content rescheduled",
  "status": "scheduled",
  "scheduled_at": "2026-08-15T09:00:00Z"
}
```

---

### 6. Cancel Schedule
Cancel scheduled content and revert to approved.

- **URL**: `/cancel-schedule`
- **Method**: `POST`
- **Permissions**: `publish`
- **Content-Type**: `application/json`

#### Request Body
```json
{
  "content_type": "blog",
  "content_id": 45,
  "comment": "No longer needed"
}
```

#### Success Response (`200 OK`)
```json
{
  "message": "Schedule cancelled",
  "status": "approved"
}
```

---

### 7. Publish Logs
Get paginated webhook publish delivery logs.

- **URL**: `/publish-logs`
- **Method**: `GET`
- **Permissions**: `manage_webhooks`

#### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page index (ge=1) |
| `per_page` | integer | 20 | Page size (ge=1, le=100) |
| `event` | string | null | Filter by event (e.g., `content.published`) |
| `content_type` | string | null | Filter by content type |
| `status` | string | null | Filter by status (`success`, `failed`) |

#### Success Response (`200 OK`)
```json
{
  "items": [
    {
      "id": 105,
      "webhook_id": 1,
      "event": "content.published",
      "content_type": "blog",
      "content_id": 42,
      "request_url": "https://your-server.com/webhook",
      "response_status": 200,
      "success": true,
      "error_message": null,
      "retry_count": 0,
      "resolved_at": null,
      "delivered_at": "2026-07-24T12:05:00Z"
    }
  ],
  "total": 5,
  "page": 1,
  "per_page": 20,
  "total_pages": 1
}
```

---

### 8. Retry Publish
Retry a failed webhook delivery (runs in background).

- **URL**: `/retry-publish`
- **Method**: `POST`
- **Permissions**: `manage_webhooks`
- **Content-Type**: `application/json`

#### Request Body
```json
{
  "log_id": 105
}
```

#### Success Response (`200 OK`)
```json
{
  "message": "Retry dispatched",
  "retry_count": 1
}
```

---

### 9. Resolve Failure
Manually mark a failed webhook log as resolved.

- **URL**: `/resolve-failure`
- **Method**: `POST`
- **Permissions**: `manage_webhooks`
- **Content-Type**: `application/json`

#### Request Body
```json
{
  "log_id": 105,
  "comment": "Endpoint fixed, verified working"
}
```

#### Success Response (`200 OK`)
```json
{
  "message": "Failure resolved",
  "resolved_at": "2026-07-25T15:00:00Z"
}
```

---

## Permission Matrix

| Endpoint | `editor` | `admin` | `super_admin` |
|----------|----------|---------|---------------|
| `workflow-overview` | YES | YES | YES |
| `review-queue` | YES | YES | YES |
| `schedule-queue` | NO | YES | YES |
| `schedule` | NO | YES | YES |
| `reschedule` | NO | YES | YES |
| `cancel-schedule` | NO | YES | YES |
| `publish-logs` | NO | YES | YES |
| `retry-publish` | NO | YES | YES |
| `resolve-failure` | NO | YES | YES |

---

## Scheduling Concepts

### APScheduler Integration
- Scheduled content uses APScheduler cron + interval jobs
- Jobs are stored in PostgreSQL and recovered on backend restart
- Timezone-aware: all `scheduled_at` values use ISO 8601 with timezone

### Lifecycle Transitions
```
approved --> scheduled --> published
   ^           |
   |           v
   +-------- cancelled (back to approved)
```

### Publish Log Retention
- Failed deliveries retained for 30 days
- Manual resolution marks incident as resolved (does not delete)
- Retry count tracked per log entry

---

## Example Workflow

```bash
# 1. Get workflow overview
curl -H "Authorization: Bearer <token>" \
  https://api.o2geeks.com/api/v1/operations/workflow-overview

# 2. Review queue
curl -H "Authorization: Bearer <token>" \
  "https://api.o2geeks.com/api/v1/operations/review-queue?status=in_review"

# 3. Schedule content
curl -X POST -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '"'"'{"content_type":"blog","content_id":45,"scheduled_at":"2026-08-01T09:00:00Z"}"'"' \
  https://api.o2geeks.com/api/v1/operations/schedule

# 4. View publish logs
curl -H "Authorization: Bearer <token>" \
  "https://api.o2geeks.com/api/v1/operations/publish-logs?status=failed"

# 5. Retry failed delivery
curl -X POST -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '"'"'{"log_id":105}"'"' \
  https://api.o2geeks.com/api/v1/operations/retry-publish
```