# Day 4 Implementation Plan - API Contracts, Idempotency & Permission Hardening

**Week 6 - Controlled Editorial Backend**
**Date:** 2026-08-05
**Status:** Planned (not started)
**Source of truth:** `daily work updates/week6_complete.md` Day 4 section, `clean_tasks.txt` Day 4.0, and `docs/baseline/day1_prioritized_backlog.md` P1 item "API idempotency and webhook deduplication".

---

## 1. Objective

> Make write operations predictable and safe under retries or duplicate requests.

Day 4 hardens the API layer so that any retry, duplicate, or replayed request cannot repeat side effects (revisions, audit events, media uploads, AI generation cost, webhook deliveries). It also locks down the role/permission boundaries for authors, editors, approvers, and administrators, and proves the contract with automated security and duplicate tests.

### Backlog acceptance criteria (P1)

- An identical retry returns the original result.
- A conflicting reuse of an idempotency key is rejected.
- Publish-event delivery is deduplicated.

### Out of scope (guarded explicitly)

- New content features or lifecycle changes (Day 2/3 already landed).
- Redis-based idempotency: Redis is fail-open in this system, so idempotency must be durable PostgreSQL state, not memory/Redis state.
- Frontend feature work except small contract alignment (header/error handling in the admin client is optional and non-blocking).

---

## 2. Morning Audit (before any implementation)

Walk the live code and record the current contract in one pass so the plan below is implemented against facts, not assumptions.

### 2.1 Request/response schema audit

For every route in `app/api/v1/*`:

- [x] Confirm each response has an explicit `response_model` (no untyped dict leaks).
- [x] Confirm create returns 201, update/delete return 200/204 consistently, and paginated lists use `PaginatedResponse` (`items`, `total`, `page`, `per_page`).
- [x] Confirm error bodies are the standard FastAPI `{"detail": "..."}` shape and are not leaking stack traces (global handler in `app/main.py` already masks in production - verify by test).
- [x] Record any schema that returns raw ORM objects or extra internal fields.
- [x] Confirm `/docs` and `/redoc` exposure rules (already gated by `settings.DEBUG`/`APP_ENV` - verify).

### 2.2 Permission audit (role x route matrix)

Build the matrix from `ROLE_PERMISSIONS` in `app/core/permissions.py` and every route dependency:

- [x] Every mutating route has a `require_permission(...)` dependency (`CreateDep`, `UpdateDep`, `DeleteDep`, `ManageUsersDep`, `AdminDep`).
- [x] Every lifecycle transition route calls `enforce_publish_permission(...)` (Day 2 wiring exists - verify all five content types).
- [x] Webhook management currently uses `publish` as a proxy for admin - record this as a decision point (see 5.1).
- [x] `/users` is `manage_users` (super_admin only) - verify admin/editor cannot reach it.
- [x] Draft visibility: `can_view_drafts` gates draft content; anonymous and `user`/`viewer` must never see drafts.

### 2.3 Duplicate side-effect audit

Find every operation that has side effects and note whether a retry would repeat them:

- [x] Content create/update (five types): revision capture + audit events + media upload.
- [x] Publish transition: background webhook dispatch via `dispatch_publish_event`.
- [x] AI draft ingestion: `POST /api/v1/ai/generate` calls the OpenRouter provider (paid per call).
- [x] Revision restore endpoints (`app/api/v1/audit.py`): creates a new revision + media restore.
- [x] Webhook CRUD: creates audit events.
- [x] Likes/comments/interactions: idempotent by design (no-op on repeat) - record, do not wrap.

### 2.4 Audit output

- [x] Write the findings into this document's appendix (or `docs/api/contract_audit.md`) and fix the concrete gaps found in Phase 5.

---

## 3. Workstream A - API Contract Hardening

### 3.1 Deliverable: contract rules (encode as tests)

Adopt and document these rules, then enforce them with `tests/test_api_contract.py`:

1. **Pagination:** every list endpoint returns `{items, total, page, per_page}`; `page >= 1`, `per_page` bounded (`1..100`).
2. **Error contract:** every error is `{"detail": "..."}` with a stable status code map:
   - `400` validation / invalid transition
   - `401` missing/expired token
   - `403` missing permission / inactive user
   - `404` unknown resource
   - `409` conflicting idempotency-key reuse (new)
   - `429` rate limited (already emitted by `app/rate_limit/callback.py`)
   - `500` masked internal error
