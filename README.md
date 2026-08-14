# O2Geeks Branding System & Headless CMS

<p align="center">
  <img src="admin/public/images/logos/DarkLogo.svg" alt="O2Geeks Logo" width="120" />
</p>

<p align="center">
  <b>Enterprise-grade, decoupled Headless CMS</b> powering the <b>O2Geeks public website</b> (Nuxt 3) and a feature-rich <b>Admin Dashboard</b> (React 19 + Vite) backed by a high-performance <b>FastAPI REST API</b> (PostgreSQL + Redis).
</p>

---

## ������ Architecture at a Glance

| Pillar | Tech Stack | Hosting | Purpose |
|--------|------------|---------|---------|
| **Backend** | FastAPI · SQLAlchemy · PostgreSQL · Redis · APScheduler | Railway | Headless CMS engine: content lifecycle, RBAC, revisions, AI generation, webhooks |
| **Admin Dashboard** | React 19 · Vite · Tailwind CSS v4 · TanStack Query · Radix UI · Framer Motion | Vercel | Editorial workspace: content CRUD, approval queue, scheduling, live preview, diffing |
| **Public Website** | Nuxt 3 · Vue 3 · Vuetify 3 · Pinia · SSR | Vercel | Consumer site: blogs, news, projects, insights, case studies with secure live preview |

---

### System Diagram

<p align="center">
  <img src="docs/baseline/day1_architecture_diagram.svg" alt="O2Geeks Branding System Architecture" width="100%" />
</p>

---

## �� Feature Highlights

### ��� Content Lifecycle (7-State Workflow)
A controlled editorial pipeline with strict role-based transitions:

<p align="center">
  <img src="docs/baseline/day2_lifecycle_transition_diagram.svg" alt="Content Lifecycle Transitions" width="100%" />
</p>

| State | Description | Permission Required |
|-------|-------------|---------------------|
| `draft` | Editable internal work | Author |
| `in_review` | Submitted for editorial review | Author |
| `approved` | Editor-approved, ready to publish/schedule | Editor (Approve) |
| `scheduled` | Queued for future publication | Editor (Publish) |
| `published` | **Only publicly visible state** | Editor (Publish) |
| `unpublished` | Removed from public, retained in CMS | Editor (Publish) |
| `archived` | Retired content, hidden from lists | Editor (Archive) |

> **Key:** Every transition is validated server-side. Only `published` content is served to the public website.

---

### ��� Revision History & Immutable Audit Trail
Every change—content edits, status transitions, media actions, user/role changes, webhook config—is captured in a single ACID transaction:

<p align="center">
  <img src="docs/baseline/day3_revision_audit_diagram.svg" alt="Revision History & Audit Flow" width="100%" />
</p>

- **Immutable revisions**: Full payload snapshots stored append-only
- **Audit events**: Who did what, when, and why (with reason codes)
- **Safe restore**: Copy any prior version forward as a new revision—history never deleted
- **Coverage**: Content, media, users, roles, webhooks, delivery outcomes

---

### ������ Operations Console (Milestone 2)
- **Review Queue** – Centralized moderation with Approve / Request Changes / Reject actions
- **Scheduling** – Timezone-aware publishing via APScheduler (cron + interval jobs)
- **Publish Logs** – Webhook delivery tracking, manual retry, incident resolution, 30-day retention
- **Diff Viewer** – Side-by-side payload comparison between any two revisions

---

### ��� AI-Powered Content Generation
- Structured generation via OpenRouter (multiple model support)
- Auto-populate blogs, news, projects, insights, case studies
- JSON schema–validated outputs with retry logic

---

### ��� Security & Reliability
- **JWT + RBAC** – Access/refresh tokens, role/permission matrix
- **API Idempotency** – `Idempotency-Key` header for safe retries
- **Rate Limiting** – Redis-backed sliding window (auth, write, read tiers)
- **Webhook Signing** – HMAC-SHA256 payloads with replay protection
- **Content Locking** – Prevents edits after approval without explicit unlock

---

## ��� Repository Structure

