<script setup lang="ts">
import { useAsyncData } from "#imports";
import { CaseStudyService } from "@/services/case-studies";
import { Icon } from "@iconify/vue";
import ApiErrorState from "@/components/shared/ApiErrorState.vue";

const { data: response, pending, error } = await useAsyncData(
  'case-studies-index',
  () => CaseStudyService.getAll(1, 10)
);

const getPosts = computed(() => response.value?.items || []);
</script>

<template>
  <div class="bg-darkgray">
  <div v-if="pending" class="d-flex justify-center align-center py-16">
    <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
  </div>
  
  <ApiErrorState v-else-if="error" :error="error" />

  <template v-else>
  <SharedSectionSpacer />  
  <div class="container-lg">
    <v-row>
      <v-col cols="12" lg="6" v-for="projects in getPosts" :key="projects.id">
        <div>
          <NuxtLink
            :to="`/case-studies/${projects.slug}`"
            class="project-card"
          >
            <div class="image-wrapper">
              <v-img
                :src="$mediaUrl(projects.cover_image) || '/images/placeholder.jpg'"
                alt="image"
                class="project-image w-100"
                cover
                height="280"

              />
              <div class="image-overlay">
                <v-avatar size="60" class="icon bg-primary">
                  <Icon icon="material-symbols:arrow-outward" height="25" />
                </v-avatar>
              </div>
            </div>
          </NuxtLink>
          <h3 class="text-h3 text-dark py-5">
            {{ projects.title }}
          </h3>
          <div class="d-flex ga-3">
            <v-chip v-if="projects.technologies?.[0]" variant="outlined" class="text-subtitle-2 text-dark">{{
              projects.technologies[0]
            }}</v-chip>
            <v-chip v-if="projects.technologies?.[1]" variant="outlined" class="text-subtitle-2 text-dark">{{
              projects.technologies[1]
            }}</v-chip>
          </div>
        </div>
      </v-col>
    </v-row>
  </div>
  </template>
  <SharedSectionSpacer />
  </div>
</template>
