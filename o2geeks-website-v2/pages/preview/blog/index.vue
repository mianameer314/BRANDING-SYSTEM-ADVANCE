<script setup lang="ts">
import { useRoute } from 'vue-router';
import { usePreviewState } from '@/composables/usePreviewState';
import { PreviewService } from '@/services/preview';
import { ref, onMounted } from 'vue';
import SharedPreviewOverlay from '@/components/shared/PreviewOverlay.vue';
import BlogsBlogDetails from '@/components/blogs/blog-details/index.vue';

const route = useRoute();
const { previewContent, previewType, previewMode, previewError, previewConnected } = usePreviewState();

const token = route.query.token as string;

const loading = ref(true);

onMounted(async () => {
  if (!token || token === 'undefined') {
    previewError.value = 'invalid';
    loading.value = false;
    return;
  }
  
  previewType.value = 'blog';
  previewMode.value = 'token';
  previewConnected.value = false;
  
  const { data, error } = await PreviewService.resolvePreview('blog', token);
  
  if (error) {
    previewError.value = error;
  } else if (data) {
    previewContent.value = (data as any).content;
    previewConnected.value = true;
    previewError.value = null;
  }
  
  loading.value = false;
});
</script>

<template>
  <div>
    <SharedPreviewOverlay v-if="loading || previewError" :loading="loading" :error="previewError" />
    <BlogsBlogDetails v-else />
  </div>
</template>
