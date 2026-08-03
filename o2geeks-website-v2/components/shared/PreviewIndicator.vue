<template>
  <div v-if="previewMode !== 'none'" :class="['preview-indicator', previewMode, { 'error': previewError }]">
    <div class="d-flex align-center ga-2">
      <v-progress-circular v-if="previewMode === 'live' && !previewError && previewConnected" indeterminate color="white" size="16" width="2"></v-progress-circular>
      <v-icon v-else-if="previewError" size="18" color="white">mdi-alert-circle</v-icon>
      <v-icon v-else-if="previewMode === 'token'" size="18" color="white">mdi-eye-check-outline</v-icon>
      
      <span>{{ labelText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePreviewState } from '@/composables/usePreviewState';

const { previewMode, previewError, previewConnected } = usePreviewState();

const labelText = computed(() => {
  if (previewError.value) return 'Preview Disconnected';
  if (previewMode.value === 'live') {
    return previewConnected.value ? 'Live Preview Active' : 'Connecting Live Preview...';
  }
  if (previewMode.value === 'token') {
    return 'Token Preview Active';
  }
  return '';
});
</script>

<style scoped>
.preview-indicator {
  position: fixed;
  bottom: 20px;
  right: 20px;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 14px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  z-index: 9999;
  pointer-events: none;
  transition: all 0.3s ease;
}

.preview-indicator.live {
  background-color: #ff3b3b;
}

.preview-indicator.token {
  background-color: #3b82f6;
}

.preview-indicator.error {
  background-color: #ef4444;
  opacity: 0.8;
}
</style>