3. **Mutating contract:** `POST` returns 201 + created resource; `PUT` returns 200 + updated resource; `DELETE` returns the documented status (200 with `{"message": ...}` or 204) - choose one per router and standardize.
4. **Idempotency header:** all mutating content/AI/webhook/restore endpoints accept `Idempotency-Key` (see Workstream B).
5. **Versioning statement:** keep `/api/v1` prefix stable; document that Day 4 changes are backward-compatible (additive headers/fields only).

### 3.2 Contract test suite

- [x] `tests/test_api_contract.py`: iterate the OpenAPI schema from `app.openapi()` and assert response models exist for each route.
- [x] Spot-check response shape for every content type list/get/create/update/delete.
- [x] Spot-check error shape for 401/403/404 on representative routes.
- [x] Assert `/docs` disabled when `APP_ENV == production` and `DEBUG == false`.
- [x] Export a frozen `docs/api/openapi.json` snapshot as the Day 4 contract artifact (regenerate after implementation).

---

## 4. Workstream B - Durable Idempotency (PostgreSQL)

### 4.1 New model: `ApiIdempotencyRecord`

File: `app/models/api_idempotency_record.py` (register in `app/models/__init__.py`).

| Column | Type | Notes |
|---|---|---|
| `id` | int PK | |
| `user_id` | int FK -> users.id, indexed | Idempotency is scoped per authenticated user |
| `idempotency_key` | str(128) | SHA-256 of the client-supplied key (never store the raw key) |
| `endpoint` | str(255) | `METHOD /path-pattern`, e.g. `POST /api/v1/blogs` |
| `request_fingerprint` | str(64) | SHA-256 of canonical request: method + path + sorted parsed body |
| `response_status` | int | Stored original status for replay |
| `response_body` | JSON | Stored original JSON body for replay |
| `created_at` | timestamptz | server default now |
| `expires_at` | timestamptz | default `now() + 24 hours` (config `IDEMPOTENCY_TTL_HOURS`) |

Unique constraint: `(user_id, endpoint, idempotency_key)` -> `uq_api_idempotency_user_endpoint_key`.

Indexes: `user_id`, `expires_at` (for periodic cleanup), `created_at`.

### 4.2 Dependency: `app/api/idempotency.py`

Behavior for mutating endpoints that opt in:

1. Read `Idempotency-Key` header. If absent: process normally (no idempotency record).
2. If present:
   - Compute fingerprint from the parsed request (method, path, canonicalized JSON of form/body fields - NOT raw multipart bytes, which contain random boundaries).
   - Look up `(user_id, endpoint, key_hash)`.
   - **Replay hit:** fingerprint matches -> return stored `response_status` + `response_body` with header `X-Idempotent-Replay: true`. No side effects run.
   - **Conflict:** record exists but fingerprint differs -> `409 Conflict`, detail `Idempotency key already used with a different request`.
   - **Miss:** proceed; after the operation commits, write the record in the **same transaction** as the write (content + revision + audit + idempotency record are atomic). If the operation rolls back, the idempotency record rolls back too.
3. Expired records (`expires_at < now`) are treated as misses; add a small janitor (`DELETE FROM api_idempotency_records WHERE expires_at < now()`) run on startup or via a lightweight scheduled task.

### 4.3 Endpoint integration (opt-in list)

Wire `IdempotencyDep` into:

- [x] `POST/PUT/DELETE` for all five content types: blogs, news, projects, insights, case studies (`app/api/v1/blogs.py`, `news.py`, `projects.py`, `insights.py`, `case_studies.py`).
- [x] `POST /api/v1/ai/generate` (AI draft ingestion) - a retry must not double-bill the provider.
- [x] Revision restore endpoints in `app/api/v1/audit.py`.
- [x] `POST/PUT/DELETE /api/v1/webhooks` (webhook-triggered changes).

Design note for multipart content create/update: fingerprint the parsed `Form` fields plus upload filenames; the replay path returns the stored JSON without touching storage, so a retried upload cannot re-upload media or double-capture a revision.

### 4.4 Migration

- [x] `alembic revision` -> `add_idempotency_records` (upgrade/downgrade clean; SQLite-compatible for tests).
- [x] Apply locally and on Railway (startup already runs migrations before the server starts per Day 3 fix - verify).

---

## 5. Workstream C - Webhook Deduplication

### 5.1 Decision point (record in log)

- [x] Decide and document the webhook management permission: keep `publish` (admin+super_admin) or introduce an explicit `manage_webhooks` permission. Recommendation: introduce `manage_webhooks` granted to `super_admin` and `admin` in `ROLE_PERMISSIONS`, and switch `app/api/v1/webhooks.py` `AdminDep` to it - it is self-documenting, auditable, and decouples webhook management from the publish capability.

### 5.2 Deduplication design

