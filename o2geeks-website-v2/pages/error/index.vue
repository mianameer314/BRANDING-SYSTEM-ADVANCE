<script setup lang="ts">
import { Icon } from "@iconify/vue";
import ErrorImg from "/images/background/404.svg";
/*for Blank Layout*/
definePageMeta({
  layout: "blank",
});
</script>
<template>
  <div class="d-flex justify-center align-center h-screen bg-accent">
    <div class="d-flex flex-column ga-7 align-center">
            <img :src="ErrorImg" alt="" class="error-img" />
      <h2 class="text-h2 text-center text-dark">Oops! Page Not Found</h2>
      <v-btn class="interactive-button" to="/" size="lg" flat>
        <span class="label">Back To Home</span>
        <v-avatar size="45" class="icon bg-white">
          <Icon icon="material-symbols:arrow-outward" height="20" />
        </v-avatar>
      </v-btn>
    </div>
  </div>
</template>
