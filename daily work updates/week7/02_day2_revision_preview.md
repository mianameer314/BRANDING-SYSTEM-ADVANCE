# Day 8 — Revision History & Side-by-Side Preview

**Date:** August 12, 2026  
**Status:** Completed

---

## Goal

Help reviewers understand changes before approving content by building a **revision timeline** with **side-by-side comparison** and a **website-style content preview**.

---

## Simple Explanation

> When someone edits a blog post or a case study, you want to know *what changed*. Was the title modified? Was a paragraph deleted? Was the SEO description updated?  
> Today, we build a proper revision comparison tool — like Google Docs' "Suggesting Mode" — where a reviewer can see the old version next to the new version and understand exactly what changed.  
> We also build a full-page preview that looks exactly like the public website, so reviewers can see how the content will look to visitors before it goes live.

---

## Tasks

### 1. Build Revision Timeline Page

**What:** A dedicated page showing the complete revision history for any content item.

**Details:**
- Create a new page that shows a **vertical timeline** of all revisions
- Each revision shows:
  - Version number
  - Timestamp
  - Who made the change (actor name)
  - What changed (list of fields)
  - Action type (created, updated, status_changed, restored)
  - Source (cms_api, revision_restore)
  - Approval reference (if approved)
  - Status reason (if provided)
- Allow clicking any revision to see its **full snapshot**
- Add a **"Compare" button** to compare any two revisions
- Add a **"Restore" button** to restore a previous version (with confirmation)

**Files to create/modify:**
- `admin/src/features/operations/pages/RevisionHistoryPage.tsx` (NEW)
- `admin/src/features/operations/components/RevisionTimeline.tsx` (NEW)
- `admin/src/features/operations/components/RevisionSnapshotView.tsx` (NEW)
- `admin/src/features/operations/components/RevisionCompareButton.tsx` (NEW)

### 2. Build Side-by-Side Diff View

**What:** Compare two revisions side-by-side with field-level highlighting.

**Details:**
- Show two revisions side-by-side in a split view
- For each field, show:
  - **Unchanged** — same in both versions (grayed out)
  - **Modified** — different (highlighted with old value on left, new value on right)
  - **Added** — new field (green highlight on right)
  - **Removed** — deleted field (red highlight on left)
- Fields to compare:
  - title, slug, excerpt, body (rich text)
  - seo_title, seo_description, seo_keywords
  - cover_image, gallery
  - category, tags
  - status, published_at
  - client_logo, metrics (for case studies)
  - tech_stack, project_url (for projects)
- Use a **unified diff** option for text fields (title, excerpt, SEO fields)
- Use a **visual diff** for rich text (body) — show added/removed paragraphs

**Files to create/modify:**
- `admin/src/features/operations/components/RevisionDiffViewer.tsx` (NEW)
- `admin/src/features/operations/components/DiffFieldRow.tsx` (NEW)
- `admin/src/features/operations/components/TextDiffView.tsx` (NEW)
- `admin/src/features/operations/components/RichTextDiffView.tsx` (NEW)

### 3. Build Full-Page Content Preview

**What:** A website-style preview that shows exactly how the content will look on the public site.

**Details:**
- Create a full-page preview that renders content using the public website's layout
- Show:
  - **Header and navigation** (simplified)
  - **Content hero section** with cover image, title, excerpt
  - **Full body content** rendered as HTML
  - **SEO metadata panel** (title, description, keywords)
  - **Media gallery** if present
  - **Publication info** (author, publish date, category, tags)
- Allow previewing **draft data** (not just published content)
- Show **validation warnings** if any required fields are missing
- Show **author, source, last editor** information
- Add a **"Preview as"** dropdown to preview as different roles (editor, reviewer, public)

**Files to create/modify:**
- `admin/src/features/operations/pages/ContentPreviewPage.tsx` (NEW)
- `admin/src/features/operations/components/PreviewFrame.tsx` (NEW)
- `admin/src/features/operations/components/PreviewMetadataPanel.tsx` (NEW)
- `admin/src/features/operations/components/ValidationWarnings.tsx` (NEW)

### 4. Integrate with All Five Content Types

**What:** Make the revision and preview pages work for Blogs, News, Projects, Insights, and Case Studies.

**Details:**
- The revision history page should accept a `contentType` and `contentId` parameter
- The preview page should render different layouts based on content type:
  - **Blog** — Article layout with hero, body, sidebar
  - **News** — Press release layout
  - **Project** — Portfolio layout with client logo, tech stack, metrics
  - **Insight** — Analysis layout with charts placeholder
  - **Case Study** — Success story layout with business metrics
