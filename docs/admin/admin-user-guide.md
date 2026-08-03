# O2Geeks Branding System — Admin User Guide

Welcome to the **O2Geeks Branding System Admin User Guide**. This document provides comprehensive instructions for content managers, editors, and super administrators to publish content, manage media, configure users, and utilize real-time previews.

---

## 1. Introduction & System Requirements

The Admin Dashboard is a modern, single-page application built with React, Vite, and Vuetify styling. It communicates securely with the FastAPI Headless CMS backend via JSON and Multipart API endpoints.

### Supported Browsers
* Google Chrome (v110+) — *Recommended for optimal Live Preview iframe performance*
* Mozilla Firefox (v110+)
* Apple Safari (v16+)
* Microsoft Edge (v110+)

---

## 2. Authentication & Login

### Logging In
1. Navigate to the Admin Dashboard URL (e.g. `https://branding-system-frontend.vercel.app` or `http://localhost:5173`).
2. Enter your registered **Email Address** and **Password**.
3. Click **Sign In**.

### Session Security & JWT Tokens
* **Access Tokens**: Short-lived (30 minutes) access key stored securely in `localStorage`.
* **Refresh Tokens**: Long-lived (7 days) token automatically used by Axios interceptors to silently renew expired sessions without interrupting form edits.
* **Auto-Logout**: If a refresh token expires or your account is deactivated, you will be redirected to `/login` with an informative toast message.

---

## 3. Dashboard Overview

Upon signing in, the dashboard presents:
* **Analytics Header**: Quick stats showing total published articles, drafts, project showcases, and user engagement metrics.
* **Navigation Sidebar**: Direct links to:
  * **Blogs** (`/blogs`)
  * **Projects** (`/projects`)
  * **News** (`/news`)
  * **Case Studies** (`/case-studies`)
  * **Insights** (`/insights`)
  * **User Management** (`/users` — Super Admin only)
* **Quick Actions**: "New Entry" button and AI Assistant trigger.

---

## 4. Managing Content Types

The system manages 5 distinct content types, each tailored to specific layout requirements.

| Content Type | Key Unique Fields | Primary Use Case |
| :--- | :--- | :--- |
| **Blogs** | `author`, `category`, `tags`, `excerpt` | Long-form articles & thought leadership |
| **Projects** | `client`, `technologies`, `project_url`, `gallery`, `completed_at` | Client portfolio items & interactive galleries |
| **News** | `summary`, `source` | Press releases & company announcements |
| **Case Studies** | `challenge`, `solution`, `results`, `metrics`, `testimonial_quote`, `client_logo` | Detailed client success stories with ROI metrics |
| **Insights** | `author`, `category`, `read_time`, `tags` | Data-driven market research & whitepapers |

---

## 5. Uploading Images & Media Requirements

### Image Guidelines

| Asset Type | Supported Formats | Max File Size | Recommended Resolution | Aspect Ratio |
| :--- | :--- | :--- | :--- | :--- |
| **Cover Images** | `.jpg`, `.jpeg`, `.png`, `.webp` | 5 MB | 1920 × 1080 px | 16:9 |
| **Client Logos** | `.png`, `.svg`, `.webp` | 2 MB | 400 × 400 px | 1:1 (Square) |
| **Gallery Uploads** | `.jpg`, `.png`, `.webp` | 5 MB per image | 1920 × 1080 px | Flexible |

### How to Upload
* **Drag-and-Drop**: Drag image files directly onto the drop area in the form.
* **Cover Image**: Single image slot with live thumbnail preview and "Replace Image" button.
* **Gallery Uploads**: Batch selection supported. Reorder or remove individual gallery images before submitting.

---

## 6. Attaching Downloadable Resources

Content items (Blogs & Insights) can include downloadable assets (PDF whitepapers, technical documents):
1. Scroll to the **Resources Attachment** section in the form.
2. Click **Upload New Resource**.
3. Set **Title**, **Description**, and toggle **Gated Resource** (if enabled, visitors must log in to download).
4. Save the resource. It will automatically attach to your active content draft.

---

## 7. Publishing & Status Workflows

Content items support three status states:
1. **Draft**: Saved in the database, visible only to logged-in editors/admins. Excluded from public website API lists.
2. **Published**: Live on the public website. Requires `publish` permission (`admin` or `super_admin`).
3. **Archived**: Hidden from website lists but preserved for historical record.

---

## 8. Preview System (Live & Secure)

### A. Real-Time Live Preview (Iframe Bridge)
While editing a draft in the Admin Dashboard, click **Live Preview**:
* A split-screen or modal iframe slides in, loading the Nuxt website's `/preview/live` route.
* **Instant Auto-Sync**: As you type in form fields or select new images, form state is sent via a secure `postMessage` protocol directly to the iframe.
* **Image Base64/Blob Hot-Swapping**: Unsaved local file selections immediately update in the iframe preview before hitting the database.

### B. Secure Token Preview
To share an unreleased draft with an external stakeholder:
1. Click **Share Secure Preview** on any draft post.
2. The system generates a 15-minute, cryptographically signed preview link (e.g. `https://o2geeks-website-v2-black.vercel.app/preview/blogs?token=eyJ...`).
3. Recipients can view the exact draft layout without needing an admin account.

---

## 9. Managing Users (Super Admin Only)

Super Administrators can manage team accounts under `/users`:
* **Create User**: Assign email, initial password, full name, and role (`super_admin`, `admin`, `editor`, `user`).
* **Update Role**: Demote or promote accounts.
* **Deactivate Account**: Soft-delete a user. Deactivated users are immediately barred from logging in or refreshing tokens.
* *Note: Self-deactivation is strictly prevented by system validation.*

---

## 10. Troubleshooting & FAQ

### Common Error Codes

* **`401 Unauthorized`**: Session expired. Re-authenticate at `/login`.
* **`403 Forbidden`**: Insufficient permissions. (e.g. Editors attempting to set status to `published` without Admin approval).
* **`413 Payload Too Large`**: Upload file exceeds 5MB (image) or 20MB (resource). Resize file before uploading.
* **`422 Unprocessable Entity`**: Form validation error. Check required red-highlighted fields.
* **`429 Too Many Requests`**: Rate limit exceeded. Wait 60 seconds before retrying.

### FAQ
* **Q: Why is Live Preview showing "Waiting for connection..."?**
  * *A: Ensure Nuxt website URL and Admin URL environment variables (`NUXT_PUBLIC_ADMIN_ORIGIN` and `VITE_FRONTEND_URL`) match your deployment domain exactly.*
* **Q: Can I restore a deleted article?**
  * *A: Deletions are permanent and automatically purge associated image files from disk/S3. Use `archived` status instead if you plan to restore content later.*
