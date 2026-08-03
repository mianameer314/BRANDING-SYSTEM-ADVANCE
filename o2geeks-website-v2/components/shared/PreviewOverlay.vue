<template>
  <div class="preview-overlay bg-darkgray d-flex justify-center align-center h-100vh">
    <div v-if="loading" class="d-flex flex-column align-center ga-4">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      <h3 class="text-h4 text-dark">Initializing Token Preview...</h3>
    </div>
    <div v-else-if="error" class="d-flex flex-column align-center ga-4 text-center">
      <v-icon size="64" :color="errorColor">{{ errorIcon }}</v-icon>
      <h2 class="text-h2 text-dark">{{ errorTitle }}</h2>
      <p class="text-subtitle-1 text-dark opacity-70">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PreviewErrorState } from '@/types/preview';

const props = defineProps<{
  loading: boolean;
  error: PreviewErrorState;
}>();

const errorTitle = computed(() => {
  switch (props.error) {
    case 'expired': return 'Preview Expired';
    case 'invalid': return 'Invalid Token';
    case 'unauthorized': return 'Unauthorized';
    case 'deleted': return 'Draft Deleted';
    case 'offline': return 'Backend Offline';
    default: return 'Preview Error';
  }
});

const errorMessage = computed(() => {
  switch (props.error) {
    case 'expired': return 'This preview token or live session has expired. Please regenerate a new link from the CMS.';
    case 'invalid': return 'The provided preview token is invalid or malformed.';
    case 'unauthorized': return 'You do not have permission to view this preview.';
    case 'deleted': return 'The draft associated with this preview could not be found. It may have been deleted.';
    case 'offline': return 'Could not connect to the CMS backend. Please ensure the server is running.';
    default: return 'An unexpected network error occurred while establishing the preview session.';
  }
});

const errorIcon = computed(() => {
  switch (props.error) {
    case 'expired': return 'mdi-clock-alert-outline';
    case 'invalid': return 'mdi-key-remove';
    case 'unauthorized': return 'mdi-shield-lock-outline';
    case 'deleted': return 'mdi-file-hidden';
    case 'offline': return 'mdi-lan-disconnect';
    default: return 'mdi-alert-circle-outline';
  }
});

const errorColor = computed(() => {
  return props.error === 'offline' ? 'warning' : 'error';
});
</script>

<style scoped>
.preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
}
</style>