```text
├── app/                          # FastAPI Backend
│   ├── api/v1/                   # 17 endpoint modules (auth, blogs, projects, …)
│   ├── core/                     # Security, JWT, config, permissions, rate limiting
│   ├── db/                       # SQLAlchemy session & base model
│   ├── models/                   # 17 SQLAlchemy ORM entities
│   ├── schemas/                  # 17 Pydantic schema modules (request/response contracts)
│   ├── services/                 # Business logic: lifecycle, AI, storage, webhooks, revisions
│   ├── tasks/                    # APScheduler background jobs (scheduling, webhook retries)
│   └── utils/                    # Helpers
├── admin/                        # React + Vite Admin Dashboard
│   └── src/
│       ├── features/             # 14 domain modules (blogs, projects, operations, …)
│       │   └── <domain>/         # api.ts · hooks.ts · schemas.ts · types.ts · views/
│       ├── components/           # Shared UI: layout, forms, tables, preview, errors
│       ├── config/               # Zod-validated env config
│       └── lib/                  # Utilities (cn, form-data builder)
├── o2geeks-website-v2/           # Nuxt 3 Public Website
│   ├── pages/                    # SSR routes for each content type
│   ├── components/               # Vue components (carousel, grids, preview iframe)
│   ├── composables/              # API clients, preview bridge, SEO helpers
│   └── services/                 # Axios instance, content mappers
├── docs/                         # Comprehensive documentation
│   ├── api/                      # 11 endpoint spec files + OpenAPI JSON
│   ├── admin/                    # Content Manager User Guide
│   ├── developer/                # Architecture & contribution guide
│   ├── deployment/               # Railway + Vercel guides, Git workflows
│   └── baseline/                 # Architecture & lifecycle diagrams (SVG)
├── alembic/                      # Database migrations
├── tests/                        # Pytest integration suite
��── daily work updates/           # Weekly milestone logs (Weeks 1–7)
```

---

## ��� Quick Start (Local Development)

### Prerequisites
- **Python 3.11+**, **Node 20+**, **PostgreSQL 15+**, **Redis 7+**

### 1. Backend (FastAPI)
```bash
# Create & activate venv
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install deps
pip install -r requirements.txt

# Configure env
cp .env.example .env            # Edit DATABASE_URL, REDIS_URL, JWT_SECRET, CORS_ORIGINS

# Run migrations
alembic upgrade head

# Start dev server
uvicorn app.main:app --reload --port 8000
```
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### 2. Admin Dashboard (React + Vite)
```bash
cd admin
npm install
cp .env.example .env            # Edit VITE_API_BASE_URL, VITE_FRONTEND_URL
npm run dev                     # http://localhost:5173
```

### 3. Public Website (Nuxt 3)
```bash
cd o2geeks-website-v2
npm install
cp .env.example .env            # Edit NUXT_PUBLIC_API_BASE, NUXT_PUBLIC_ADMIN_ORIGIN
npm run dev                     # http://localhost:3000
```

---

## ��� Environment Variables

### Backend (`app/.env`)
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/branding_cms
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-min-32-chars
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
STORAGE_PROVIDER=local          # or s3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
AWS_S3_REGION=us-east-1
OPENROUTER_API_KEY=
WEBHOOK_SECRET=hmac-signing-secret
```

### Admin (`admin/.env`)
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_FRONTEND_URL=http://localhost:3000
VITE_TOKEN_STORAGE_KEY=o2g_admin_token
VITE_REFRESH_TOKEN_STORAGE_KEY=o2g_admin_refresh_token
```

### Website (`o2geeks-website-v2/.env`)
```env
NUXT_PUBLIC_API_BASE=http://localhost:8000/api/v1
NUXT_PUBLIC_ADMIN_ORIGIN=http://localhost:5173
NUXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## ��� Testing & Quality

```bash
# Backend tests
pytest tests/ -v

# Admin lint
cd admin && npm run lint

