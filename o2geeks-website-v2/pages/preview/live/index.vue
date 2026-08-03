<script setup lang="ts">
import { usePreviewState } from '@/composables/usePreviewState';
import { onMounted } from 'vue';
import { useRuntimeConfig } from '#app';
import SharedPreviewOverlay from '@/components/shared/PreviewOverlay.vue';
import BlogsBlogDetails from '@/components/blogs/blog-details/index.vue';
import NewsNewsDetails from '@/components/news/news-details/index.vue';
import ProjectsProjectDetails from '@/components/projects/project-details/index.vue';
import InsightsInsightsDetails from '@/components/insights/insights-details/index.vue';
import CaseStudiesCaseStudiesDetails from '@/components/case-studies/case-studies-details/index.vue';

const { previewType, previewMode, previewConnected } = usePreviewState();
const config = useRuntimeConfig();

onMounted(() => {
  // Handshake Step 1: Tell React Admin the iframe is fully loaded and ready
  // Use polling to solve the race condition where React's useEffect hasn't attached yet
  if (window.parent && window.parent !== window) {
    try {
      const adminOrigin = new URL(config.public.adminOrigin as string).origin;
      const interval = setInterval(() => {
        if (previewConnected.value) {
          clearInterval(interval);
          return;
        }
        console.log("[Nuxt] Sending PREVIEW_READY to parent:", adminOrigin);
        window.parent.postMessage({ type: 'PREVIEW_READY' }, adminOrigin);
      }, 500);
    } catch (e) {
      console.error("[Nuxt] Cannot send PREVIEW_READY due to invalid adminOrigin:", config.public.adminOrigin);
    }
  }
});
</script>

<template>
  <div>
    <!-- Show overlay while waiting for initial postMessage from parent iframe -->
    <SharedPreviewOverlay 
      v-if="!previewConnected || previewMode !== 'live'" 
      :loading="true" 
      :error="null" 
    />
    
    <!-- Render the appropriate component based on the Live Preview type -->
    <template v-else>
      <BlogsBlogDetails v-if="previewType === 'blog'" />
      <NewsNewsDetails v-else-if="previewType === 'news'" />
      <ProjectsProjectDetails v-else-if="previewType === 'project'" />
      <InsightsInsightsDetails v-else-if="previewType === 'insight'" />
      <CaseStudiesCaseStudiesDetails v-else-if="previewType === 'case_study'" />
      <SharedPreviewOverlay v-else :loading="false" error="invalid" />
    </template>
  </div>
</template>
