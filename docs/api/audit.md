# Audit & Revisions API

The Audit & Revisions API provides immutable revision history for all content types and a super-admin operational audit stream across content, media, users, and webhooks.

---

## Base URL
`/api/v1/audit`

## Authentication
All endpoints require authentication with appropriate permissions:
- **Revision endpoints**: `view_drafts` permission (editor, admin, super_admin)
- **Restore endpoints**: `publish` permission (admin, super_admin)
- **Audit events**: `manage_users` permission (super_admin only)

---

## Endpoints

### 1. List Content Revisions
Retrieve immutable snapshots for one content item, newest version first.

- **URL**: `/content/{content_type}/{content_id}/revisions`
- **Method**: `GET`
- **Permissions**: `view_drafts`

#### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `content_type` | string | Content type: `blog`, `news`, `project`, `insight`, `case_study` |
| `content_id` | integer | ID of the content item |

#### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page index (ge=1) |
| `per_page` | integer | 20 | Page size (ge=1, le=100) |

#### Success Response (`200 OK`)
```json
{
  "items": [
    {
      "version": 3,
      "content_type": "blog",
      "content_id": 42,
      "payload": {
        "title": "Updated Title",
        "content": "<p>Updated content...</p>",
        "status": "published"
      },
      "actor_id": 1,
      "actor_email": "editor@o2geeks.com",
      "reason": "Updated for clarity",
      "created_at": "2026-07-25T14:30:00Z"
    },
    {
      "version": 2,
      "content_type": "blog",
      "content_id": 42,
      "payload": {
        "title": "Original Title",
        "content": "<p>Original content...</p>",
        "status": "draft"
      },
      "actor_id": 1,
      "actor_email": "editor@o2geeks.com",
      "reason": "Initial draft",
      "created_at": "2026-07-25T10:00:00Z"
    }
  ],
  "total": 2,
  "page": 1,
  "per_page": 20,
  "total_pages": 1
}
```

#### Error Responses
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Content item not found

---

### 2. Restore Prior Revision
Restore a prior snapshot; the restore itself becomes the next revision.

- **URL**: `/content/{content_type}/{content_id}/revisions/{version}/restore`
- **Method**: `POST`
- **Permissions**: `publish`
- **Idempotency**: Supported via `Idempotency-Key` header

#### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `content_type` | string | Content type: `blog`, `news`, `project`, `insight`, `case_study` |
| `content_id` | integer | ID of the content item |
| `version` | integer | Revision version number to restore |

#### Request Body
```json
{
  "reason": "Reverting to v2 due to factual error in v3"
}
```

#### Success Response (`200 OK`)
```json
{
  "content_type": "blog",
  "content_id": 42,
  "restored_version": 2,
  "status": "draft",
  "message": "Restored revision 2; a new restore revision was recorded."
}
```

#### Error Responses
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Content item or revision not found
- `409 Conflict`: Cannot restore (e.g., content locked)

---

### 3. List Audit Events
Super-admin operational audit stream across content, media, users, and webhooks.

- **URL**: `/events`
- **Method**: `GET`
- **Permissions**: `manage_users` (super_admin only)

#### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page index (ge=1) |
| `per_page` | integer | 50 | Page size (ge=1, le=100) |
| `subject_type` | string | null | Filter by subject type (content, user, webhook, media) |
| `subject_id` | integer | null | Filter by subject ID |

#### Success Response (`200 OK`)
```json
{
  "items": [
    {
      "id": 1024,
      "subject_type": "content",
      "subject_id": 42,
      "action": "status_changed",
      "actor_id": 1,
      "actor_email": "admin@o2geeks.com",
      "payload": {
        "content_type": "blog",
        "old_status": "approved",
        "new_status": "published"
      },
      "ip_address": "192.168.1.100",
      "user_agent": "Mozilla/5.0...",
      "created_at": "2026-07-25T15:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "per_page": 50,
  "total_pages": 1
}
```

#### Audit Event Types
| Subject Type | Actions |
|--------------|---------|
| `content` | `created`, `updated`, `deleted`, `status_changed`, `restored` |
| `user` | `created`, `updated`, `role_changed`, `deactivated`, `password_changed` |
| `webhook` | `created`, `updated`, `deleted`, `delivery_success`, `delivery_failed` |
| `media` | `uploaded`, `deleted`, `replaced` |

---

## Revision Schema (`ContentRevisionOut`)

| Field | Type | Description |
|-------|------|-------------|
| `version` | integer | Sequential revision number (1 = original) |
| `content_type` | string | Type of content |
| `content_id` | integer | Content item ID |
| `payload` | object | Full content snapshot at that version |
| `actor_id` | integer | User who made the change |
| `actor_email` | string | Email of the actor |
| `reason` | string | Optional reason provided |
| `created_at` | datetime | Timestamp of the revision |

## Audit Event Schema (`AuditEventOut`)

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Event ID |
| `subject_type` | string | Type of subject (content, user, webhook, media) |
| `subject_id` | integer | Subject ID |
| `action` | string | Action performed |
| `actor_id` | integer | User who performed action |
| `actor_email` | string | Email of the actor |
| `payload` | object | Event-specific details |
| `ip_address` | string | Client IP |
| `user_agent` | string | Client user agent |
| `created_at` | datetime | Event timestamp |

---

## Key Concepts

### Immutable History
- Every content change creates a new revision - history is never deleted
- Revisions are stored in a single ACID transaction with the content change
- Restore operations create a **new revision** copying the old payload forward

### Permission Model
| Role | View Revisions | Restore | View Audit Events |
|------|----------------|---------|-------------------|
| `super_admin` | YES | YES | YES |
| `admin` | YES | YES | NO |
| `editor` | YES | NO | NO |
| `user` | NO | NO | NO |

### Idempotency
Restore operations support `Idempotency-Key` header for safe retries without duplicate restores.

---

## Example Workflow

```bash
# 1. View revision history
curl -H "Authorization: Bearer <token>" \
  "https://api.o2geeks.com/api/v1/audit/content/blog/42/revisions"

# 2. Restore version 2
curl -X POST -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: restore-42-v2-$(date +%s)" \
  -d '"'"'{"reason": "Reverting erroneous publish"}"'"' \
  "https://api.o2geeks.com/api/v1/audit/content/blog/42/revisions/2/restore"

# 3. View audit trail (super admin only)
curl -H "Authorization: Bearer <super_admin_token>" \
  "https://api.o2geeks.com/api/v1/audit/events?subject_type=content&subject_id=42"
```