Modify `app/services/webhook_dispatcher.py` and `app/models/webhook_log.py`:

- [x] Add `delivery_id: str` (UUID) and `dedup_key: str(64)` columns to `WebhookLog`.
- [x] `dedup_key = sha256(event | content_type | content_id | payload_fingerprint)`.
- [x] Unique constraint on `(webhook_id, dedup_key)` -> `uq_webhook_log_webhook_dedup`.
- [x] Dispatcher flow:
  1. Build the versioned payload (as today).
  2. Compute `dedup_key`.
  3. If a successful `WebhookLog` already exists for this `(webhook_id, dedup_key)`, skip delivery and record a `integration.webhook_skipped` audit event (no duplicate HTTP POST).
  4. Otherwise deliver, insert the log row with the UUID `delivery_id`, and add header `X-Webhook-Delivery-ID: <uuid>` so consumers can dedup independently.
  5. Handle the concurrent race: rely on the unique constraint; on `IntegrityError`, treat as already-delivered and skip.
- [x] Genuine re-publish after content changes gets a new payload fingerprint -> new `dedup_key` -> delivers (dedup does not block legitimate re-publishes).
- [x] Add config: `WEBHOOK_DEDUP_ENABLED: bool = True`.

### 5.3 Delivery hardening (small, bundled)

- [x] Add `X-Webhook-Delivery-ID` to the signed headers (signature stays over the same body bytes).
- [x] Optional but recommended: `WEBHOOK_RETRY_MAX: int = 3` with exponential backoff for non-2xx/network failures, still writing one audit trail.

---

## 6. Workstream D - Permission Hardening

### 6.1 Fixes from the audit (expected findings - verify each)

1. **Webhook secret exposure (security fix):** `WebhookOut.secret: str` currently returns the full HMAC secret in list/get responses. Fix:
   - Mask the secret in `WebhookOut` (e.g., `secret_masked: str = "abc12345****"` and `has_secret: bool`).
   - Return the full secret only once in the 201 create response (`WebhookCreatedOut` with `secret`), so operators can copy it at registration time.
2. **Webhook permission:** implement `manage_webhooks` per 5.1.
3. **AI generation permission:** confirm `create` is the right boundary (editors+ can generate drafts; generation is a draft-only action). Keep `create`; idempotency + existing `AI_GENERATION_LIMIT` cover retry/cost.
4. **Role escalation guards:** verify `update_user` prevents an admin from promoting anyone to `super_admin` (currently only super_admin holds `manage_users`, but add a test that locks this in) and prevents self-demotion (already implemented - keep).
5. **Inactive users:** confirm `get_current_user` blocks `is_active == False` (implemented - add contract test).
6. **Draft leakage:** confirm anonymous / `user` / `viewer` never receive draft rows (already gated by `can_view_drafts` - lock with tests).

### 6.2 Deliverable: permission matrix

- [x] Create `docs/baseline/day4_permission_matrix.md` mapping every route to its required permission and allowed roles (super_admin / admin / editor / user / viewer).
- [x] Mirror the matrix in `tests/test_permission_matrix.py` as a data table.

---

## 7. Workstream E - Automated Security & Duplicate Tests

New test files (SQLite-compatible, following `tests/conftest.py` conventions):

### `tests/test_idempotency.py`

- [x] Identical retry (same key, same body) -> original status + body returned, `X-Idempotent-Replay: true`, and **exactly one** revision/audit event created.
- [x] Conflicting reuse (same key, different body) -> `409`.
- [x] Same key on different endpoints -> independent records.
- [x] Same key by different users -> independent records.
- [x] Expired key -> new request processed normally.
- [x] Missing header -> normal behavior, no record.
- [x] AI generate: mocked provider called exactly once across a retried pair.

### `tests/test_webhook_dedup.py`

- [x] Two dispatches with identical payload -> one HTTP POST (mock httpx), one log row, second recorded as skipped.
- [x] Changed payload -> new delivery.
- [x] `X-Webhook-Delivery-ID` present and unique per delivery.
- [x] HMAC signature still valid for delivered payloads.
- [x] Concurrent duplicate dispatch -> single delivery (unique constraint path).

### `tests/test_permission_matrix.py`

- [x] Table-driven role x endpoint expectations: 200/201/204 vs 403 for every row.
- [x] Editor cannot approve/publish/schedule/unpublish/archive; admin can.
- [x] `user`/`viewer` cannot create/update/delete; `viewer` cannot interact.
- [x] Admin cannot call `/users`; super_admin can.
- [x] Draft content invisible to anonymous/user/viewer.
- [x] Webhook secret masked in list/get; present only in create response.
- [x] Inactive user gets 403 on authenticated endpoints.