- Reuse the existing preview API (`/preview/{token}`) for the preview functionality
- Reuse the existing revision API (`/audit/content/{type}/{id}/revisions`) for revision data

**Files to create/modify:**
- `admin/src/features/operations/components/preview/BlogPreview.tsx` (NEW)
- `admin/src/features/operations/components/preview/NewsPreview.tsx` (NEW)
- `admin/src/features/operations/components/preview/ProjectPreview.tsx` (NEW)
- `admin/src/features/operations/components/preview/InsightPreview.tsx` (NEW)
- `admin/src/features/operations/components/preview/CaseStudyPreview.tsx` (NEW)

---

## Backend Work (Day 8)

### No New Backend Endpoints Required

The existing endpoints already support everything needed:

```python
# Already exists — revision history
GET /audit/content/{type}/{id}/revisions
POST /audit/content/{type}/{id}/revisions/{version}/restore

# Already exists — preview
GET /preview/{token}
```

### Optional Enhancement

If the revision list endpoint doesn't include full snapshots, add a query parameter:

```python
# Enhanced revision endpoint
GET /audit/content/{type}/{id}/revisions?include_snapshot=true
```

---

## Frontend Work (Day 8)

### New Components Structure

```
admin/src/features/operations/
+-- pages/
¦   +-- RevisionHistoryPage.tsx          — Main revision history page
¦   +-- ContentPreviewPage.tsx           — Full-page content preview
+-- components/
    +-- RevisionTimeline.tsx             — Vertical timeline of revisions
    +-- RevisionSnapshotView.tsx         — Full snapshot viewer
    +-- RevisionDiffViewer.tsx           — Side-by-side diff
    +-- DiffFieldRow.tsx                 — Individual field diff
    +-- TextDiffView.tsx                 — Text field diff
    +-- RichTextDiffView.tsx             — Rich text diff
    +-- PreviewFrame.tsx                 — Preview container
    +-- PreviewMetadataPanel.tsx         — SEO and metadata panel
    +-- ValidationWarnings.tsx           — Validation warning display
    +-- preview/
        +-- BlogPreview.tsx              — Blog-specific preview
        +-- NewsPreview.tsx              — News-specific preview
        +-- ProjectPreview.tsx           — Project-specific preview
        +-- InsightPreview.tsx           — Insight-specific preview
        +-- CaseStudyPreview.tsx         — Case study-specific preview
```

### Router Changes

```typescript
// admin/src/router/index.tsx — Add these routes:
{
  path: 'operations/revisions/:contentType/:contentId',
  element: <PermissionRoute permission="read_content"><RevisionHistoryPage /></PermissionRoute>
},
{
  path: 'operations/preview/:contentType/:contentId',
  element: <PermissionRoute permission="read_content"><ContentPreviewPage /></PermissionRoute>
},
```

### API Endpoints (Frontend)

```typescript
// admin/src/features/operations/api.ts
export const operationsApi = {
  // Revision history
  getRevisions: (contentType: string, contentId: number) =>
    axiosInstance.get(`/audit/content/${contentType}/${contentId}/revisions`),
  
  restoreRevision: (contentType: string, contentId: number, version: number) =>
    axiosInstance.post(`/audit/content/${contentType}/${contentId}/revisions/${version}/restore`),
  
  // Preview
  getPreviewToken: (contentType: string, contentId: number) =>
    axiosInstance.get(`/preview/token/${contentType}/${contentId}`),
  
  getPreview: (token: string) =>
    axiosInstance.get(`/preview/${token}`),
};
```

---

## Acceptance Criteria

- [ ] Revision History page shows complete timeline for any content item
- [ ] Each revision shows version, timestamp, actor, changes, and source
- [ ] Clicking a revision shows its full snapshot
- [ ] "Compare" button opens side-by-side diff view
- [ ] Diff view highlights added, removed, and modified fields
- [ ] Text diffs show unified or split view
- [ ] Rich text diffs show paragraph-level changes
- [ ] Full-page preview renders content like the public website
- [ ] Preview shows draft data (not just published)
- [ ] Validation warnings display for incomplete content
- [ ] Preview shows author, source, and last editor info
- [ ] All five content types render correctly in preview
- [ ] "Restore" button works with confirmation dialog
- [ ] Existing revision history component in forms still works

---

## Dependencies

- ? Backend revision history API (already exists)
- ? Backend preview API (already exists)
- ? `RevisionHistory.tsx` component (already exists — reuse patterns)
- ? `LivePreviewModal.tsx` (already exists — extend to full page)
- ? `StatusBadge.tsx` (already exists)

---

## Estimated Time: 7–9 hours
