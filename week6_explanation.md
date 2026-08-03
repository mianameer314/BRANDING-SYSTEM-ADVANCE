# Week 6 Explanation

**Project:** O2Geeks Branding System  
**Date:** 2026-08-04

## What This File Is

This is the plain-language explanation of what changed across Week 6 so far. It is meant to help you understand the project state without reading every code file one by one.

It covers:

- the Day 1 baseline and operational closeout
- the P0 fix that restored the test suite
- the Day 2 lifecycle and database evidence work
- the exact schema and model changes you will later reflect in the admin dashboard

## What We Finished On Day 1

Day 1 was the baseline and cleanup day. The goal was not to build the full new workflow yet. The goal was to understand the system, verify it is live, find the first real problems, and close anything that had to be fixed before the next days could start safely.

We completed these items:

1. Verified the live backend, admin dashboard, and public website.
2. Confirmed the backend health endpoint is healthy, the database is connected, and S3 storage is active.
3. Confirmed the public website hides draft content and shows published content correctly.
4. Identified the initial P0 blocker in the test suite.
5. Fixed the P0 blocker so the full test suite runs again.
6. Added a reusable deployment latency check script.
7. Added a reusable Git/release preflight script.
8. Wrote the Day 1 baseline report, setup guide, backlog, and closeout notes.

## What The P0 Fix Means

The first real technical blocker was the test database.

The app used PostgreSQL `ARRAY` for webhook content types, but the SQLite test database could not create that column type. That meant tests could fail before they even started.

We fixed that by making the model work in both places:

- Production PostgreSQL still uses `ARRAY(String)`
- SQLite tests now use `JSON`

We also fixed a preview test that was accidentally clearing important test overrides.

That is why the test suite is now green again.

## What The Day 1 Monitoring Scripts Do

We added two helper scripts so you can check the project later without guessing.

`scripts/day1_deployment_monitor.ps1`:

- checks backend health
- checks backend docs
- checks admin dashboard
- checks public website
- prints timing for each request
- gives a repeatable baseline for later comparison

`scripts/day1_release_preflight.ps1`:

- checks whether Git is available in the current shell
- checks whether the folder is a real Git repository
- checks whether remotes exist
- reminds you that Day 5 tagging must happen from the authoritative repo

## How The Flow Works

Here is the simple flow from Day 1 onward:

1. Day 1 establishes the baseline.
2. Day 1 closes the immediate technical blocker.
3. Day 1 records the live system state, timings, and repo readiness.
4. Day 2 adds the controlled editorial lifecycle and status-change evidence.
5. Day 3 adds revision history and audit trail.
6. Day 4 adds idempotency and webhook deduplication.
7. Day 5 closes the milestone and handles release tagging.

The key idea is that each day builds on the previous one. Day 1 is the foundation; Day 2 should not start from uncertainty.

## How You Should Proceed Next

For your own work, the order should be:

1. Keep Day 1 marked complete.
2. Treat the lifecycle code as the Day 2 implementation path.
3. Use the deployment monitor script whenever you want fresh timing numbers.
4. Use the release preflight script when you want to check repo/tag readiness.
5. Move into Day 3 only after the revision/audit work is planned and the migration work is understood.

## What Changed In The Code

### Schema and model changes

- `app/models/base.py`
  - added `status_changed_at`
  - added `status_changed_by_id`
  - added `status_change_reason`

These fields are inherited by all five content types:

- `Blog`
- `News`
- `Project`
- `Insight`
- `CaseStudy`

### Lifecycle logic changes

- `app/schemas/common.py`
  - expanded `ContentStatus` to include:
    - `draft`
    - `in_review`
    - `changes_requested`
    - `approved`
    - `scheduled`
    - `published`
    - `unpublished`
    - `archived`

- `app/services/content_lifecycle.py`
  - added allowed transition rules
  - added lifecycle metadata recording
  - kept `published` as the public visibility state

- `app/core/permissions.py`
  - added `approve` permission
  - restricted who can move content into approved/published states

### Content service changes

These services now enforce the lifecycle rules and save lifecycle metadata:

- `app/services/blog.py`
- `app/services/news.py`
- `app/services/project.py`
- `app/services/insight.py`
- `app/services/case_study.py`

### API route changes

These route handlers now pass the admin user and optional status reason into the services:

- `app/api/v1/blogs.py`
- `app/api/v1/news.py`
- `app/api/v1/projects.py`
- `app/api/v1/insights.py`
- `app/api/v1/case_studies.py`

### Database migration

- `alembic/versions/8f3b7e2c9d41_add_content_lifecycle_evidence.py`

This migration adds the new lifecycle evidence columns to all five content tables.

### Test coverage added

- `tests/test_content_lifecycle.py`

This file checks:

- the lifecycle enum values
- valid and invalid transitions
- publish timestamp behavior
- permission boundaries for editor vs admin

## What This Means For The Frontend Admin Dashboard

When you update the admin dashboard later, you now have a clearer data model to show:

- current status
- last status change time
- last status change user
- reason for the last status change

That means the dashboard can show workflow history instead of only a simple published/draft toggle.

## What Is Still Not Finished

These are still planned later-day items:

- Day 3: revision history and audit trail
- Day 4: API idempotency and webhook deduplication
- Day 5: final milestone evidence and release tag

## Short Version

Week 6 is moving forward because:

- the system is live
- the baseline is verified
- the first blocker was fixed
- the project now has repeatable checks and a clean starting point for the next days

## Day 2 Follow-up

The existing blog update flow remains unchanged. The API response now includes `status_changed_at`, `status_changed_by_id`, and `status_change_reason` after a real transition.

The local admin dashboard has been updated across Blogs, News, Projects, Insights, and Case Studies. Editors can select only valid lifecycle transitions available to their permissions, optionally add a reason, and view the latest lifecycle evidence after saving.
