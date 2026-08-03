<script setup lang="ts">
import { useRoute } from 'vue-router';
import { usePreviewState } from '@/composables/usePreviewState';
import { PreviewService } from '@/services/preview';
import { ref, onMounted } from 'vue';
import SharedPreviewOverlay from '@/components/shared/PreviewOverlay.vue';
import CaseStudiesCaseStudiesDetails from '@/components/case-studies/case-studies-details/index.vue';

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
  
  previewType.value = 'case_study';
  previewMode.value = 'token';
  previewConnected.value = false;
  
  const { data, error } = await PreviewService.resolvePreview('case_study', token);
  
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
    <CaseStudiesCaseStudiesDetails v-else />
  </div>
</template>
