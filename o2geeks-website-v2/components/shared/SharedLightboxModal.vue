<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { Icon } from '@iconify/vue';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    images: string[];
    initialIndex?: number;
    title?: string;
  }>(),
  {
    modelValue: false,
    images: () => [],
    initialIndex: 0,
    title: '',
  }
);

const emit = defineEmits(['update:modelValue', 'change']);

const currentIndex = ref(props.initialIndex);

watch(
  () => props.initialIndex,
  (newIdx) => {
    currentIndex.value = newIdx;
  }
);

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      currentIndex.value = props.initialIndex;
    }
  }
);

const currentImage = computed(() => {
  if (!props.images || props.images.length === 0) return '';
  return props.images[currentIndex.value] || props.images[0] || '';
});

const close = () => {
  emit('update:modelValue', false);
};

const next = () => {
  if (props.images.length <= 1) return;
  currentIndex.value = (currentIndex.value + 1) % props.images.length;
  emit('change', currentIndex.value);
};

const prev = () => {
  if (props.images.length <= 1) return;
  currentIndex.value = (currentIndex.value - 1 + props.images.length) % props.images.length;
  emit('change', currentIndex.value);
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (!props.modelValue) return;
  if (e.key === 'ArrowRight') next();
  if (e.key === 'ArrowLeft') prev();
  if (e.key === 'Escape') close();
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    fullscreen
    transition="dialog-fade-transition"
    class="lightbox-dialog"
  >
    <div class="lightbox-container d-flex flex-column fill-height bg-black-opacity-90 position-relative">
      <!-- Top Bar: Title, Counter & Close -->
      <div class="lightbox-header d-flex align-center justify-space-between px-6 py-4 z-10">
        <div class="d-flex align-center ga-4">
          <span class="text-h6 text-white font-weight-bold" v-if="title">{{ title }}</span>
          <span class="text-subtitle-2 text-primary bg-dark px-3 py-1 rounded-pill" v-if="images.length > 1">
            {{ currentIndex + 1 }} / {{ images.length }}
          </span>
        </div>
        <v-btn icon color="white" variant="text" size="large" @click="close">
          <Icon icon="tabler:x" width="32" height="32" />
        </v-btn>
      </div>

      <!-- Main Image View -->
      <div class="lightbox-body flex-grow-1 d-flex align-center justify-center position-relative px-4 px-md-12">
        <!-- Previous Arrow Button -->
        <v-btn
          v-if="images.length > 1"
          icon
          color="white"
          variant="flat"
          size="x-large"
          class="lightbox-nav-btn prev-btn bg-dark-opacity-70"
          @click.stop="prev"
        >
          <Icon icon="tabler:chevron-left" width="36" height="36" />
        </v-btn>

        <!-- Full Uncropped Image -->
        <div class="lightbox-image-wrapper d-flex align-center justify-center w-100 h-100">
          <v-img
            :src="currentImage"
            class="lightbox-img"
            max-height="85vh"
            max-width="90vw"
            contain
          >
            <template v-slot:placeholder>
              <div class="d-flex align-center justify-center fill-height">
                <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
              </div>
            </template>
          </v-img>
        </div>

        <!-- Next Arrow Button -->
        <v-btn
          v-if="images.length > 1"
          icon
          color="white"
          variant="flat"
          size="x-large"
          class="lightbox-nav-btn next-btn bg-dark-opacity-70"
          @click.stop="next"
        >
          <Icon icon="tabler:chevron-right" width="36" height="36" />
        </v-btn>
      </div>

      <!-- Bottom Thumbnail Indicators if multiple images -->
      <div class="lightbox-footer d-flex justify-center ga-2 py-4 px-6 z-10 overflow-x-auto" v-if="images.length > 1">
        <div
          v-for="(img, idx) in images"
          :key="idx"
          class="thumb-item cursor-pointer border rounded-md overflow-hidden transition-all"
          :class="{ 'border-primary border-opacity-100 scale-105': idx === currentIndex, 'opacity-50': idx !== currentIndex }"
          @click="currentIndex = idx"
        >
          <v-img :src="img" width="60" height="40" cover></v-img>
        </div>
      </div>
    </div>
  </v-dialog>
</template>

<style scoped>
.lightbox-container {
  background-color: rgba(10, 10, 10, 0.95);
  backdrop-filter: blur(12px);
}
.lightbox-header, .lightbox-footer {
  background-color: rgba(0, 0, 0, 0.6);
}
.lightbox-nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 20;
  border-radius: 50%;
}
.prev-btn {
  left: 24px;
}
.next-btn {
  right: 24px;
}
.bg-dark-opacity-70 {
  background-color: rgba(20, 20, 20, 0.7) !important;
}
.bg-dark-opacity-70:hover {
  background-color: rgb(var(--v-theme-primary)) !important;
  color: #000 !important;
}
.thumb-item {
  width: 60px;
  height: 40px;
}
.lightbox-img {
  object-fit: contain !important;
}
</style>