### `tests/test_api_contract.py`

- [x] As defined in 3.2.

---

## 8. Files to create / modify

| Action | Path |
|---|---|
| Create | `app/models/api_idempotency_record.py` |
| Modify | `app/models/__init__.py` (register model) |
| Modify | `app/models/webhook_log.py` (`delivery_id`, `dedup_key`, unique constraint) |
| Create | `app/api/idempotency.py` (dependency + replay/conflict logic) |
| Modify | `app/api/deps.py` (optional: export idempotency dependency) |
| Modify | `app/core/config.py` (`IDEMPOTENCY_TTL_HOURS`, `WEBHOOK_DEDUP_ENABLED`, `WEBHOOK_RETRY_MAX`) |
| Modify | `app/core/permissions.py` (`manage_webhooks` permission) |
| Modify | `app/api/v1/webhooks.py` (permission dep, secret-on-create response) |
| Modify | `app/schemas/webhook.py` (mask secret in `WebhookOut`) |
| Modify | `app/services/webhook_dispatcher.py` (dedup + delivery ID) |
| Modify | `app/api/v1/blogs.py`, `news.py`, `projects.py`, `insights.py`, `case_studies.py` (idempotency dep) |
| Modify | `app/api/v1/ai.py` (idempotency dep) |
| Modify | `app/api/v1/audit.py` (idempotency dep on restore) |
| Create | `alembic/versions/<rev>_add_idempotency_and_webhook_dedup.py` |
| Create | `tests/test_idempotency.py`, `tests/test_webhook_dedup.py`, `tests/test_permission_matrix.py`, `tests/test_api_contract.py` |
| Create | `docs/api/openapi.json` (frozen contract snapshot) |
| Create | `docs/baseline/day4_permission_matrix.md` |
| Modify | `docs/api/*.md` (idempotency header + error contract + permission notes) |
| Modify | `docs/baseline/day1_prioritized_backlog.md` (mark P1 idempotency status) |
| Modify | `daily work updates/week6_complete.md` (fill Day 4 section with evidence) |
| Modify | `week6_explanation.md` (Day 4 plain-language section) |

---

## 9. Suggested execution order (timeboxed)

1. **Audit (AM):** complete section 2 checklists; capture findings. (1-1.5h)
2. **Contract rules + tests:** `tests/test_api_contract.py`, error/pagination assertions, frozen OpenAPI. (1-1.5h)
3. **Idempotency:** model + migration + dependency + wire content/AI/restore/webhook endpoints + tests. (2.5-3h)
4. **Webhook dedup:** model columns + dispatcher + tests. (1.5-2h)
5. **Permission hardening:** `manage_webhooks`, secret masking, matrix doc + `test_permission_matrix.py`. (1.5-2h)
6. **Verification & docs:** full suite, migration up/down, update week docs and backlog. (1h)

Total ~8-10h of implementation time.

---

## 10. Acceptance criteria (Definition of Done)

- [x] Identical retry returns the original status + body and creates no duplicate revisions, audit events, media, AI calls, or webhook deliveries.
- [x] Conflicting reuse of an idempotency key returns `409`.
- [x] AI draft ingestion is idempotent (provider called once per logical request).
- [x] Publish events are delivered at most once per unique payload per webhook.
- [x] Webhook secrets are masked in list/get responses and returned once on create.
- [x] Full permission matrix passes (every role x route expectation).
- [x] Draft content is never exposed to anonymous/user/viewer.
- [x] `python -m pytest tests -q` green (target ~65+ passed, no new warnings).
- [x] `alembic upgrade head` / `downgrade -1` clean on PostgreSQL and SQLite test path.
- [x] Day 4 section of `week6_complete.md` updated with evidence; `week6_explanation.md` updated; backlog P1 marked complete.

---

## 11. Risk register

| Risk | Mitigation |
|---|---|
| Replay stored response diverges from the actual object if a later edit changed it | Replay returns the stored snapshot of the original request result; idempotency semantics are "result of this exact request", documented in the contract |
| Multipart fingerprint instability (random boundaries) | Fingerprint parsed form fields + filenames only, never raw bytes |
| Concurrent duplicate webhook dispatch double-delivers | Unique `(webhook_id, dedup_key)` constraint + IntegrityError handling |
| Redis fail-open makes rate limiting unreliable under load | Idempotency is PostgreSQL-durable and independent of Redis |
| Idempotency table growth | TTL + expires_at cleanup janitor on startup |
| Webhook secret leak during migration window | Mask in schema first; rotate secrets after deploy if a leak is suspected |
