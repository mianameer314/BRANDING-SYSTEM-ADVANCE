<script setup lang="ts">
import { Icon } from "@iconify/vue";
import Bg from "/images/background/feature-img.jpg";
const items = [
  {
    title: "Branding",
  },
  {
    title: "Web development",
  },
  {
    title: "Agency",
  },
  {
    title: "Content creation",
  },
  {
    title: "SaaS",
  },
  {
    title: "Motion & 3d modeling",
  },
  {
    title: "Photography",
  },
  {
    title: "Branding",
  },
  {
    title: "Web development",
  },
  {
    title: "Agency",
  },
  {
    title: "Content creation",
  },
  {
    title: "SaaS",
  },
  {
    title: "Motion & 3d modeling",
  },
  {
    title: "Photography",
  },
  {
    title: "Branding",
  },
  {
    title: "Web development",
  },
  {
    title: "Agency",
  },
  {
    title: "Content creation",
  },
  {
    title: "SaaS",
  },
  {
    title: "Motion & 3d modeling",
  },
  {
    title: "Photography",
  },
  {
    title: "Branding",
  },
  {
    title: "Web development",
  },
  {
    title: "Agency",
  },
  {
    title: "Content creation",
  },
  {
    title: "SaaS",
  },
  {
    title: "Motion & 3d modeling",
  },
  {
    title: "Photography",
  },
];
</script>
<template>
  <div class="lh-0">
    <img :src="Bg" class="w-100" />
  </div>
  <div
    class="marquee w-100 d-flex align-items-center overflow-hidden bg-primary py-6"
  >
    <div class="marquee-content d-flex align-items-center ga-8">
      <div
        class="d-flex align-center ga-8 flex-shrink-0"
        v-for="(item, index) in items"
        :key="index"
      >
        <h4 class="text-h4 text-secondary">{{ item.title }}</h4>
        <Icon
          icon="ci:dot-05-xl"
          class="text-secondary opacity-20"
          height="22"
        />
      </div>
    </div>
  </div>
</template>
