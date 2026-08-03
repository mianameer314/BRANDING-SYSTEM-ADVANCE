# 🚀 O2Geeks Admin Dashboard

This is the frontend Admin Dashboard for the O2Geeks Branding System Headless CMS. It is a single-page application built with modern web technologies and designed with a premium, dark-mode SaaS aesthetic. It provides a secure, fully featured interface for managing enterprise content.

---

## 🛠️ Technology Stack
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strictly typed against the live backend OpenAPI schema)
- **Styling**: [TailwindCSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Data Fetching**: [TanStack React Query](https://tanstack.com/query/latest) + [Axios](https://axios-http.com/)
- **Form Management**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Routing**: [React Router v7](https://reactrouter.com/)

---

## ✨ Key Features

1. **Complete CRUD Capabilities**: Fully operational interfaces to Create, Read, Update, and Delete content across all domains (Blogs, News, Projects, Insights, Case Studies).
2. **Advanced Media Management**: 
   - Drag-and-drop file uploads for cover images and client logos (`ImageUploadField`).
   - Dynamic gallery arrays supporting real-time addition and removal without data loss or duplication (`GalleryUploadField`).
3. **Data Integrity & Validation**: Strict Zod schemas validate all inputs before submission, ensuring complete synchronization with the FastAPI backend.
4. **Role-Based Access Control (RBAC)**: Secure routing (`PermissionRoute`) and UI conditionals (`PermissionGuard`) ensure that action buttons and navigation are perfectly synchronized with backend permission arrays. Includes full User Management and role assignment capabilities.
5. **Smart Form States**: The UI accurately tracks dirty states (including complex media additions/removals) to prevent accidental data loss and optimize API requests.
6. **Dashboard Analytics**: A high-level overview featuring real-time statistics across all content types.
7. **Server-Side Search & Filtering**: Robust URL-synchronized state management for search, filtering, and sorting ensures all UI list views can be bookmarked, refreshed, or shared without losing user configuration.
8. **Resource Attachments**: Advanced queueing system allows administrators to attach and securely upload multiple downloadable resources asynchronously, protected by `Promise.allSettled` error boundaries.
9. **Internal QA Tested**: Comprehensive end-to-end QA testing ensures all CRUD workflows perform flawlessly, validating Week 3 deliverables.
10. **Preview Integration**: Built a robust Preview API generating secure JWT tokens for cross-origin preview functionality. Added real-time Iframe `window.postMessage` live-preview capabilities directly into all CMS form editors, with a fully responsive layout.
11. **Live Preview Cross-Origin Optimization**: Engineered Blob-based file transfers over the `window.postMessage` bridge for instantaneous, cross-origin image rendering during Live Previews.
12. **AI Draft Auto-Population**: Fully integrated a production-ready AI Content Assistant module. It dynamically generates structured draft content using OpenRouter, securely parsing strictly-typed JSON schemas via Zod, and elegantly populates form fields across Blogs, News, Projects, Insights, and Case Studies.

---

## 📂 Architecture & Folder Structure

The project utilizes a highly scalable **Feature-Based Architecture**. Instead of grouping files by type, files are grouped by the business domain they belong to.

```text
src/
├── api/             # Global Axios instance and base configurations
├── components/      # Shared UI components (Sidebar, Topbar, Forms, Modals)
├── config/          # Environment variable validation (env.ts)
├── features/        # The core modules
│   ├── auth/        # Login, AuthProvider, Route guards
│   ├── dashboard/   # High-level statistics overview
│   └── blogs/       # Example Domain Module
│       ├── api.ts       # Axios fetch requests for blogs
│       ├── hooks.ts     # React Query hooks (useBlogs, useCreateBlog)
│       ├── schemas.ts   # Zod validation schemas
│       ├── types.ts     # TypeScript interfaces (BlogOut)
│       ├── BlogsPage.tsx# The main Data Table list view
│       └── BlogFormPage.tsx # The complex Create/Update Form UI
├── lib/             # Utilities (Tailwind merge, Media path resolution, FormData parsing)
├── providers/       # Global React Context providers (QueryClientProvider)
└── router/          # Client-side routing maps
```

### Why this architecture?
- **Screaming Architecture**: When you look at `src/features/`, you immediately know what this app does.
- **Maintainability**: If you need to change how Blogs work, you only touch `src/features/blogs/`.
- **Zero-Hardcoding**: Environment variables are strictly validated on boot in `src/config/env.ts`.
- **Decoupled API**: Axios interceptors automatically inject JWT tokens and handle 401 redirects, keeping the feature logic clean.

---

## 🏗️ Complex Form Handling (`multipart/form-data`)

Because the CMS supports rich media uploads directly alongside textual data, standard JSON submissions are insufficient. 

1. **`buildFormData` Utility**: This custom utility automatically recursively converts nested JSON objects, arrays (like Case Study `metrics`), and File objects into native browser `FormData` structures.
2. **State Synchronization**: Media states that cannot be tracked natively by React Hook Form (such as `removed_cover_image` flags or retained gallery URLs) are managed via React `useState` and merged dynamically on submission.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or 20+
- npm or pnpm

### 1. Installation
```bash
npm install
```

### 2. Environment Variables
Copy the example environment file and configure your backend URL.
```bash
cp .env.example .env
```
Ensure `VITE_API_BASE_URL` points to your live (or local) backend without a trailing slash (e.g., `http://localhost:8000/api/v1`).

### 3. Start Development Server
```bash
npm run dev
```
Navigate to `http://localhost:5173`.

### 4. Type Checking
Verify there are no TypeScript errors:
```bash
npm run build
```

---

## 🚢 Production Deployment (Vercel)

This application is fully optimized for zero-config deployment on **Vercel**.

1. **Build Command**: Vercel automatically detects Vite and will run `npm run build` (which compiles TypeScript and generates the static `/dist` bundle).
2. **Environment Variables**: You must supply `VITE_API_BASE_URL` in your Vercel Project Settings prior to deployment.
3. **Client-Side Routing**: The repository includes a `vercel.json` file at the root of the `admin` folder:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```
   This ensures that deep links (e.g., `/case-studies/create`) correctly fall back to the React Router SPA rather than throwing 404 Not Found errors on the CDN.
