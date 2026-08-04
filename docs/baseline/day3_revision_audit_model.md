# Day 3 — Revision History, Transactions & Audit Trail

**Date:** August 5, 2026  
**Status:** Implementation complete; production migration and final regression verification pending.

## What Day 3 Adds

Day 3 gives the CMS a reliable memory. Before this work, an edit replaced the old database value. Now the system stores a numbered, immutable snapshot whenever content is created, edited, status-changed, restored, or deleted.

This applies to all five editorial types: Blog, News, Project, Insight, and Case Study.

![Day 3 revision history and audit flow](day3_revision_audit_diagram.svg)

The diagram is a standalone SVG rather than Mermaid, so it renders reliably in VS Code, GitHub, and Markdown preview tools.

## Data Stored

### `content_revisions`

Each revision stores:

- content type and content ID
- a sequential version number, unique for that content item
- action: `created`, `baseline`, `updated`, `status_changed`, `restored`, or `deleted`
- the complete content snapshot at that moment
- automatically calculated changed-field names
- actor ID, timestamp, request source (`cms_api` or `revision_restore`), status reason, and (for restores) the source revision ID
- an immutable approval reference for an approved version, such as `approval:blog:42:v5:actor:7`
- attached resource URLs and filenames in `_resources`

Older content is protected too. On its first Day 3 mutation, the system creates a `baseline` snapshot before making the requested change. This preserves the pre-Day-3 state.

| Field | Meaning | Example |
|---|---|---|
| `source` | The application path that created the record. Normal CMS writes use `cms_api`; a recovery uses `revision_restore`. | `cms_api` |
| `approval_reference` | Present only when the saved version is **Approved**. It identifies the content, exact version, and acting user. | `approval:blog:42:v5:actor:7` |

The actor ID identifies **who** made the decision; the approval reference identifies **which exact version** was approved.

### `audit_events`

This is the operational evidence stream. It records content events as well as media upload/replacement/deletion, user creation/update/deactivation/role change, webhook configuration changes, and webhook delivery outcomes.

Audit records are append-only. Normal API actions create new records; they do not change earlier evidence.

## Transaction Guarantee

For a normal content save, PostgreSQL handles three writes as one unit:

1. Save the current content row.
2. Save the immutable revision snapshot.
3. Save the audit event.

If any step fails, the database transaction rolls back. This prevents a dangerous half-finished state such as a changed Blog without a matching history record.

## Accurate Diffing and Media Safety

The service compares the new snapshot with the previous revision and calculates changed fields automatically. This avoids relying only on what the browser submitted.

Revision snapshots include attached downloadable resources and image/file URLs. Before an update removes an old cover image, gallery image, client logo, or attached resource, the API checks whether that file is referenced by revision history. If it is, the old file is retained so restoring the older revision does not produce broken media.

## Restore Behaviour

Restore is a controlled copy operation, not history deletion.

Example:

```text
Version 1 — original Blog title and attached PDF
Version 2 — title and PDF changed
Version 3 — administrator restores Version 1
```

After restore, the current Blog and its saved resource records match Version 1. Versions 1 and 2 remain available, and Version 3 records who restored the content and why. The content keeps its current ID and slug so existing links remain stable.

## Permissions

- Users with `view_drafts` may view editorial revision history.
- Only users with `publish` permission may restore a revision.
- `GET /api/v1/audit/events` is restricted to super-admin operational auditing.

## API

- `GET /api/v1/audit/content/{content_type}/{content_id}/revisions`
- `POST /api/v1/audit/content/{content_type}/{content_id}/revisions/{version}/restore`
- `GET /api/v1/audit/events`

## Dashboard Experience

Every content edit page now has a **Revision history** panel. It shows version number, action, time, the actor's resolved name when available, changed fields, and reason. Restore uses a confirmation dialog so an accidental click cannot replace current content. After a successful restore, the current form data and revision list refresh immediately.

## How to Verify

1. Local migration:

   ```powershell
   .\venv\Scripts\python.exe -m alembic upgrade head
   ```

2. Focused tests:

   ```powershell
   .\venv\Scripts\python.exe -m pytest tests\test_revision_history.py -q
   ```

3. Full regression suite:

   ```powershell
   .\venv\Scripts\python.exe -m pytest tests -q
   ```

4. Start the backend and run the local dashboard with `npm run dev` from `E:\Branding_System\admin`.
5. Edit a Blog title, save, and reopen it. Confirm a revision appears.
6. Edit it again, save, and confirm the version number increases.
7. Restore the earlier version. Confirm content and attached resources return to the earlier values.
8. When an item is moved to **Approved**, confirm the newest history entry includes both the actor and an approval reference. This proves which exact version was approved.
8. Refresh the page. Confirm a new `restored` revision appears while all earlier revisions remain.
9. In Swagger, call `GET /api/v1/audit/content/blog/{id}/revisions`. As super admin, call `GET /api/v1/audit/events`.

## Production Requirement

Migration `f4c7d2a9e821` creates the Day 3 tables. Railway PostgreSQL must run `python -m alembic upgrade head` before deployed Day 3 code handles writes. The project `Procfile` and `Dockerfile` now run the migration before Uvicorn starts, preventing this mismatch on future deployments after the latest commit is deployed.

## Main Files

- `app/models/content_revision.py`
- `app/models/audit_event.py`
- `app/services/revision_history.py`
- `app/api/v1/audit.py`
- `alembic/versions/f4c7d2a9e821_add_revision_history_and_audit_events.py`
- `admin/src/components/form/RevisionHistory.tsx`
- `tests/test_revision_history.py`
