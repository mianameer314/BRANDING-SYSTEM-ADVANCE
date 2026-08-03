# 🚀 O2Geeks Branding System & Headless CMS

<div align="center">

![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Nuxt3](https://img.shields.io/badge/Nuxt_3-00DC82?style=for-the-badge&logo=nuxtdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Railway](https://img.shields.io/badge/Railway-131415?style=for-the-badge&logo=railway&logoColor=white)

</div>

---

## 🎨 System Overview

The **O2Geeks Branding System** is an enterprise-grade, decoupled Headless CMS architecture. It powers the public **O2Geeks Website** (Nuxt 3) and provides a feature-rich **Admin Dashboard** (React + Vite) backed by a high-performance **FastAPI REST API** (PostgreSQL + Redis).

```text
  ┌────────────────────────┐      ┌────────────────────────┐
  │   Nuxt 3 Website       │      │  React Admin Dashboard │
  │ (Vercel Production)    │      │  (Vercel Production)   │
  └───────────┬────────────┘      └───────────┬────────────┘
              │                               │
              │   REST API + JWT Auth        │
              └───────────────┬───────────────┘
                              ▼
               ┌─────────────────────────────┐
               │   FastAPI Headless Engine   │
               │   (Railway Production)      │
               └──────────────┬──────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
           ┌─────────────────┐ ┌─────────────────┐
           │ PostgreSQL DB   │ │   Redis Cache   │
           └─────────────────┘ └─────────────────┘
```

---

## 📚 3D Interactive Documentation Hub

Explore the comprehensive system documentation suite below. Click any card to navigate:

<div align="center">

| 📚 Section | 🛠️ Focus | 🔗 Documentation Link |
| :--- | :--- | :--- |
| 🔑 **Auth API** | JWT Registration, Login, Refresh & Passwords | [Read Auth Specs](docs/api/authentication.md) |
| 👥 **Users API** | Super Admin User Control & Role RBAC | [Read User Specs](docs/api/users.md) |
| 📝 **Blogs API** | Articles, Authors, Categories & Tags | [Read Blog Specs](docs/api/blogs.md) |
| 💼 **Projects API** | Portfolio Showcases & Gallery Uploads | [Read Project Specs](docs/api/projects.md) |
| 📰 **News API** | Press Releases & External Coverage | [Read News Specs](docs/api/news.md) |
| 📊 **Case Studies API** | ROI Metrics, Testimonials & Client Logos | [Read Case Study Specs](docs/api/case_studies.md) |
| 💡 **Insights API** | Market Reports, Whitepapers & Read Time | [Read Insight Specs](docs/api/insights.md) |
| ❤️ **Interactions API** | Likes, Bookmarked Favorites & Comments | [Read Interactions Specs](docs/api/interactions.md) |
| 📁 **Resources API** | Gated File Uploads & Attachment Streams | [Read Resource Specs](docs/api/resources.md) |
| 👁️ **Preview API** | Short-Lived Tokens & Live Iframe Sync | [Read Preview Specs](docs/api/preview.md) |
| 🤖 **AI Assistant API** | OpenRouter Draft Auto-Generation | [Read AI Assistant Specs](docs/api/ai.md) |
| 🪝 **Webhooks API** | Dispatcher & Publish Event Notifications | [Read Webhook Specs](docs/api/webhooks.md) |
| 🛡️ **Admin User Guide** | Complete User Manual for Content Editors | [Read Admin Manual](docs/admin/admin-user-guide.md) |
| 💻 **Developer Guide** | System Architecture, Codebase & Nuxt Plugins | [Read Tech Guide](docs/developer/developer-guide.md) |
| 🚢 **Deployment Guide** | Railway Backend & Vercel Frontend Deployments | [Read Deploy Guide](docs/deployment/deployment-guide.md) |
| 🛡️ **Git & Monitoring** | Git Workflows, Safety Nets & Server Health Scripts | [Read Git & Monitoring Guide](docs/deployment/git_and_monitoring_workflow.md) |
| 🧪 **Regression Report** | Final E2E Staging Testing Sign-off | [Read QA Report](docs/regression_report.md) |

</div>

---

## 📁 Repository Structure

```text
├── app/                        # FastAPI Backend Engine
│   ├── api/v1/                 # Endpoints (auth, blogs, projects, etc.)
│   ├── core/                   # Security, JWT, Config, Permissions
│   ├── db/                     # SQLAlchemy Session & Base Model
│   ├── models/                 # ORM Entities
│   ├── rate_limit/             # Redis-backed rate limiting middleware
│   ├── schemas/                # Pydantic Schemas & Contracts
│   ├── services/               # Business Logic & Storage Drivers
│   └── main.py                 # FastAPI Application Entrypoint
├── admin/                      # React + Vite Admin Dashboard
├── o2geeks-website-v2/         # Nuxt 3 Public Website Consumer
├── docs/                       # Comprehensive System Documentation
│   ├── api/                    # 11 Endpoint Specification Files
│   ├── admin/                  # Content Manager User Guide
│   ├── developer/              # Developer Architecture Guide
│   └── deployment/             # Railway & Vercel Deployment Manual
├── alembic/                    # Database Migrations
├── tests/                      # Pytest Automated Test Suite
└── daily work updates/         # Historical Milestone Progress Logs
```

---

## 🚀 Quick Start (Local Development)

### 1. Backend Setup (FastAPI)
```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Launch FastAPI Dev Server
uvicorn app.main:app --reload --port 8000
```
* **Swagger Interactive Docs**: `http://localhost:8000/docs`
* **ReDoc Documentation**: `http://localhost:8000/redoc`

### 2. Admin Dashboard Setup (React + Vite)
```bash
cd admin
npm install
npm run dev  # Boots at http://localhost:5173
```

### 3. Public Website Setup (Nuxt 3)
```bash
cd o2geeks-website-v2
npm install
npm run dev  # Boots at http://localhost:3000
```

---

## ⚡ Environment Variables Quick Reference

### Website (`o2geeks-website-v2/.env`)
```env
NUXT_PUBLIC_API_BASE=http://localhost:8000/api/v1
NUXT_PUBLIC_ADMIN_ORIGIN=http://localhost:5173
NUXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Admin Dashboard (`admin/.env`)
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_FRONTEND_URL=http://localhost:3000
VITE_TOKEN_STORAGE_KEY=o2g_admin_token
VITE_REFRESH_TOKEN_STORAGE_KEY=o2g_admin_refresh_token
```

### Backend (`app/.env`)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/branding_cms
REDIS_URL=redis://localhost:6379
JWT_SECRET=YOUR_SUPER_SECRET_KEY_MIN_32_CHARS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
STORAGE_PROVIDER=local
```

---

## 🛠️ Automated Testing & Quality Control

Execute the backend integration test suite with `pytest`:
```bash
pytest tests/
```

---

## 📅 Weekly Milestone Logs

For full historical background on the step-by-step development process, explore the consolidated weekly logs:
* [Week 1 (Days 1-3) — Foundation, Data Modeling, API Spec & DB Auth](daily%20work%20updates/week1_complete.md)
* [Week 2 (Days 4-8) — CRUD Operations, RBAC, Interactions & Dual-Provider Storage](daily%20work%20updates/week2_complete.md)
* [Week 3 (Days 9-13) — Rate Limiting, Admin UI Architecture & User Management](daily%20work%20updates/week3_complete.md)
* [Week 4 (Days 14-18) — Previews, AI Auto-Population & Staging Deployment](daily%20work%20updates/week4_complete.md)
* [Week 5 (Days 19-23) — UI Synchronization, Production Bug Fixes & Project Documentation](daily%20work%20updates/week5_complete.md)


---

## 📄 License & Attribution

Copyright © 2026 O2Geeks. All rights reserved. Built with FastAPI, React, and Nuxt 3.
