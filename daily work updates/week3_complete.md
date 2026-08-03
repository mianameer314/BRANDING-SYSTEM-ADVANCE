# 📅 Week 3 Complete Log — Security, Rate Limiting, Admin UI Architecture & User Management (July 8 - July 13, 2026)

This document contains the merged, un-truncated logs and architectural documentation for **Week 3 (Days 9 to 13)** of the O2Geeks Branding System Headless CMS.

---

# 📅 Day 9 — Production-Grade Redis Rate Limiting & Fail-Open Resilience (July 8, 2026)

Implemented a production-grade, Redis-backed rate limiting engine powered by `fastapi-limiter` (v0.1.6) and `redis.asyncio`.

## 1. Core Architecture & Fail-Open Mechanism
* **Redis Backend**: Tracks request frequency per key in memory.
* **Smart Client Identification**: Logged-in accounts are identified by JWT User ID (`user:14`); anonymous guests are tracked by IP resolved via `CF-Connecting-IP` or `X-Forwarded-For` proxy headers.
* **Graceful Fail-Open**: If Redis goes offline, the system catches the connection exception, logs a warning, and allows all requests through to preserve application uptime.
* **Headers & Custom Responses**: Emits standard `Retry-After`, `X-RateLimit-Remaining`, and returns `429 Too Many Requests` with a clean JSON detail body.

## 2. Rate Limit Tiers (.env Configured)
- **Login Limit**: 5 requests / 60s (`RATE_LIMIT_LOGIN`)
- **Register Limit**: 3 requests / 60s (`RATE_LIMIT_REGISTER`)
- **Public Read Limit**: 120 requests / 60s (`RATE_LIMIT_PUBLIC_GET`)
- **Upload / Mutate Limit**: 10-30 requests / 60s (`RATE_LIMIT_UPLOAD`)

---

# 📅 Day 10 — Security Hardening & Admin UI Architecture (July 9, 2026)

Audited backend authorization routines and scaffolded the Vite + React Admin Dashboard frontend.

## 1. Backend Security Refactoring
* **Centralized Permissions**: Added `enforce_publish_permission` and `can_view_drafts` to `app/core/permissions.py`.
* **Dependency Caching Fix**: Fixed a vulnerability in `get_current_user` dependency tree where role claims were cached across sub-dependencies.
* **Router Isolation**: Stripped authorization out of service functions and placed strict gatekeeper guards inside API router files (`api/v1/*.py`).
* **OpenAPI TS Types**: Generated strict TypeScript types directly from live OpenAPI schema.

## 2. Admin Dashboard UI Foundation
* **Stack**: Vite 5, React 19, TypeScript, TailwindCSS v4, TanStack Query, Axios, React Router DOM.
* **Directory Layout (`admin/src/`)**:
  - `api/axios.ts`: Handles JWT bearer injection and 401 Unauthorized redirects.
  - `config/env.ts`: Enforces strict runtime environment variables.
  - `features/`: Screaming architecture module folders (`blogs`, `news`, `projects`, `insights`, `case-studies`, `users`, `auth`).
  - `providers/`: `AuthProvider.tsx` (session/token management) and `QueryProvider.tsx`.

---

# 📅 Day 11 — Complete Frontend CRUD & Full-Stack Sync (July 11, 2026)

Implemented Create, Update, and Delete form interfaces for all 5 content types with Zod validation and image handling.

## 1. Admin Form Modules
* **React Hook Form + Zod**: Built form pages (`BlogFormPage`, `NewsFormPage`, `ProjectFormPage`, `InsightFormPage`, `CaseStudyFormPage`).
* **`buildFormData` Utility**: Dynamically serializes nested objects (e.g. Case Study metrics) and File objects into `multipart/form-data`.
* **Media Components**: `ImageUploadField` (cover images with `remove_cover_image` flags) and `GalleryUploadField` (local React state for `keptGalleryUrls`).
* **Dirty State Tracking**: Hooked `removeCoverImage` and `galleryChanged` into `FormActions.isDirty` to ensure "Save Changes" is enabled when media changes.

## 2. Backend Bug Fixes
* **Ghost Data Deletion**: Fixed bug where `DELETE` APIs deleted files but left DB rows intact by ensuring `service.delete_*` commits.
* **Draft Update 500 Error**: Fixed `ResponseValidationError` when updating drafts by setting `include_drafts=True` inside service update methods.

---

# 📅 Day 12 & 13 — RBAC, User Management & Resource Attachments (July 12-13, 2026)

Built backend-driven RBAC integration, User Management UI, and Resource Attachment queuing.

## 1. Backend-Driven RBAC
* Modified `UserOut` schema to inject a dynamically computed `permissions` string array. The frontend reads permissions directly from JWT/`/auth/me`.
* Created `PermissionRoute` (blocks direct URL access) and `PermissionGuard` (conditionally hides action buttons).

## 2. User Management Module (`/users`)
* Built Users list, Create User, and Edit User pages.
* Added `viewer` role support.
* **Self-Demotion Protection**: Disables role dropdown when users edit their own profile (`"You cannot change your own role"`).
* **Soft Reactivation**: Added UI toggle to restore soft-deleted (deactivated) accounts.

## 3. Resource Attachments Subsystem
* Built `<ResourceAttachments />` frontend component to queue file uploads *before* parent content creation.
* Uses `Promise.allSettled` to upload resources independently after obtaining parent `content_id`.
* **Cascading Deletion Deadlock Fix**: Reversed `DELETE` routing sequence to delete attached resources from storage/DB *prior* to deleting the parent entity.
