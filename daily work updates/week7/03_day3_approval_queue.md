# Day 9 — Approval Queue & Reviewer Actions

**Date:** August 13, 2026  
**Status:** Not Started

---

## Goal

Make approval decisions **explicit, auditable, and easy to operate** by building a dedicated approval queue where reviewers can see all pending items and take action with full role enforcement.

---

## Simple Explanation

> Right now, to approve or reject content, a reviewer has to go to each content item individually, change its status, and hope they remember why. That's not a real review workflow.  
> Today, we build a **review queue** — a single page where a reviewer can see *everything* waiting for their attention, organized by priority, with all the information they need to make a decision.  
> They can approve, request changes, or reject — and every action is recorded with who did it, when, and why.

---

## Tasks

### 1. Build Review Queue Page

**What:** A dedicated page showing all content items waiting for review.

**Details:**
- Create a **queue view** that shows all items with status `in_review` or `changes_requested`
- Each item in the queue shows:
  - **Content title** and **content type badge** (Blog, News, etc.)
  - **Owner/author** name
  - **Age** — how long it's been waiting (e.g., "2 days, 3 hours")
  - **Validation status** — are all required fields filled?
  - **Media status** — does it have a cover image? Are all media files uploaded?
  - **AI-generated flag** — was this content created by AI?
  - **Requested publish date** — when does the owner want this published?
  - **Last updated** timestamp
- Sort by **age** (oldest first) by default
- Allow sorting by: age, content type, owner, requested date
- Allow filtering by: content type, owner, AI-generated flag
- Show **count** of pending items at the top

**Files to create/modify:**
- `admin/src/features/operations/pages/ApprovalQueuePage.tsx` (NEW)
- `admin/src/features/operations/components/QueueItemCard.tsx` (NEW)
- `admin/src/features/operations/components/QueueFilterBar.tsx` (NEW)

### 2. Build Approval Action Panel

**What:** The action panel where reviewers make decisions.

**Details:**
- For each queue item, show an **action panel** with three buttons:
  - ? **Approve** — Moves to `approved` status
  - ?? **Request Changes** — Moves to `changes_requested` status
  - ? **Reject** — Moves to `archived` status (or `draft` with reason)
- Each action requires:
  - **Comment** (required for reject, optional for approve/request changes)
  - **Reason** — pre-defined reasons dropdown (e.g., "Needs more detail", "Missing images", "SEO needs work")
- Show **role enforcement** — only users with `approve` permission can approve
- Show **confirmation dialog** before executing action
- After action, remove item from queue and show success toast
- Record the decision in:
  - **Audit event** (who did what, when, why)
  - **Revision history** (status change with reason)

**Files to create/modify:**
- `admin/src/features/operations/components/ApprovalActionPanel.tsx` (NEW)
- `admin/src/features/operations/components/ApprovalConfirmDialog.tsx` (NEW)
- `admin/src/features/operations/components/ReviewerCommentInput.tsx` (NEW)

### 3. Build Queue Detail View

**What:** Expandable detail view for each queue item.

**Details:**
- Clicking a queue item expands to show:
  - **Content preview** (title, excerpt, first paragraph)
  - **Revision history** (last 3-5 revisions)
  - **Validation warnings** (missing fields, incomplete media)
  - **Owner info** (name, email, role)
  - **Timeline** — when it was created, last edited, submitted for review
  - **Previous decisions** (if it was sent back for changes before)
- Allow **inline editing** (if time permits) — fix minor issues without leaving the queue
- Show **"View Full Content"** link to open in the content editor

**Files to create/modify:**
- `admin/src/features/operations/components/QueueItemDetail.tsx` (NEW)
- `admin/src/features/operations/components/QueueItemTimeline.tsx` (NEW)

### 4. Backend — Approval Endpoints

**What:** Add backend endpoints for the approval workflow actions.

**Details:**
- `POST /operations/approve` — Approve content with optional comment
- `POST /operations/request-changes` — Request changes with required comment
- `POST /operations/reject` — Reject content with required comment
- `GET /operations/review-queue` — Get paginated review queue
- All endpoints enforce RBAC — only users with `approve` permission can use approve/reject
- All endpoints record audit events and update revision history

**Files to create/modify:**
- `app/api/v1/operations.py` (MODIFY — add approval endpoints)
- `app/services/operations.py` (NEW — business logic for approval actions)

---

## Backend Work (Day 9)

### New Endpoints

