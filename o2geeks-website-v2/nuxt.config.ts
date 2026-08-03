

import { createResolver } from "@nuxt/kit";
import vuetify from "vite-plugin-vuetify";

const { resolve } = createResolver(import.meta.url);

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  
  ssr: false,
  devtools: { enabled: false },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE,
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL,
      adminOrigin: process.env.NUXT_PUBLIC_ADMIN_ORIGIN
    }
  },

  typescript: {
    shim: false,
  },
  
  

  // Vuetify build configuration
  build: {
    transpile: ["vuetify"],
  },

  modules: ["@pinia/nuxt"],

  app: {
    head: {
      title: "O2Geeks",
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    },
  },

  nitro: {
    serveStatic: true,
  },

  devServerHandlers: [],
  compatibilityDate: '2025-05-15',
});
