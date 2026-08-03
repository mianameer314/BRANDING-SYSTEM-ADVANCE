<script setup lang="ts">
import { ref, computed } from 'vue';
import { useNuxtApp } from '#app';
import SharedLightboxModal from './SharedLightboxModal.vue';

const props = withDefaults(
  defineProps<{
    src?: string | null;
    alt?: string;
    height?: string | number;
    cover?: boolean;
    contain?: boolean;
    aspectRatio?: string | number;
    customClass?: string;
    clickable?: boolean;
    gallery?: string[];
    galleryIndex?: number;
    title?: string;
  }>(),
  {
    src: '',
    alt: 'Image',
    height: 'auto',
    cover: true,
    contain: false,
    customClass: '',
    clickable: true,
    gallery: () => [],
    galleryIndex: 0,
    title: '',
  }
);

const { $mediaUrl } = useNuxtApp();
const hasError = ref(false);
const showLightbox = ref(false);

const computedSrc = computed(() => {
  if (hasError.value || !props.src) {
    return '';
  }
  return $mediaUrl(props.src);
});

const activeGallery = computed(() => {
  if (props.gallery && props.gallery.length > 0) {
    return props.gallery.map(img => $mediaUrl(img));
  }
  return computedSrc.value ? [computedSrc.value] : [];
});

const onError = () => {
  hasError.value = true;
};

const handleImageClick = () => {
  if (props.clickable && computedSrc.value) {
    showLightbox.value = true;
  }
};
</script>

<template>
  <div
    v-if="!computedSrc || hasError"
    class="shared-image-placeholder d-flex flex-column align-center justify-center bg-darkgray border rounded-lg w-100 position-relative overflow-hidden"
    :style="{ height: typeof height === 'number' ? `${height}px` : height }"
  >
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-white opacity-40">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <circle cx="8.5" cy="8.5" r="1.5"></circle>
      <polyline points="21 15 16 10 5 21"></polyline>
    </svg>
    <span class="text-caption text-white opacity-40 mt-2">{{ alt }}</span>
  </div>

  <div v-else class="shared-image-wrapper position-relative overflow-hidden w-100 h-100" :class="{ 'cursor-pointer': clickable }">
    <v-img
      :src="computedSrc"
      :alt="alt"
      :height="height"
      :cover="contain ? false : cover"
      :aspect-ratio="aspectRatio"
      :class="[customClass, { 'img-contain': contain }]"
      @error="onError"
      @click="handleImageClick"
    >
      <template v-slot:placeholder>
        <div class="d-flex align-center justify-center fill-height bg-darkgray">
          <v-progress-circular indeterminate color="primary" size="32"></v-progress-circular>
        </div>
      </template>
    </v-img>

    <!-- Shared Lightbox Modal -->
    <SharedLightboxModal
      v-if="clickable"
      v-model="showLightbox"
      :images="activeGallery"
      :initial-index="galleryIndex"
      :title="title || alt"
    />
  </div>
</template>

<style scoped>
.shared-image-placeholder {
  min-height: 180px;
}
.shared-image-wrapper.cursor-pointer:hover {
  opacity: 0.95;
}
:deep(.img-contain img) {
  object-fit: contain !important;
}
</style>
