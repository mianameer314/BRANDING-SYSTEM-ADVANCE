<script setup lang="ts">
import Header from "@/layouts/header/index.vue";
import Footer from "@/layouts/footer/index.vue";

</script>
<template>
  <div>
    <Header />
    <main>
      <NuxtPage />
    </main>
    <Footer />
    <SharedPreviewIndicator />
  </div>
</template>
