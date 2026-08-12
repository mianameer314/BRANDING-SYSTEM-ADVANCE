# Day 7 — Operations Console Shell & Workflow Views

**Date:** August 11, 2026  
**Status:** Not Started

---

## Goal

Turn the existing admin dashboard into a **clear editorial operations workspace** where operators can see everything at a glance — drafts, items waiting for review, approved content, scheduled posts, published content, and any failed integrations.

---

## Simple Explanation

> Right now, the admin dashboard shows 5 cards (Blogs, News, Projects, Insights, Case Studies) with their status counts. That's good for a quick count, but it's not a real "operations console."  
> Today, we transform it into a proper workspace where an editor or operator can:
> - See a **workflow overview** showing how many items are in each stage (draft, review, approved, scheduled, etc.)
> - **Click into any stage** to see a filtered list of items
> - **Search and filter** by content type, owner, and status
> - Navigate between workflow views quickly

---

## Tasks

### 1. Redesign the Dashboard as Operations Console

**What:** Transform `DashboardPage.tsx` from simple stat cards into a workflow-oriented console.

**Details:**
- Add a new **"Operations"** section to the sidebar navigation
- Create a new `OperationsConsolePage.tsx` as the main entry point
- Keep the existing dashboard as a legacy view (don't delete it)
- The console should show:
  - **Workflow stages** as cards: Drafts, In Review, Approved, Scheduled, Published, Failed
  - Each card shows the count and a "View All" link
  - A **quick summary bar** at the top with total content counts
  - A **recent activity feed** showing latest status changes

**Files to create/modify:**
- `admin/src/features/operations/pages/OperationsConsolePage.tsx` (NEW)
- `admin/src/features/operations/components/WorkflowStageCard.tsx` (NEW)
- `admin/src/features/operations/components/OperatorToolbar.tsx` (NEW)
- `admin/src/features/operations/hooks.ts` (NEW)
- `admin/src/features/operations/api.ts` (NEW)
- `admin/src/features/operations/types.ts` (NEW)
- `admin/src/components/layout/Sidebar.tsx` (MODIFY — add Operations section)
- `admin/src/router/index.tsx` (MODIFY — add operations routes)

### 2. Build Workflow Overview Page

**What:** A dedicated page showing content flowing through the editorial pipeline.

**Details:**
- Show a **kanban-like view** or **pipeline view** with columns for each lifecycle stage
- Each column shows items in that stage with:
  - Content title
  - Content type badge (Blog, News, etc.)
  - Owner name
  - Age (how long it's been in this stage)
  - Last updated timestamp
- Allow **drag-and-drop** or **click-to-move** between stages (if time permits; otherwise, use action buttons)
- Show **aggregated counts** at the top of each column

**Files to create/modify:**
- `admin/src/features/operations/pages/WorkflowOverviewPage.tsx` (NEW)
- `admin/src/features/operations/components/WorkflowColumn.tsx` (NEW)
- `admin/src/features/operations/components/WorkflowItem.tsx` (NEW)

### 3. Connect to Backend — Filtered List Views

**What:** Wire up the operations console to the existing backend APIs for real data.

**Details:**
- Use the existing `/stats/dashboard` endpoint for overview counts
- Use the existing content list endpoints (`/blogs`, `/news`, etc.) with status filters
- Add new backend endpoint if needed:
  - `GET /operations/workflow-overview` — Returns aggregated workflow metrics across all content types
  - `GET /operations/review-queue` — Returns items pending review
- Implement React Query hooks for the new endpoints
- Add loading states, error states, and empty states

**Files to create/modify:**
- `admin/src/features/operations/api.ts` (NEW — API client functions)
- `admin/src/features/operations/hooks.ts` (NEW — React Query hooks)
- `app/api/v1/operations.py` (NEW — backend operations endpoints)
- `app/main.py` (MODIFY — register operations router)

### 4. Add Search, Content-Type Filters, Owner Filters, Status Filters

**What:** Build a comprehensive filter bar for the operations console.

**Details:**
- **Search bar** — Full-text search across titles
- **Content type filter** — Dropdown to filter by Blogs, News, Projects, Insights, Case Studies
- **Owner filter** — Dropdown to filter by content owner/editor
- **Status filter** — Multi-select to filter by lifecycle stage
- **Date range filter** — Filter by creation or update date
- **Sort options** — Sort by date, title, status, owner
- Reuse the existing `ContentFilterBar.tsx` and `SearchInput.tsx` components as a base

**Files to create/modify:**
- `admin/src/features/operations/components/OperationsFilterBar.tsx` (NEW)
- `admin/src/hooks/useUrlFilters.ts` (MODIFY — add operations-specific filters)

---

## Backend Work (Day 7)

### New Endpoints

```python
# app/api/v1/operations.py

@router.get("/workflow-overview")
def get_workflow_overview(db: DbDep, user: ReadDep):
    """
    Aggregated workflow metrics across all content types.
    Returns counts per lifecycle stage per content type.
    """
    # Query each content type and group by status
    # Return structured response:
    # {
    #   "stages": {
    #     "draft": {"total": 12, "by_type": {"blog": 5, "news": 3, ...}},
    #     "in_review": {"total": 8, "by_type": {...}},
    #     ...
    #   },
    #   "total_content": 45,
    #   "recent_activity": [...]
    # }

@router.get("/review-queue")
def get_review_queue(
    db: DbDep,
    user: ReadDep,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    content_type: str | None = Query(None),
):
    """
    Items pending review (status = in_review or changes_requested).
    Returns paginated list with owner info, age, and metadata.
    """
```

### Files to Modify

- `app/main.py` — Register the new operations router
- `app/api/v1/__init__.py` — Import operations module

---

## Frontend Work (Day 7)

### New Feature Module Structure

```
admin/src/features/operations/
+-- api.ts                    — API client functions
+-- hooks.ts                  — React Query hooks
+-- types.ts                  — TypeScript interfaces
+-- pages/
¦   +-- OperationsConsolePage.tsx    — Main console shell
¦   +-- WorkflowOverviewPage.tsx     — Pipeline/kanban view
+-- components/
    +-- WorkflowStageCard.tsx        — Stage summary card
    +-- WorkflowColumn.tsx           — Pipeline column
    +-- WorkflowItem.tsx             — Individual workflow item
    +-- OperationsFilterBar.tsx      — Search and filters
    +-- OperatorToolbar.tsx          — Quick-action toolbar
```

### Router Changes

```typescript
// admin/src/router/index.tsx — Add these routes:
{
  path: 'operations',
  element: <PermissionRoute permission="read_content"><OperationsConsolePage /></PermissionRoute>
},
{
  path: 'operations/workflow',
  element: <PermissionRoute permission="read_content"><WorkflowOverviewPage /></PermissionRoute>
},
```

### Sidebar Changes

```typescript
// admin/src/components/layout/Sidebar.tsx — Add new section:
{
  label: 'Operations',
  items: [
    { to: '/operations', icon: Workflow, label: 'Console', permission: 'read_content', variants: workflowVariants },
    { to: '/operations/workflow', icon: GitBranch, label: 'Workflow', permission: 'read_content', variants: workflowVariants },
  ],
},
```

---

## Acceptance Criteria

- [ ] Operations Console page loads and shows workflow stage cards
- [ ] Each stage card shows correct count from backend
- [ ] Clicking a stage card navigates to filtered content list
- [ ] Workflow Overview page shows items organized by lifecycle stage
- [ ] Search bar filters content across all types
- [ ] Content-type filter works correctly
- [ ] Owner filter works correctly
- [ ] Status filter works correctly
- [ ] Loading states show skeleton/spinner
- [ ] Error states show retry option
- [ ] Empty states show helpful message
- [ ] Sidebar shows new Operations section
- [ ] Backend endpoints return correct data
- [ ] All existing tests still pass

---

## Dependencies

- ? Backend `/stats/dashboard` endpoint (already exists)
- ? Backend content list endpoints with filters (already exist)
- ? `ContentFilterBar.tsx` and `SearchInput.tsx` (already exist)
- ? `DataTable.tsx` (already exists)
- ? `StatusBadge.tsx` (already exists)

---

## Estimated Time: 6–8 hours
