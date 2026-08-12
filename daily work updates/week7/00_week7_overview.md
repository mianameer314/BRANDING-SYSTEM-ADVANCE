# Week 7 Progress Log — Editorial Workflow & Operations Console MVP

**August Phase · Week 2 · August 11–15, 2026**  
**Status:** Not Started — Planning Complete

---

## Week Overview

This is **Week 2** of the August phase and covers **Days 6–10** of the 10-day program.  
The theme is **"Simple Advanced Phase: Editorial Workflow & Operations Console"**.

### What This Week Is About (Simple Words)

> In Week 1, we built the **engine** — the backend that handles content states, revisions, permissions, webhooks, and audit trails.  
> This week (Week 2), we build the **steering wheel** — a beautiful admin dashboard where editors and reviewers can actually *use* all those backend features to create, review, approve, schedule, and publish content, all from one place.

Think of it like this:
- **Week 1** = Built a factory with all the machines
- **Week 2** = Built the control room where operators run those machines

---

## Program Progress

| Metric | Value |
|---|---|
| Days Complete | 5 of 10 |
| % Complete | 50% |
| Current Phase | Week 2 — Editorial Workflow & Operations Console |
| Milestone | M2 (Day 10): Working Editorial Workflow & CMS Operations Console MVP |

---

## Key Skills Covered This Week

- Admin workflow UI design and implementation
- Revision history visualization
- Content preview (website-style)
- Approval queue with reviewer actions
- Scheduling controls with timezone support
- Publish/webhook logs and retry controls
- Operator visibility and error recovery
- End-to-end editorial workflow testing

---

## Week 1 Recap (What We Already Have)

### Backend (All Complete ?)

| Feature | Status | Details |
|---|---|---|
| Content Lifecycle Model | ? | 8 states: draft ? in_review ? changes_requested ? approved ? scheduled ? published ? unpublished ? archived |
| Transition Validation | ? | Enforced valid state transitions for all 5 content types |
| Permission Boundaries | ? | Approve/publish restricted by role (RBAC) |
| Revision History | ? | Immutable snapshots with version tracking, diffs, restore |
| Audit Events | ? | Append-only audit trail for all actions |
| Idempotency | ? | PostgreSQL-backed deduplication for mutations |
| Webhook System | ? | CRUD + SHA-256 delivery dedup + logs |
| Stats API | ? | Aggregated counts by status for dashboard |
| Preview API | ? | Secure token-based iframe previews |

### Frontend (Week 1 Complete ?)

| Feature | Status | Details |
|---|---|---|
| Admin Dashboard | ? | Stat cards with status breakdowns per content type |
| Content CRUD Pages | ? | Blogs, News, Projects, Insights, Case Studies |
| Status Select | ? | Permission-aware lifecycle transitions |
| Revision History Panel | ? | Inline revision timeline in form pages |
| Live Preview Modal | ? | Website-style preview in forms |
| Webhooks Page | ? | Full CRUD + logs modal |
| Content Filter Bars | ? | Search and filter on content list pages |
| RBAC & Permissions | ? | Role-based access control throughout |

### Database Migrations (All Complete ?)

| Migration | Purpose |
|---|---|
| `70d0bff84f16` | Initial schema |
| `d11e25f94e27` | RBAC and interaction features |
| `dca1820baa27` | Webhooks system |
| `a3a214d9ba6c` | Editorial lifecycle fields |
| `f4c7d2a9e821` | Revision history and audit events |
| `c7d91b4e2a68` | Revision source and approval reference |
| `99093b58c5cd` | Idempotency and webhook dedup |
| `ca9322adfa0e` | Recreate webhooks |

---

## Week 7 Daily Breakdown

| Day | Date | Focus | Status |
|---|---|---|---|
| Mon (Day 7) | Aug 11 | Operations Console Shell & Workflow Views | Not Started |
| Tue (Day 8) | Aug 12 | Revision History & Side-by-Side Preview | Not Started |
| Wed (Day 9) | Aug 13 | Approval Queue & Reviewer Actions | Not Started |
| Thu (Day 10) | Aug 14 | Scheduling, Publish Logs & Recovery Controls | Not Started |
| Fri (Day 11) | Aug 15 | MILESTONE 2 — Small Operations Console MVP | Not Started |

---

## Day-by-Day Plan Links

- [Day 1 — Operations Console Shell](./01_day1_operations_console_shell.md)
- [Day 2 — Revision History & Preview](./02_day2_revision_preview.md)
- [Day 3 — Approval Queue](./03_day3_approval_queue.md)
- [Day 4 — Scheduling & Publish Logs](./04_day4_scheduling_publish_logs.md)
- [Day 5 — Milestone 2 MVP](./05_day5_milestone2_mvp.md)

