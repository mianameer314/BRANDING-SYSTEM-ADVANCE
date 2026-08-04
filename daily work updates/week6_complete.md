# Week 6 Progress Log — Controlled Editorial Backend

**August Phase · Week 1 · August 3–7, 2026**  
**Status:** In progress - Day 1 complete; P0 test blocker resolved

This log tracks the five-day implementation of the controlled editorial backend. It will be updated at the end of each completed day with evidence, decisions, defects, and deliverables.

---

## Day 1 — Platform Audit & Month 2 Baseline

**Date:** August 3, 2026  
**Status:** Complete

### Summary

The current O2Geeks CMS baseline was verified using completed July UAT and current deployment checks. Railway backend health is good, PostgreSQL is connected, and S3 media storage is active. The Vercel admin dashboard authenticated successfully as Super Admin. Published content is visible publicly while the existing draft Project remains hidden.

### Deployment evidence

| Service | Result | Response time |
|---|---:|---:|
| Railway API health | Healthy | — |
| Railway API documentation | HTTP 200 | 14,907 ms |
| Vercel admin dashboard | HTTP 200 | 6,027 ms |
| Vercel public website | HTTP 200 | 2,943 ms |

### Findings carried into Month 2

1. The automated test suite initially could not start because the SQLite test database could not render the PostgreSQL `ARRAY` used by `webhooks.content_types`.
2. The P0 test blocker was resolved by keeping PostgreSQL `ARRAY(String)` for production and using SQLite `JSON` for tests; preview-test dependency override isolation was also fixed.
3. Backend documentation and the admin dashboard showed elevated initial response times.
4. The current editorial lifecycle supports only `draft` and `published`; the controlled lifecycle, revision history, audit trail, and idempotency work begins on Day 2.

### P0 follow-up completed

| Item | Result |
|---|---|
| Webhook model SQLite compatibility | Fixed |
| Preview unauthorized test override isolation | Fixed |
| Full regression suite | `43 passed, 24 warnings in 13.56s` |
| Remaining test notes | Warnings are deprecations/test-client notices; not blockers for Day 2 |

### Day 1 deliverables

- [Baseline report](../docs/baseline/day1_baseline_report.md)
- [Architecture diagram](../docs/baseline/day1_architecture_diagram.md)
- [Verified setup guide](../docs/baseline/day1_verified_setup_guide.md)
- [Prioritized Month 2 backlog](../docs/baseline/day1_prioritized_backlog.md)
- [Operational closeout](../docs/baseline/day1_operational_closeout.md)

---

## Day 2 — Editorial Lifecycle & Content State Model

**Date:** August 4, 2026  
**Status:** Complete

The controlled lifecycle now covers all five content types and persists the evidence for each status change. The workflow records who changed a status, when it changed, and why.

### Completed

| Item | Result |
|---|---|
| Shared lifecycle enum | Added `draft`, `in_review`, `changes_requested`, `approved`, `scheduled`, `published`, `unpublished`, `archived` |
| Transition matrix | Added reusable validation in `app/services/content_lifecycle.py` |
| Permission boundary | Added `approve` permission; restricted approve/schedule/publish/unpublish/archive states |
| Service integration | Blog, News, Project, Insight, and Case Study updates now validate status transitions |
| Lifecycle evidence | Added `status_changed_at`, `status_changed_by_id`, and `status_change_reason` to all five content tables |
| Tests | `50 passed, 24 warnings in 10.14s` |

### Day 2 deliverable link

- [Lifecycle model complete](../docs/baseline/day2_lifecycle_model.md)

### Follow-up: lifecycle response evidence

The existing update flow remains unchanged. The status audit fields (`status_changed_at`, `status_changed_by_id`, `status_change_reason`) are now returned in content responses and are updated only when the status actually changes.

The local admin dashboard now supports the full Day 2 lifecycle across all five content types, including valid status choices, permission-aware transition controls, status reasons, lifecycle audit display, and status-badge colours.

### CI/CD Pipeline Automation & Cross-Environment Hardening

Successfully implemented and hardened GitHub Actions pipelines for both the frontend and backend to guarantee production-readiness.

- **Frontend CI/CD Resilience:** 
  - Fixed a critical Windows-vs-Linux case sensitivity bug in Git (tracking `Lib` vs `lib`) by forcefully renaming the core directory to `utils` and updating 20 component imports.
  - Fixed Vite 5 TypeScript resolution by adding `baseUrl` and `paths` mappings natively into `tsconfig.app.json`.
- **Backend CI/CD Resilience:** 
  - Bypassed `.env` file parsing entirely by injecting a robust `env:` block natively into the CI runner, preventing Pydantic initialization crashes.
  - **Resolved Day 1 P0 Bug:** Configured a native `postgres:15` service container inside GitHub Actions so Pytest runs against real PostgreSQL instead of SQLite, allowing `ARRAY` column types to compile perfectly.
  - Added missing test-only dependencies (`fakeredis`) to the CI runner pipeline.

---

## Day 3 — Revision History, Transactions & Audit Trail

**Status:** Implementation complete; production migration and final full-suite verification pending.

Added shared immutable `content_revisions` and append-only `audit_events` tables, transactional revision capture for all five content types, safe restore endpoints, operational audit events for media/user-role/webhook actions, revision-history dashboard panels, migration, and rollback tests. Existing content receives a baseline snapshot before its first Day 3 edit, preserving the pre-edit version. Later hardening added automatic snapshot diffs, revision-linked resource snapshots, S3 historical-media protection, synchronized resource restore, stable slugs, restore confirmation, actor-name display, source tracking (`cms_api` / `revision_restore`), an immutable approval reference for each approved version, and immediate dashboard refresh after restore. See [Day 3 model](../docs/baseline/day3_revision_audit_model.md), [revision/audit flow diagram](../docs/baseline/day3_revision_audit_diagram.svg), and [lifecycle transition diagram](../docs/baseline/day2_lifecycle_transition_diagram.svg).

---

## Day 4 — API Contracts, Idempotency & Permission Hardening

**Status:** Not started

To be updated after contract, role, idempotency, duplicate-protection, and security testing work is complete.

---

## Day 5 — Milestone 1: Controlled Editorial Backend

**Status:** Not started

To be updated after all five content types complete the tested lifecycle and Milestone 1 evidence is collected.
