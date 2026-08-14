# Stats API

The Stats API provides aggregated dashboard statistics across all content types, grouped by lifecycle status.

---

## Base URL
`/api/v1/stats`

## Authentication
All endpoints require authentication with `read_content` permission (editor, admin, super_admin, user).

---

## Endpoints

### 1. Dashboard Stats
Get aggregated counts by status for all content types.

- **URL**: `/dashboard`
- **Method**: `GET`
- **Permissions**: `read_content`

#### Success Response (`200 OK`)
```json
{
  "blogs": {
    "draft": 8,
    "in_review": 5,
    "changes_requested": 2,
    "approved": 3,
    "scheduled": 2,
    "published": 30,
    "unpublished": 1,
    "archived": 3
  },
  "news": {
    "draft": 4,
    "in_review": 2,
    "changes_requested": 0,
    "approved": 1,
    "scheduled": 1,
    "published": 15,
    "unpublished": 0,
    "archived": 2
  },
  "projects": {
    "draft": 5,
    "in_review": 3,
    "changes_requested": 1,
    "approved": 2,
    "scheduled": 1,
    "published": 18,
    "unpublished": 1,
    "archived": 2
  },
  "insights": {
    "draft": 3,
    "in_review": 1,
    "changes_requested": 1,
    "approved": 1,
    "scheduled": 1,
    "published": 9,
    "unpublished": 1,
    "archived": 1
  },
  "case_studies": {
    "draft": 3,
    "in_review": 1,
    "changes_requested": 0,
    "approved": 1,
    "scheduled": 0,
    "published": 6,
    "unpublished": 0,
    "archived": 1
  }
}
```

---

## Content Type Status Mappings

All five content types use the same 7-state lifecycle:
| Status | Description |
|--------|-------------|
| `draft` | Editable internal work |
| `in_review` | Submitted for editorial review |
| `changes_requested` | Needs revision |
| `approved` | Editor-approved, ready to publish/schedule |
| `scheduled` | Queued for future publication |
| `published` | **Only publicly visible state** |
| `unpublished` | Removed from public, retained in CMS |
| `archived` | Retired content, hidden from lists |

---

## Use Cases

### Admin Dashboard Summary
The `/dashboard` endpoint powers the admin dashboard analytics header, showing quick stats for:
- Total published content
- Drafts in progress
- Items awaiting review
- Scheduled publications
- Archived content

### Content Health Monitoring
Track content pipeline health by monitoring:
- `draft` vs `published` ratios
- `in_review` queue size
- `changes_requested` backlog
- `scheduled` vs `published` timing

---

## Permission Matrix

| Role | Access |
|------|--------|
| `super_admin` | YES |
| `admin` | YES |
| `editor` | YES |
| `user` | YES |

---

## Example Usage

```bash
# Get dashboard stats
curl -H "Authorization: Bearer <token>" \
  https://api.o2geeks.com/api/v1/stats/dashboard
```

---

## Related Endpoints

For more detailed operations metrics, see:
- [Operations Console - Workflow Overview](operations.md#1-workflow-overview) - Includes failed webhooks and recent activity
- [Operations Console - Review Queue](operations.md#2-review-queue) - Detailed review queue with pagination
- [Operations Console - Schedule Queue](operations.md#3-schedule-queue) - Scheduled items with timestamps