---

## Architecture Notes

### Existing Backend Endpoints (Available for Week 7)

```
GET  /stats/dashboard              — Aggregated status counts
GET  /blogs?status=X&search=Y      — Filtered content lists (same pattern for /news, /projects, /insights, /case-studies)
GET  /audit/content/{type}/{id}/revisions  — Revision history
POST /audit/content/{type}/{id}/revisions/{v}/restore  — Restore revision
GET  /webhooks                     — Webhook management
GET  /webhooks/{id}/logs           — Delivery logs
POST /webhooks/{id}/test           — Test webhook
```

### Existing Frontend Components (Reusable)

```
src/components/layout/Sidebar.tsx        — Navigation (add Operations section)
src/components/form/StatusSelect.tsx     — Lifecycle transitions
src/components/form/RevisionHistory.tsx  — Inline revision timeline
src/components/preview/LivePreviewModal.tsx  — Content preview
src/components/shared/DataTable.tsx      — Reusable data table
src/components/shared/StatusBadge.tsx    — Status pill badges
src/components/table/ContentFilterBar.tsx — Search and filters
src/features/dashboard/DashboardPage.tsx — Current dashboard (transform into ops console)
```

### New Components Needed

```
src/features/operations/                 — New feature module
  +-- pages/
  ¦   +-- OperationsConsolePage.tsx      — Main console shell (Day 1)
  ¦   +-- WorkflowOverviewPage.tsx       — Workflow stage overview (Day 1)
  ¦   +-- RevisionComparePage.tsx        — Side-by-side revision diff (Day 2)
  ¦   +-- ContentPreviewPage.tsx         — Full-page website preview (Day 2)
  ¦   +-- ApprovalQueuePage.tsx          — Review queue with actions (Day 3)
  ¦   +-- SchedulePublishPage.tsx        — Scheduling controls (Day 4)
  ¦   +-- PublishLogsPage.tsx            — Webhook/publish history (Day 4)
  +-- components/
  ¦   +-- WorkflowStageCard.tsx          — Stage summary card
  ¦   +-- RevisionDiffViewer.tsx         — Side-by-side diff component
  ¦   +-- ApprovalActionPanel.tsx        — Approve/reject/comment UI
  ¦   +-- ScheduleDateTimePicker.tsx     — Timezone-aware scheduler
  ¦   +-- PublishLogTable.tsx            — Delivery log table with retry
  ¦   +-- OperatorToolbar.tsx            — Quick-action toolbar
  +-- hooks.ts                           — React Query hooks
  +-- api.ts                             — API client functions
  +-- types.ts                           — TypeScript interfaces
```

### Backend Additions Needed

```
app/api/v1/operations.py                — New operations endpoints (if needed)
  — GET /operations/workflow-overview    — Aggregated workflow metrics
  — GET /operations/review-queue         — Items pending review
  — POST /operations/approve             — Approve with comments
  — POST /operations/reject              — Reject with comments
  — POST /operations/request-changes     — Request changes with comments
  — POST /operations/schedule            — Schedule publish with datetime
  — POST /operations/cancel-schedule     — Cancel scheduled publish
  — GET /operations/publish-logs         — Publish/webhook delivery history
  — POST /operations/retry-publish       — Retry failed publish
  — POST /operations/resolve-failure     — Mark failure as resolved
```

---

## Risk Register

| Risk | Impact | Mitigation |
|---|---|---|
| Backend scheduling needs background job runner | High | Use APScheduler or similar; test with in-process scheduler |
| Side-by-side diff complexity | Medium | Start with field-level diffs, not character-level |
| Timezone handling in scheduling | Medium | Use UTC internally, display in user's timezone |
| Webhook retry safety | Medium | Implement exponential backoff, max retry count |
| MVP demo pressure on Friday | High | Focus on core flow Mon–Thu, polish on Friday |

---

## Success Criteria for M2

1. ? Editor can create/edit content ? see it in review queue
2. ? Reviewer can see revision history with side-by-side comparison
3. ? Reviewer can approve, request changes, or reject with comments
4. ? Operator can schedule content for future publishing
5. ? Operator can see publish/webhook delivery logs
6. ? Operator can retry failed webhooks or mark them resolved
7. ? Full workflow: draft ? edit ? preview ? review ? approve ? schedule ? publish ? inspect logs
8. ? Mentor usability review passes
9. ? Short demo recorded
10. ? MVP tagged as release
