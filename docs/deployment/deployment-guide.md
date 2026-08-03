# O2Geeks Branding System — Production Deployment Guide

This guide details step-by-step procedures for deploying the **FastAPI Backend** to Railway, and the **React Admin** + **Nuxt Website** to Vercel.

---

## 1. Production Architecture Overview

```text
  [ Vercel: Nuxt 3 Website ]   <──(HTTPS)──>   [ Railway: FastAPI Backend ]
  https://o2geeks-website.vercel.app            https://branding-backend.up.railway.app
                                                          │
  [ Vercel: React Admin ]      <──(HTTPS)───────────────┤
  https://branding-admin.vercel.app                      ├──> [ Railway Postgres ]
                                                          └──> [ Railway Redis ]
```

---

## 2. Backend Deployment (FastAPI on Railway)

### Step 1: Provision Services
1. Log into [Railway.app](https://railway.app).
2. Create a **New Project** and provision:
   * **PostgreSQL Database**
   * **Redis Instance**
3. Connect your GitHub repository to a new **Web Service**.

### Step 2: Configure Environment Variables in Railway
Set the following variables in the Railway Web Service settings:

```env
APP_NAME=O2geeks Headless CMS
APP_ENV=production
DEBUG=False
LOG_LEVEL=INFO

DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}

JWT_SECRET=YOUR_SUPER_SECRET_PRODUCTION_JWT_KEY_MIN_32_CHARS
JWT_ALGORITHM=HS256
JWT_ACCESS_EXPIRY_MINUTES=30
JWT_REFRESH_EXPIRY_DAYS=7

ADMIN_EMAIL=admin@o2geeks.com
ADMIN_PASSWORD=SetSecureProductionPassword2026!

CORS_ORIGINS=https://o2geeks-website-v2-black.vercel.app,https://branding-system-frontend.vercel.app

STORAGE_PROVIDER=s3
MEDIA_URL=/media
LOCAL_STORAGE_PATH=storage

AWS_ACCESS_KEY_ID=YOUR_AWS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET
AWS_REGION=us-east-1
AWS_BUCKET_NAME=o2geeks-media-production
AWS_ENDPOINT_URL=https://s3.us-east-1.amazonaws.com
```

### Step 3: Run Database Migrations
Railway executes `Procfile` on startup:
```text
web: alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

---

## 3. Admin Dashboard Deployment (React on Vercel)

1. Import the `admin/` directory in Vercel.
2. Select **Vite** framework preset.
3. Configure Environment Variables:

```env
VITE_API_BASE_URL=https://branding-system-production.up.railway.app/api/v1
VITE_FRONTEND_URL=https://o2geeks-website-v2-black.vercel.app
VITE_TOKEN_STORAGE_KEY=o2g_admin_token
VITE_REFRESH_TOKEN_STORAGE_KEY=o2g_admin_refresh_token
```

4. Deploy.

---

## 4. Public Website Deployment (Nuxt 3 on Vercel)

1. Import the `o2geeks-website-v2/` directory in Vercel.
2. Select **Nuxt.js** framework preset.
3. Configure Environment Variables:

```env
NUXT_PUBLIC_API_BASE=https://branding-system-production.up.railway.app/api/v1
NUXT_PUBLIC_ADMIN_ORIGIN=https://branding-system-frontend.vercel.app
NUXT_PUBLIC_SITE_URL=https://o2geeks-website-v2-black.vercel.app
```

4. Deploy.

---

## 5. Post-Deployment Verification Checklist

- [ ] **Database Connection**: Verify `/healthz` returns `{"status": "healthy", "database": "Connected"}`.
- [ ] **Admin Login**: Log into React Admin using `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
- [ ] **Media Uploads**: Create a test blog post with a cover image. Confirm S3 or media URL resolves properly via `$mediaUrl`.
- [ ] **Live Preview**: Open Live Preview in Admin. Verify state syncs to iframe without CORS or origin errors.
- [ ] **Secure Preview**: Generate a Secure Preview token and open the preview URL in an incognito window.
