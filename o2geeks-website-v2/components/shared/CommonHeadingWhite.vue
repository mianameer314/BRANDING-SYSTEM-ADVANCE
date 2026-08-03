<script setup>
const props = defineProps({
  subtitle: String,
  title: String,
});
</script>
<template>
  <div class="d-flex flex-column ga-5">
    <h2 class="text-h2 text-white">{{ title }}</h2>
    <p class="text-subtitle-1 text-white opacity-70">{{ subtitle }}</p>
  </div>
</template>