# Admin type-check + build
cd admin && npm run build
```

---

## ��� Documentation Index

| Area | Document |
|------|----------|
| **API Reference** | [Authentication](docs/api/authentication.md) · [Auth](docs/api/auth.md) · [Blogs](docs/api/blogs.md) · [Projects](docs/api/projects.md) · [Case Studies](docs/api/case_studies.md) · [News](docs/api/news.md) · [Insights](docs/api/insights.md) · [Resources](docs/api/resources.md) · [Interactions](docs/api/interactions.md) · [Preview](docs/api/preview.md) · [AI Generation](docs/api/ai.md) · [Webhooks](docs/api/webhooks.md) · [Users](docs/api/users.md) · [Audit & Revisions](docs/api/audit.md) · [Operations Console](docs/api/operations.md) · [Stats](docs/api/stats.md) |
| **Admin Guide** | [Content Manager User Guide](docs/admin/admin-user-guide.md) |
| **Developer Guide** | [Architecture & Conventions](docs/developer/developer-guide.md) |
| **Deployment** | [Railway + Vercel Deployment](docs/deployment/deployment-guide.md) · [Git & Monitoring Workflow](docs/deployment/git_and_monitoring_workflow.md) |
| **QA** | [Regression Report](docs/regression_report.md) |

---

## ������ Tech Stack Summary

| Layer | Technologies |
|-------|--------------|
| **API** | FastAPI, Uvicorn, Pydantic v2, SQLAlchemy 2.0, Alembic |
| **Auth** | PyJWT, Passlib (bcrypt), python-multipart |
| **Database** | PostgreSQL (asyncpg/psycopg2), Redis (rate limiting, caching) |
| **Storage** | Local FS / S3 (boto3), Pillow, filetype |
| **Background Jobs** | APScheduler 3.10+ |
| **AI** | OpenRouter (multi-model), structured JSON output |
| **Admin** | React 19, Vite 6, Tailwind CSS v4, TanStack Query v5, React Router v7, Radix UI, Framer Motion, React Hook Form + Zod |
| **Website** | Nuxt 3, Vue 3, Vuetify 3, Pinia, Axios, Marked, vue3-carousel |
| **Observability** | Structured logging, webhook delivery logs, audit events |
| **Infra** | Railway (backend), Vercel (frontend), Docker-ready |

---

## ��� Milestone History

| Milestone | Focus | Log |
|-----------|-------|-----|
| **Week 1** | Foundation, Data Modeling, API Spec, DB Auth | [Week 1](daily%20work%20updates/week1_complete.md) |
| **Week 2** | CRUD, RBAC, Interactions, Dual-Provider Storage | [Week 2](daily%20work%20updates/week2_complete.md) |
| **Week 3** | Rate Limiting, Admin UI Architecture, User Management | [Week 3](daily%20work%20updates/week3_complete.md) |
| **Week 4** | Previews, AI Auto-Population, Staging Deployment | [Week 4](daily%20work%20updates/week4_complete.md) |
| **Week 5** | UI Sync, Production Bug Fixes, Documentation | [Week 5](daily%20work%20updates/week5_complete.md) |
| **Week 6 (M1)** | Controlled Editorial Backend, Lifecycle, Revisions, Idempotency, Webhooks | [Week 6](daily%20work%20updates/week6_complete.md) |
| **Week 7 (M2)** | Operations Console MVP, Approval Queue, Scheduling, Publish Logs | [Week 7](daily%20work%20updates/week7/) |

---

## ��� Contributing

1. Read the [Developer Guide](docs/developer/developer-guide.md)
2. Follow the feature-based architecture in `admin/src/features/`
3. Backend changes: routes → `app/api/v1/`, logic → `app/services/`, schemas → `app/schemas/`
4. Run tests & lint before PR
5. Update relevant docs in `docs/`

---

## ��� License

Copyright © 2026 **O2Geeks**. All rights reserved.

Built with ������ using **FastAPI**, **React 19**, **Nuxt 3**, **PostgreSQL**, **Redis**, and **Tailwind CSS v4**.

---

<p align="center">
  <sub>���� <a href="https://github.com/o2geeks">O2Geeks</a> · Headless CMS for modern branding teams</sub>
</p>