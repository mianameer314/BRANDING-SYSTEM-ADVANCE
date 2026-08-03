<script setup>
const props = defineProps({
  number: String,
  title: String,
});
</script>
<template>
  <div class="d-flex ga-lg-8 gap-md-6 ga-4 align-center">
    <v-avatar
      size="36"
      color="primary"
      class="text-subtitle-2 font-weight-semibold text-secondary"
      >{{ number }}</v-avatar
    >
    <span class="w-64 border-t border-white opacity-80"></span>
    <v-chip color="white" class="text-subtitle-2 px-4" variant="flat">
      {{ title }}
    </v-chip>
  </div>
</template>
