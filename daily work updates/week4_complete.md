# Week 4 (Days 14-18): Preview Integration, AI Auto-Population & Staging Deployment

This week focused on building advanced features for the Branding CMS, including secure cross-origin previews, an AI-powered draft generator, and finally deploying the entire stack to a staging environment for end-to-end QA.

---

## ✅ Day 14: Preview Integration & UI Enhancements

### 🎯 Objectives
- Build a secure, cross-origin preview integration connecting the Headless CMS to a future target Branding Website.
- Implement both Live Auto-Sync previews (for active drafts) and Secure Token previews (for saved states).
- Redesign the action buttons on CMS forms to correctly accommodate the new features without overflowing on narrow screens.

### 🛠️ Changes Implemented

#### 1. Secure Preview API
- **Token Generation**: Created `app/api/v1/preview.py` with a secure `POST /generate` endpoint that mints short-lived (30 minute) JWT preview tokens. 
- **Type Segregation**: Assigned `"type": "preview"` to the JWT payload to prevent token substitution attacks (where a preview token might be maliciously passed into an authentication header).
- **Resolution**: Created `GET /{content_type}` endpoint that validates the token and securely retrieves the target record (e.g., Blog, News, Project) without requiring an active user session, enabling safe cross-origin fetching.

#### 2. Live Auto-Sync Preview (Iframe)
- **Component**: Built `<LivePreviewModal />` to open the frontend target URL within an `iframe`.
- **Communication**: Implemented `window.postMessage` to transmit real-time `onChange` state updates across origins, utilizing React Hook Form's `watch()` to ensure instantaneous live synchronization.
- **Cross-Origin Compliance**: Leveraged strict target origin validation using a dedicated `VITE_FRONTEND_URL` environment variable.

#### 3. Secure Tab Preview
- **Implementation**: Mapped the `Secure Preview` button to the `generatePreviewToken` API. Upon token acquisition, it executes `window.open` targeting the frontend's preview route (e.g., `https://frontend.com/preview/blog?token=xxx`).
- **Validation**: Enforced a strict prompt system that detects unsaved changes and enforces a database synchronization (`submit`) prior to generating a token, ensuring the preview reflects the exact database state.

#### 4. UI/UX Redesign (FormActions)
- **Responsive Grouping**: Redesigned `<FormActions />` in the admin panel to gracefully support five interactive buttons (`Delete`, `Live Preview`, `Secure Preview`, `Cancel`, `Update`).
- **Flexbox Adjustments**: Converted the layout to `flex-col` for narrow container contexts. Grouped the preview actions (`Live` and `Secure`) evenly on the top row, while securely locking `Delete` to the left and action buttons (`Cancel`/`Update`) to the right on the bottom row. This completely eradicated layout overflow and text wrapping issues on small viewport resolutions.

### 🧪 Testing & Verification
- **Backend Tests**: Verified invalid tokens, expired tokens, and cross-type JWT attacks correctly trigger `HTTP 401 Unauthorized`.
- **Frontend QA**: Verified the action buttons render correctly across all viewport sizes without breaking the visual boundaries of the sidebar. Verified that dirty states correctly trigger confirmation modals.

---

## ✅ Day 15: AI Draft Auto-Population Module (Production Ready)

### 🎯 Objectives
- Build a production-ready AI Content Assistant module for the Branding CMS to generate structured content drafts directly inside the Admin Dashboard.
- Automatically populate existing CMS forms (Blogs, News, Projects, Insights, Case Studies) with structured content.
- Implement robust rate limiting and strict schema validation for AI generations.

### 🛠️ Changes Implemented

#### 1. Backend AI Service & Integration
- **OpenRouter Integration**: Integrated `OpenRouter` for LLM capabilities (e.g., `google/gemma-3-27b-it`), managed securely via `.env` credentials (`OPENROUTER_API_KEY`, `OPENROUTER_MODEL`).
- **Structured Schema Enforcement**: Built strict Pydantic schemas (e.g., `BlogGeneratedSchema`, `ProjectGeneratedSchema`) that act as `response_format` JSON schemas sent to the LLM to guarantee predictable JSON objects.
- **Dedicated Service Layer**: Created `app/services/ai.py` encapsulating the generation logic and HTTP client handling (`httpx`), including prompt engineering to strictly guide the model's output to match the desired schemas.
- **API Endpoint**: Developed `POST /api/v1/ai/generate` handling generation requests for all 5 content types dynamically.

#### 2. Specialized Rate Limiting
- **Dedicated AI Tier**: Implemented a standalone, stricter rate limiter (`RATE_LIMIT_AI_GENERATE=20/3600`) to protect the expensive AI functionality from abuse without interfering with general CMS actions.
- **Fallback Tolerant**: Engineered to fail open gracefully if Redis is unavailable, while retaining robust logging.

#### 3. Frontend AI Module & State Management
- **Centralized Hook**: Built `useGenerateDraft` in `src/features/ai/hooks.ts` to manage the lifecycle of the AI generation request (loading state, error handling, success payloads).
- **Universal Modal**: Created `<GenerateDraftModal />` - a dynamic, reusable interface for inputting topics and capturing specific requirements, adaptable across all content types.
- **Form Injection (React Hook Form)**: Updated all 5 form pages (e.g., `BlogFormPage.tsx`, `ProjectFormPage.tsx`) to integrate the modal and elegantly map the structured JSON responses into the active form state via `setValue()`, dirtying the fields for unsaved change protection.
- **Hydration Fixes**: Refactored the modal rendering logic to exist completely outside of `<form>` elements, preventing React hydration errors and `DOMException` failures caused by nested `<form>` tags.

### 🧪 Testing & Verification
- **Backend Tests**: Wrote comprehensive pytest coverage (`tests/test_ai.py`) ensuring schema validation, unauthorized access denial, rate limiting triggers, and correct Pydantic serialization.
- **Frontend QA**: Verified the "✨ Generate with AI" button perfectly injects data into the corresponding fields (Title, Content, Excerpt, Category, Tags) without overwriting manual edits elsewhere unless requested. Verified no nested form errors occur.

---

## ✅ Day 16: End-to-End AI Flow Testing
- **Focus**: Testing the AI draft auto-population flow end-to-end to ensure structural integrity and UI responsiveness.
- **Outcome**: 
- Conducted full pipeline validations ensuring the `POST /api/v1/ai/generate` endpoint successfully processes requests and returns data that accurately maps to the Zod schemas on the frontend.
- Verified that all 5 CMS forms successfully ingest the AI payloads without causing state corruption or validation errors on submission.

---

## ✅ Day 17: Staging Environment Deployment
- **Focus**: Deploying the entire ecosystem (Backend + Frontend) to a live staging environment for realistic QA.
- **Outcome**:
- **Backend**: Successfully deployed the containerized FastAPI backend, PostgreSQL database, and Redis instance to **Railway**.
- **Admin Dashboard**: Deployed the Vite + React admin interface to **Vercel**, configuring `vercel.json` for proper SPA client-side routing.
- Linked the environments perfectly via securely managed environment variables (`VITE_API_BASE_URL`, `DATABASE_URL`, `REDIS_URL`, `OPENROUTER_API_KEY`).

---

## ✅ Day 18: Staging QA & Final Verification
- **Focus**: Performing comprehensive Quality Assurance on the staging deployment.
- **Outcome**:
- Fixed environment-specific deployment bugs.
- Verified that all 5 content types (Blogs, News, Projects, Insights, Case Studies) are fully operational in the live environment.
- Confirmed that complex features like Media Uploads (S3), AI Content Generation, and Role-Based Access Control perform perfectly under production-like conditions.
