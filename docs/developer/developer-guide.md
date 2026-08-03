# O2Geeks Branding System — Developer Technical Guide

This guide details the technical architecture, data models, state management, preview systems, and developer workflows for the **O2Geeks Branding System**.

---

## 1. Monorepo Architecture & Directory Map

```text
Branding_System/
├── app/                        # FastAPI Backend Application
│   ├── api/                    # API Routers (v1)
│   │   ├── deps.py             # Dependency Injections (DbDep, CurrentUser)
│   │   └── v1/                 # Endpoints (auth, blogs, projects, etc.)
│   ├── core/                   # Security, JWT, Config, Permissions
│   ├── db/                     # SQLAlchemy Session & Base Model
│   ├── models/                 # Database ORM Entities
│   ├── rate_limit/             # Redis-backed rate limiting middleware
│   ├── schemas/                # Pydantic Schemas & Data Contracts
│   ├── services/               # Core Business Logic & S3/Local Storage Services
│   └── main.py                 # FastAPI Application Entrypoint
├── admin/                      # React + Vite Admin Dashboard
│   ├── src/
│   │   ├── components/         # UI & Preview Components
│   │   ├── config/             # Strict Environment Loaders (env.ts)
│   │   ├── pages/              # Module CRUD Pages
│   │   ├── services/           # Axios Services
│   │   └── types/              # TypeScript Interfaces
│   └── vite.config.ts
├── o2geeks-website-v2/         # Nuxt 3 Public Website Consumer
│   ├── components/             # Vuetify & Custom Components
│   ├── composables/            # Nuxt State (usePreviewState)
│   ├── pages/                  # Nuxt File-Based Routes & Previews
│   ├── plugins/                # media.ts ($mediaUrl) & preview.client.ts
│   └── nuxt.config.ts
├── alembic/                    # Database Schema Migrations
└── docker-compose.yml          # Local PostgreSQL & Redis Infrastructure
```

---

## 2. Technical Stack Specifications

* **Backend**: FastAPI 0.110+, Python 3.11+, SQLAlchemy 2.0 ORM, Pydantic v2.
* **Database**: PostgreSQL 15+ (Production on Railway), SQLite/Postgres (Local).
* **Cache & Rate Limiting**: Redis 7+ with `fastapi-limiter`.
* **Admin Dashboard**: React 18, Vite 5, TypeScript 5, React Hook Form + Zod, TailwindCSS + Lucide Icons.
* **Public Website**: Nuxt 3.11, Vue 3, TypeScript, Vuetify 3, Pinia.

---

## 3. Environment Variables Reference

### Backend (`app/core/config.py`)

| Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `APP_NAME` | string | `O2geeks Headless CMS` | System title |
| `APP_ENV` | string | `development` | Environment mode (`development`/`production`) |
| `DATABASE_URL` | string | Required | PostgreSQL connection string |
| `REDIS_URL` | string | Required | Redis connection string |
| `JWT_SECRET` | string | Required | 32+ char secret for JWT signing |
| `CORS_ORIGINS` | string | `http://localhost:3000,http://localhost:5173` | Comma-separated allowed origins |
| `STORAGE_PROVIDER` | string | `local` | Storage driver (`local` or `s3`) |

### React Admin (`admin/src/config/env.ts`)

| Variable | Description |
| :--- | :--- |
| `VITE_API_BASE_URL` | FastAPI Backend API URL (`https://.../api/v1`) |
| `VITE_FRONTEND_URL` | Nuxt Website URL (`https://...vercel.app`) |

### Nuxt Website (`o2geeks-website-v2/nuxt.config.ts`)

| Variable | Description |
| :--- | :--- |
| `NUXT_PUBLIC_API_BASE` | FastAPI Backend API URL (`https://.../api/v1`) |
| `NUXT_PUBLIC_ADMIN_ORIGIN` | Admin Dashboard origin (`https://...vercel.app`) |
| `NUXT_PUBLIC_SITE_URL` | Public Website URL |

---

## 4. Nuxt `$mediaUrl` Global Plugin

To resolve relative media URLs returned by the backend (e.g. `/media/blogs/img.webp`), the Nuxt consumer uses a global plugin `plugins/media.ts`:

```typescript
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase || 'http://localhost:8000/api/v1';
  const backendOrigin = apiBase.replace(/\/api\/v1\/?$/, '');

  const mediaUrl = (path: string | null | undefined): string => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('blob:')) {
      return path;
    }
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${backendOrigin}${cleanPath}`;
  };

  return {
    provide: {
      mediaUrl
    }
  };
});
```

---

## 5. Live Preview `postMessage` Architecture & Polling Handshake

Live Preview between the React Admin (Parent) and Nuxt Website (Iframe) uses a secure, environment-driven `postMessage` protocol:

```text
React Admin (Parent)                             Nuxt Website (Iframe)
       │                                                 │
       │───────────── Embeds Iframe (`src`) ────────────>│
       │                                                 │
       │<─── Polling Handshake (`PREVIEW_READY`) ────────│ (Every 500ms until ACK)
       │     (Validated via `new URL(origin).origin`)    │
       │                                                 │
       │─── Sends State (`LIVE_PREVIEW_UPDATE`) ────────>│
       │    (Form Data + File Blob/Base64 URLs)          │
       │                                                 │
```

### Origin Validation Rule
Both ends strictly normalize origins before accepting messages:
```typescript
const allowedOrigin = new URL(configuredUrl).origin;
if (event.origin !== allowedOrigin) return;
```
Wildcard targets (`'*'`) are strictly prohibited in production.
