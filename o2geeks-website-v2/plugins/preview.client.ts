import { usePreviewState } from '@/composables/usePreviewState';
import { defineNuxtPlugin, useRuntimeConfig } from '#app';

export default defineNuxtPlugin((nuxtApp) => {
  const { previewContent, previewType, previewMode, previewConnected } = usePreviewState();
  const config = useRuntimeConfig();

  let allowedOrigin = '';
  try {
    allowedOrigin = new URL(config.public.adminOrigin as string).origin;
  } catch (e) {
    console.error("[Nuxt Plugin] Invalid adminOrigin configured:", config.public.adminOrigin);
  }

  const handleMessage = (event: MessageEvent) => {
    console.log("[Nuxt Plugin] Message intercepted from origin:", event.origin);

    // 1. Validate Origin (Strictly allow config origin)
    if (event.origin !== allowedOrigin) {
      console.warn("[Nuxt Plugin] Origin rejected. Expected:", allowedOrigin);
      return;
    }

    try {
      const payload = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

      // 2. Validate Payload
      if (!payload || typeof payload !== 'object') {
        console.warn("[Nuxt Plugin] Invalid payload format:", payload);
        return;
      }

      if (payload.type !== 'LIVE_PREVIEW_UPDATE') {
        // Don't log this heavily as we get other messages like PREVIEW_READY or vue devtools
        return;
      }

      if (!payload.content_type || !payload.data) {
        console.warn("[Nuxt Plugin] Missing content_type or data in payload:", payload);
        return;
      }

      console.log("[Nuxt] Received Preview", payload);

      // 3. Update preview store securely
      previewType.value = payload.content_type;
      previewMode.value = 'live';
      previewConnected.value = true;

      // Store partial updates over existing content
      previewContent.value = {
        ...(previewContent.value || {}),
        ...payload.data
      };
    } catch (e) {
      // Ignore random unparseable messages
    }
  };

  window.addEventListener('message', handleMessage);

  // Plugin cleanup
  const originalUnmount = nuxtApp.vueApp.unmount;
  nuxtApp.vueApp.unmount = function () {
    window.removeEventListener('message', handleMessage);
    // @ts-ignore
    originalUnmount.apply(this, arguments);
  };
});
