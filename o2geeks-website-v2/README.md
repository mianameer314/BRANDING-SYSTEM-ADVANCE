# 🚀 O2Geeks Branding Website (Nuxt 3)

This is the frontend consumer website for the O2Geeks Branding System. Built with Nuxt 3 and Vue 3, it dynamically consumes the Headless CMS API to render Blogs, News, Projects, Insights, and Case Studies.

---

## ✨ Features

- **Server-Side Rendering (SSR)**: Optimized for SEO and extremely fast initial page loads.
- **Dynamic Content Mapping**: Every page perfectly maps to the FastAPI backend schema. Case Studies display dynamic metrics and testimonials; Blogs feature authors, categories, and tags; Projects showcase short descriptions and completion dates.
- **Secure/Live Previews**: Fully integrated with the Admin Dashboard's `window.postMessage` iframe bridge. It securely renders real-time unsaved changes (including live Blob image uploads via `URL.createObjectURL`) for a flawless authoring experience.
- **Responsive Layouts**: Features modern CSS grids and intelligent `vue3-carousel` implementations that seamlessly handle variable list lengths without artificial duplication.

---

## 🚀 Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## 🛠️ Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev
```

## 🚢 Production

Build the application for production:

```bash
# npm
npm run build
```

Locally preview production build:

```bash
# npm
npm run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
