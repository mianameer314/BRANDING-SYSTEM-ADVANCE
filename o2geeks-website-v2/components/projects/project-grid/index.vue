<script setup lang="ts">
import { useAsyncData } from "#imports";
import { ProjectService } from "@/services/projects";
import { Icon } from "@iconify/vue";
import { Carousel, Slide } from "vue3-carousel";
import { Pagination as CarouselPagination } from "vue3-carousel";
import type { CarouselConfig } from "vue3-carousel";
import ApiErrorState from "@/components/shared/ApiErrorState.vue";

const sliderSettings: Partial<CarouselConfig> = {
  snapAlign: "start",
  itemsToShow: 4,
  wrapAround: true,
  autoplay: 1000,
  pauseAutoplayOnHover: true,
  breakpoints: {
    1800: { itemsToShow: 4, snapAlign: "start" },
    1600: { itemsToShow: 3, snapAlign: "start" },
    1368: { itemsToShow: 3, snapAlign: "start" },
    1024: { itemsToShow: 2, snapAlign: "center" },
    768: { itemsToShow: 2, snapAlign: "center" },
    300: { itemsToShow: 1, snapAlign: "center" },
  },
};

const { data: response, pending, error } = await useAsyncData(
  'projects-list',
  () => ProjectService.getAll(1, 10)
);

const getPosts = computed(() => response.value?.items || []);
</script>

<template>
  <div v-if="pending" class="d-flex justify-center align-center py-16">
    <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
  </div>
  
  <ApiErrorState v-else-if="error" :error="error" />

  <div v-else>
    <carousel
      class="overflow-hidden"
      :snapAlign="sliderSettings.snapAlign"
      :itemsToShow="sliderSettings.itemsToShow"
      :wrapAround="getPosts.length > 4 ? sliderSettings.wrapAround : false"
      :breakpoints="sliderSettings.breakpoints"
      :autoplay="sliderSettings.autoplay"
      :pauseAutoplayOnHover="sliderSettings.pauseAutoplayOnHover"
      :mouse-drag="false" 
    >
      <slide v-for="projects in getPosts" :key="projects.id">
        <div>
          <NuxtLink
            :to="`/projects/${projects.slug}`"
            class="project-card"
          >
            <div class="image-wrapper lh-0">
              <img
                :src="$mediaUrl(projects.cover_image) || '/images/placeholder.jpg'"
                alt="image"
                class="project-image w-100"
                cover
              />
              <div class="image-overlay">
                <v-avatar size="60" class="icon bg-primary">
                  <Icon icon="material-symbols:arrow-outward" height="25" />
                </v-avatar>
              </div>
            </div>
          </NuxtLink>
          <h3 class="text-h3 text-dark py-5">
            {{ projects.name }}
          </h3>
          <div class="d-flex ga-3">
            <template v-for="(tech, idx) in (projects.technologies || []).slice(0, 2)" :key="idx">
              <v-chip variant="outlined" class="text-subtitle-2 text-dark">{{ tech.trim() }}</v-chip>
            </template>
          </div>
        </div>
      </slide>
      <template #addons>
        <CarouselPagination />
      </template>
    </carousel>
  </div>
</template>