```python
# app/api/v1/operations.py

@router.get("/review-queue")
def get_review_queue(
    db: DbDep,
    user: ReadDep,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    content_type: str | None = Query(None),
    owner_id: int | None = Query(None),
    ai_generated: bool | None = Query(None),
    sort_by: str = Query("age"),
):
    """
    Get all content items pending review.
    Returns items with status 'in_review' or 'changes_requested'.
    Includes owner info, age, validation status, media status.
    """

@router.post("/approve")
def approve_content(
    data: ApprovalAction,
    db: DbDep,
    reviewer: ApproveDep,  # requires 'approve' permission
    idempotency: IdempotencyDep = None,
):
    """
    Approve content for publication.
    - Validates current status is 'in_review' or 'changes_requested'
    - Records audit event
    - Creates revision snapshot
    - Updates content status to 'approved'
    """

@router.post("/request-changes")
def request_changes(
    data: ChangeRequestAction,
    db: DbDep,
    reviewer: ApproveDep,
    idempotency: IdempotencyDep = None,
):
    """
    Request changes on content.
    - Requires comment explaining what needs to change
    - Records audit event
    - Updates content status to 'changes_requested'
    """

@router.post("/reject")
def reject_content(
    data: RejectionAction,
    db: DbDep,
    reviewer: ApproveDep,
    idempotency: IdempotencyDep = None,
):
    """
    Reject content.
    - Requires comment explaining reason
    - Records audit event
    - Updates content status to 'archived'
    """

# Schema definitions
class ApprovalAction(BaseModel):
    content_type: str
    content_id: int
    comment: str | None = None
    reason: str | None = None

class ChangeRequestAction(BaseModel):
    content_type: str
    content_id: int
    comment: str  # Required
    reason: str | None = None

class RejectionAction(BaseModel):
    content_type: str
    content_id: int
    comment: str  # Required
    reason: str | None = None
```

### New Service

```python
# app/services/operations.py

def approve_content(db, content_type, content_id, actor_id, comment=None, reason=None):
    """
    1. Load content by type and ID
    2. Validate current status allows approval
    3. Apply status transition
    4. Record audit event
    5. Create revision snapshot
    6. Return updated content
    """

def request_changes(db, content_type, content_id, actor_id, comment, reason=None):
    """
    1. Load content by type and ID
    2. Validate current status allows change request
    3. Apply status transition
    4. Record audit event with comment
    5. Create revision snapshot
    6. Return updated content
    """

def reject_content(db, content_type, content_id, actor_id, comment, reason=None):
    """
    1. Load content by type and ID
    2. Validate current status allows rejection
    3. Apply status transition to 'archived'
    4. Record audit event with comment
    5. Create revision snapshot
    6. Return updated content
    """
```

---

## Frontend Work (Day 9)

### New Components Structure

```
admin/src/features/operations/
+-- pages/
¦   +-- ApprovalQueuePage.tsx            — Main review queue page
+-- components/
    +-- QueueItemCard.tsx                — Queue item card
    +-- QueueItemDetail.tsx              — Expandable detail view
    +-- QueueItemTimeline.tsx            — Item timeline
    +-- QueueFilterBar.tsx               — Queue-specific filters
    +-- ApprovalActionPanel.tsx          — Approve/reject/request changes
    +-- ApprovalConfirmDialog.tsx        — Confirmation dialog
    +-- ReviewerCommentInput.tsx         — Comment input component
```

### Router Changes

```typescript
// admin/src/router/index.tsx — Add these routes:
{
  path: 'operations/queue',
  element: <PermissionRoute permission="read_content"><ApprovalQueuePage /></PermissionRoute>
},
```

### Sidebar Changes

```typescript
// Add to Operations section:
{ to: '/operations/queue', icon: ClipboardCheck, label: 'Review Queue', permission: 'read_content', variants: queueVariants },
```

---

## Acceptance Criteria

- [ ] Review Queue page shows all items with status `in_review` or `changes_requested`
- [ ] Each item shows title, type, owner, age, validation status, media status, AI flag
- [ ] Items sorted by age (oldest first) by default
- [ ] Content type filter works
- [ ] Owner filter works
- [ ] AI-generated filter works
- [ ] "Approve" button moves item to approved status
- [ ] "Request Changes" button requires comment and moves to changes_requested
- [ ] "Reject" button requires comment and moves to archived
- [ ] Confirmation dialog shows before each action
- [ ] Success toast shows after action
- [ ] Item removed from queue after action
- [ ] Audit event recorded for each action
- [ ] Revision history updated for each action
- [ ] Role enforcement — only users with `approve` permission can approve/reject
- [ ] Expandable detail view shows content preview and history
- [ ] Backend endpoints enforce RBAC correctly
- [ ] All existing tests still pass

---

## Dependencies

- ? Backend content lifecycle model (already exists)
- ? Backend revision history (already exists)
- ? Backend audit events (already exists)
- ? Backend RBAC/permissions (already exists)
- ? `StatusBadge.tsx` (already exists)
- ? `ConfirmModal.tsx` (already exists)
- ? `RevisionHistory.tsx` (already exists — reuse for queue detail)

---

## Estimated Time: 7–9 hours
