# Day 1 Baseline Report — August Phase

**Date:** 2026-08-03  
**Phase:** Controlled Editorial Backend — Week 1, Day 1  
**Purpose:** Establish a verified operating baseline before changing the CMS architecture.

## Executive Summary

The deployed O2Geeks Headless CMS is operational. The Railway backend is healthy, connected to PostgreSQL, and configured for S3 media storage. The React admin dashboard and Nuxt public website are reachable. Existing July UAT was confirmed by the project owner for the CMS flows listed in this report.

Two risks were identified during the baseline audit:

1. The automated test suite initially could not start because its SQLite test database could not compile the PostgreSQL `ARRAY` used by `webhooks.content_types`. This P0 blocker was resolved on 2026-08-03.
2. The backend documentation endpoint and admin dashboard showed elevated first-response times during this audit.

## Verified Deployment Health

| Check | Result | Evidence |
|---|---|---|
| Railway health endpoint | Pass | `status: healthy`, `database: Connected`, `storage: s3` |
| Railway API documentation | Pass | HTTP 200, 14,907 ms |
| Vercel admin dashboard | Pass | HTTP 200, 6,027 ms; Super Admin sign-in confirmed |
| Vercel public website | Pass | HTTP 200, 2,943 ms |

## Functional Baseline

The project owner confirmed the following July UAT coverage as complete:

- CRUD flows for Blogs, News, Projects, Insights, and Case Studies
- Authentication and role-based access control
- Media upload and storage
- AI content generation
- Secure and live preview behavior
- Publish webhooks
- Rate limiting
- Railway/Vercel deployment and public rendering

Current content visibility was also checked during this audit:

| Content type | Admin state | Public result |
|---|---:|---|
| Blog | 1 published | Visible |
| News | 1 published | Visible |
| Project | 1 draft | Hidden |
| Insight | 1 published | Visible |
| Case Study | 1 published | Visible |

## Current Defects and Risks

### P0 — Automated test suite initialization blocker

**Observed command:** `python -m pytest tests -q`  
**Original result:** Failed before running tests.  
**Cause:** The SQLite test database cannot render the PostgreSQL `ARRAY` type in `webhooks.content_types`.

**Resolution:** `webhooks.content_types` now uses SQLAlchemy `ARRAY(String)` for PostgreSQL with a SQLite `JSON` variant for the test database. The preview unauthorized test also restores dependency overrides after removing only the auth override.

**Verified result:** `python -m pytest tests -q --disable-warnings` passes with `43 passed, 24 warnings`.

### P1 — Elevated response times

| Endpoint/application | Observed response time |
|---|---:|
| Railway `/docs` | 14,907 ms |
| Vercel admin dashboard | 6,027 ms |
| Vercel public website | 2,943 ms |

**Recommended remediation:** Capture p50/p95 timings, inspect Railway cold starts and logs, check backend/database query timings, and inspect Vercel bundle/network behavior.

## Scope Notes for Week 1

- The current content lifecycle is limited to `draft` and `published`.
- AI functionality currently generates structured content; a separate persisted AI-draft-ingestion endpoint is not present.
- The application sends outbound publish webhooks; an inbound webhook-triggered content-change endpoint is not present.
- The project directory is not a usable Git checkout, so the Day 5 `backend-alpha` tag must be created in the actual source-controlled repository.

## Day 1 Outcome

**Status: Complete.** The platform baseline, deployment health, public visibility behavior, resolved test blocker, and remaining performance risks are documented. Day 1 closeout scripts and a plain-language summary are available in [day1_complete.md](../../day1_complete.md) and [day1_operational_closeout.md](day1_operational_closeout.md). Day 2 can begin with lifecycle design before schema or API changes are made.
