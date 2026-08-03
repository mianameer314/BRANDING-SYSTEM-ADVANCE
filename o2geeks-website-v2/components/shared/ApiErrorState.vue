<script setup lang="ts">
import { Icon } from "@iconify/vue";
import type { NuxtError } from "#app";

const props = defineProps({
  error: {
    type: Object as () => NuxtError | Error | null | any,
    required: true,
  },
});
</script>

<template>
  <div class="d-flex flex-column align-center justify-center py-16 text-center">
    <v-avatar size="80" class="mb-4 bg-error text-white">
      <Icon icon="mdi:alert-circle-outline" height="40" />
    </v-avatar>
    <h2 class="text-h2 mb-2 text-dark">
      {{ error?.statusCode === 404 ? 'Content Not Found' : 'Something went wrong' }}
    </h2>
    <p class="text-subtitle-1 text-dark opacity-70 mb-6 max-w-sm">
      {{ error?.message || 'We could not load the requested content. Please try again later.' }}
    </p>
    <v-btn to="/" color="primary" class="interactive-button" size="large">
      <span class="label">Go Back Home</span>
    </v-btn>
  </div>
</template>
