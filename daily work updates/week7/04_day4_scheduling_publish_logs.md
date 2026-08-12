# Day 10 — Scheduling, Publish Logs & Recovery Controls

**Date:** August 14, 2026  
**Status:** Not Started

---

## Goal

Give operators control over **scheduled publishing** and **integration failures** by building scheduling controls with timezone support, publish/webhook delivery logs, and retry/recovery mechanisms.

---

## Simple Explanation

> Sometimes you want a blog post to go live on Friday at 9 AM, not right now. That's scheduling.  
> Sometimes a webhook fails to deliver — the external server was down, or there was a timeout. That's a failure.  
> Today, we build the tools to:
> 1. **Schedule content** — pick a date and time for it to be published automatically
> 2. **See what happened** — view a history of every publish attempt and webhook delivery
> 3. **Fix problems** — retry failed webhooks or mark them as resolved

---

## Tasks

### 1. Build Scheduling Controls

**What:** Add date/time scheduling for content publishing.

**Details:**
- When an operator changes status to `scheduled`, show a **datetime picker**
- The datetime picker should:
  - Support **timezone selection** (show user's local timezone by default)
  - Validate that the scheduled time is **in the future**
  - Show **confirmation** before scheduling
- Add **schedule/reschedule/cancel** controls:
  - **Schedule** — Set a future publish date
  - **Reschedule** — Change the scheduled date
  - **Cancel Schedule** — Remove the scheduled date (revert to `approved`)
- Store the scheduled date in the content model (`scheduled_at` field)
- Create a **background job** concept that checks for due content and publishes it
  - For MVP, this can be a simple periodic check endpoint
  - In production, this would use APScheduler, Celery, or similar

**Files to create/modify:**
- `admin/src/features/operations/components/ScheduleDateTimePicker.tsx` (NEW)
- `admin/src/features/operations/components/ScheduleConfirmDialog.tsx` (NEW)
- `admin/src/features/operations/pages/SchedulePublishPage.tsx` (NEW)
- `app/api/v1/operations.py` (MODIFY — add scheduling endpoints)
- `app/services/operations.py` (MODIFY — add scheduling logic)

### 2. Build Publish/Webhook History Page

**What:** A comprehensive view of all publish attempts and webhook deliveries.

**Details:**
- Create a **history page** showing all publish events
- Each entry shows:
  - **Content title** and **type**
  - **Event type** (published, unpublished, webhook_sent)
  - **Timestamp**
  - **Status** (success, failed, pending)
  - **Destination** (webhook URL)
  - **Response code** (HTTP status)
  - **Duration** (how long the request took)
  - **Error message** (if failed)
  - **Retry count** (how many times retried)
- Allow filtering by:
  - Event type
  - Content type
  - Status (success/failed)
  - Date range
- Allow **sorting** by date, status, duration
- Show **summary stats** at the top:
  - Total deliveries
  - Success rate
  - Average duration
  - Failed deliveries

**Files to create/modify:**
- `admin/src/features/operations/pages/PublishLogsPage.tsx` (NEW)
- `admin/src/features/operations/components/PublishLogTable.tsx` (NEW)
- `admin/src/features/operations/components/PublishLogDetail.tsx` (NEW)
- `admin/src/features/operations/components/PublishLogStats.tsx` (NEW)

### 3. Build Retry and Recovery Controls

**What:** Allow operators to retry failed webhooks or mark them as resolved.

**Details:**
- For each **failed** webhook delivery:
  - Show a **"Retry"** button that re-sends the webhook
  - Show a **"Resolve"** button that marks the failure as manually resolved
  - Show the **original request** and **response** for debugging
- Implement **safe retry**:
  - Max retry count (e.g., 3 retries)
  - Exponential backoff (1s, 2s, 4s)
  - Create a new log entry for each retry attempt
- Implement **manual resolve**:
  - Operator marks a failure as resolved with a comment
  - Record the resolution in audit events
- Show **retry history** — all attempts for a single delivery

**Files to create/modify:**
- `admin/src/features/operations/components/RetryButton.tsx` (NEW)
- `admin/src/features/operations/components/ResolveButton.tsx` (NEW)
- `admin/src/features/operations/components/RetryHistory.tsx` (NEW)

### 4. Backend — Scheduling & Publish Log Endpoints

**What:** Add backend endpoints for scheduling, publish history, and retry.

**Details:**
- `POST /operations/schedule` — Schedule content for future publishing
- `POST /operations/reschedule` — Change scheduled date
- `POST /operations/cancel-schedule` — Cancel scheduled publish
- `GET /operations/publish-logs` — Get publish/webhook delivery history
- `POST /operations/retry-publish` — Retry a failed webhook
- `POST /operations/resolve-failure` — Mark failure as resolved
- `POST /operations/check-scheduled` — Check for due content and publish (cron endpoint)

**Files to create/modify:**
- `app/api/v1/operations.py` (MODIFY — add scheduling and log endpoints)
- `app/services/operations.py` (MODIFY — add scheduling and retry logic)
- `app/models/blog.py` (CHECK — ensure `scheduled_at` field exists)
- `app/models/news.py` (CHECK — ensure `scheduled_at` field exists)
- `app/models/project.py` (CHECK — ensure `scheduled_at` field exists)
- `app/models/insight.py` (CHECK — ensure `scheduled_at` field exists)
- `app/models/case_study.py` (CHECK — ensure `scheduled_at` field exists)

---

## Backend Work (Day 10)

### New Endpoints

```python
# app/api/v1/operations.py

@router.post("/schedule")
def schedule_content(
    data: ScheduleAction,
    db: DbDep,
    admin: PublishDep,  # requires 'publish' permission
    idempotency: IdempotencyDep = None,
):
    """
    Schedule content for future publishing.
    - Validates scheduled_at is in the future
    - Validates timezone is valid
    - Updates content status to 'scheduled'
    - Records audit event
    """

@router.post("/reschedule")
def reschedule_content(
    data: RescheduleAction,
    db: DbDep,
    admin: PublishDep,
    idempotency: IdempotencyDep = None,
):
    """
    Change the scheduled publish date.
    - Validates new scheduled_at is in the future
    - Records audit event with old and new dates
    """

@router.post("/cancel-schedule")
def cancel_schedule(
    data: CancelScheduleAction,
    db: DbDep,
    admin: PublishDep,
    idempotency: IdempotencyDep = None,
):
    """
    Cancel scheduled publishing.
    - Reverts status to 'approved'
    - Records audit event
    """

@router.get("/publish-logs")
def get_publish_logs(
    db: DbDep,
    user: ReadDep,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    event_type: str | None = Query(None),
    content_type: str | None = Query(None),
    status: str | None = Query(None),  # success/failed
    date_from: str | None = Query(None),
    date_to: str | None = Query(None),
):
    """
    Get publish/webhook delivery history.
    Returns paginated list with all delivery details.
    """

@router.post("/retry-publish")
def retry_publish(
    data: RetryAction,
    db: DbDep,
    admin: PublishDep,
    idempotency: IdempotencyDep = None,
):
    """
    Retry a failed webhook delivery.
    - Validates the log entry exists and is failed
    - Re-dispatches the webhook
    - Creates new log entry for retry attempt
    """

@router.post("/resolve-failure")
def resolve_failure(
    data: ResolveAction,
    db: DbDep,
    admin: PublishDep,
):
    """
    Mark a failed delivery as manually resolved.
    - Requires comment explaining resolution
    - Records audit event
    """

# Schema definitions
class ScheduleAction(BaseModel):
    content_type: str
    content_id: int
    scheduled_at: datetime  # ISO 8601 with timezone
    timezone: str = "UTC"

class RescheduleAction(BaseModel):
    content_type: str
    content_id: int
    scheduled_at: datetime
    timezone: str = "UTC"

class CancelScheduleAction(BaseModel):
    content_type: str
    content_id: int

class RetryAction(BaseModel):
    log_id: int

class ResolveAction(BaseModel):
    log_id: int
    comment: str  # Required
```

### New Service Functions

```python
# app/services/operations.py

def schedule_content(db, content_type, content_id, actor_id, scheduled_at, timezone_str):
    """
    1. Load content by type and ID
    2. Validate current status allows scheduling (must be 'approved')
    3. Validate scheduled_at is in the future
    4. Update content.status = 'scheduled'
    5. Update content.scheduled_at = scheduled_at
    6. Record audit event
    7. Create revision snapshot
    """

def reschedule_content(db, content_type, content_id, actor_id, new_scheduled_at, timezone_str):
    """
    1. Load content by type and ID
    2. Validate current status is 'scheduled'
    3. Validate new_scheduled_at is in the future
    4. Update content.scheduled_at = new_scheduled_at
    5. Record audit event with old and new dates
    """

def cancel_schedule(db, content_type, content_id, actor_id):
    """
    1. Load content by type and ID
    2. Validate current status is 'scheduled'
    3. Revert status to 'approved'
    4. Clear scheduled_at
    5. Record audit event
    """

def check_scheduled_content(db):
    """
    Called periodically (cron or background task).
    1. Find all content with status='scheduled' and scheduled_at <= now
    2. For each item:
       a. Publish it (apply status transition)
       b. Dispatch webhooks
       c. Record audit event
       d. Create revision snapshot
    3. Return list of published items
    """
```

### Database Check

Ensure all 5 content models have `scheduled_at` field:

```python
# Check in each model file:
# app/models/blog.py
# app/models/news.py
# app/models/project.py
# app/models/insight.py
# app/models/case_study.py

scheduled_at: Mapped[datetime | None] = mapped_column(
    DateTime(timezone=True), nullable=True
)
```

If missing, add a new Alembic migration.

---

## Frontend Work (Day 10)

### New Components Structure

```
admin/src/features/operations/
+-- pages/
¦   +-- SchedulePublishPage.tsx          — Scheduling controls page
¦   +-- PublishLogsPage.tsx              — Publish/webhook history page
+-- components/
    +-- ScheduleDateTimePicker.tsx       — Timezone-aware datetime picker
    +-- ScheduleConfirmDialog.tsx        — Schedule confirmation
    +-- PublishLogTable.tsx              — Delivery log table
    +-- PublishLogDetail.tsx             — Log entry detail view
    +-- PublishLogStats.tsx              — Summary statistics
    +-- RetryButton.tsx                  — Retry failed webhook
    +-- ResolveButton.tsx                — Mark failure resolved
    +-- RetryHistory.tsx                 — Retry attempt history
```

### Router Changes

```typescript
// admin/src/router/index.tsx — Add these routes:
{
  path: 'operations/schedule',
  element: <PermissionRoute permission="publish"><SchedulePublishPage /></PermissionRoute>
},
{
  path: 'operations/logs',
  element: <PermissionRoute permission="read_content"><PublishLogsPage /></PermissionRoute>
},
```

### Sidebar Changes

```typescript
// Add to Operations section:
{ to: '/operations/schedule', icon: Calendar, label: 'Schedule', permission: 'publish', variants: scheduleVariants },
{ to: '/operations/logs', icon: ScrollText, label: 'Publish Logs', permission: 'read_content', variants: logsVariants },
```

---

## Acceptance Criteria

- [ ] Schedule controls allow picking date, time, and timezone
- [ ] Validation prevents scheduling in the past
- [ ] Schedule button updates content status to 'scheduled'
- [ ] Reschedule button allows changing the date
- [ ] Cancel schedule button reverts to 'approved'
- [ ] Publish Logs page shows all delivery attempts
- [ ] Each log entry shows content, event, status, response code, duration, error
- [ ] Filter by event type works
- [ ] Filter by content type works
- [ ] Filter by status (success/failed) works
- [ ] Filter by date range works
- [ ] Summary stats show total, success rate, average duration, failed count
- [ ] Retry button re-sends failed webhooks
- [ ] Max retry count enforced (3 retries)
- [ ] Resolve button marks failures as resolved with comment
- [ ] Retry history shows all attempts
- [ ] Backend scheduling endpoints enforce RBAC
- [ ] Backend scheduling validates future dates
- [ ] Check-scheduled endpoint publishes due content
- [ ] All existing tests still pass

---

## Dependencies

- ? Backend content lifecycle model (already exists)
- ? Backend webhook dispatcher (already exists)
- ? Backend webhook logs (already exists)
- ? Backend audit events (already exists)
- ? Backend RBAC/permissions (already exists)
- ?? `scheduled_at` field on content models (CHECK — may need migration)
- ? `Calendar` icon from lucide-react (available)

---

## Estimated Time: 8–10 hours
