# Day 1 Prioritized Month 2 Backlog

## P0 — Restore automated regression testing

**Problem:** Tests use SQLite while the webhook model requires PostgreSQL `ARRAY`.  
**Action:** Move integration testing to PostgreSQL or introduce a portable SQLAlchemy type variant.  
**Acceptance:** `python -m pytest tests -q` executes the suite; no schema-creation failure occurs.
**Status:** Complete on 2026-08-03. `Webhook.content_types` keeps PostgreSQL `ARRAY(String)` in production and uses SQLite `JSON` in tests. Full suite result: `43 passed, 24 warnings`.

## P1 — Controlled editorial lifecycle

**Problem:** Content supports only `draft` and `published`.  
**Action:** Add explicit lifecycle state transitions, actor fields, timestamps, reasons, and authorization rules.  
**Acceptance:** Invalid and unauthorized transitions are rejected for all five content types.
**Status:** Staged as Day 2 pre-work. Phase 1 adds shared lifecycle states, transition validation, permission checks, service integration, and tests. Actor/timestamp/reason persistence remains before this P1 can be marked complete.

## P1 — Revision history and audit trail

**Problem:** Changes cannot be traced or restored.  
**Action:** Add revisions, audit events, transactional content operations, and rollback support.  
**Acceptance:** Each material change has an actor, timestamp, version/snapshot, and recoverable prior state.

## P1 — API idempotency and webhook deduplication

**Problem:** Retry or duplicate requests can repeat side effects.  
**Action:** Introduce durable PostgreSQL idempotency records and deduplicated publish-event delivery.  
**Acceptance:** An identical retry returns the original result; a conflicting reuse of a key is rejected.
**Status:** Complete.

## P2 — Performance and operational visibility

**Problem:** First-response timings were elevated and monitoring gaps are unverified.  
**Action:** Add structured timings, error-rate/latency monitoring, and investigate Railway/Vercel performance.  
**Acceptance:** p50/p95 latency, error rate, deployment version, and relevant health signals are observable.
**Status:** Day 1 closeout added repeatable deployment latency monitoring with `scripts/day1_deployment_monitor.ps1`. Deeper optimization remains a P2 operations backlog item.

## P2 — Documentation and release control

**Problem:** The local project copy is not a usable Git checkout.  
**Action:** Identify the source-controlled repository and document release/tagging flow.  
**Acceptance:** The Day 5 `backend-alpha` release can be tagged in the authoritative repository.
**Status:** Day 1 closeout added `scripts/day1_release_preflight.ps1` and documented that the release tag must be created from the authoritative Git repository.
