<script setup lang="ts">
import { useAsyncData } from "#imports";
import { InsightService } from "@/services/insights";
import { Icon } from "@iconify/vue";
import ApiErrorState from "@/components/shared/ApiErrorState.vue";

const { data: response, pending, error } = await useAsyncData(
  'recent-insights',
  () => InsightService.getAll(1, 3)
);

const getPosts = computed(() => response.value?.items || []);
</script>

<template>
  <div v-if="pending" class="d-flex justify-center py-16">
    <v-progress-circular indeterminate color="primary"></v-progress-circular>
  </div>
  
  <ApiErrorState v-else-if="error" :error="error" />

  <v-row v-else>
    <v-col cols="12" lg="6">
      <NuxtLink v-if="getPosts[0]"
        :to="`/insights/${getPosts[0].slug}`"
        class="project-card text-decoration-none"
      >
        <div class="blog-image-wrapper">
          <v-img
            class="blog-image"
            :src="$mediaUrl(getPosts[0].cover_image) || '/images/placeholder.jpg'"
            height="280"
            cover
          ></v-img>
        </div>
        <v-card-text class="px-0 pt-4">
          <div class="text-subtitle-2 text-dark opacity-70">
            {{ new Date(getPosts[0].published_at || getPosts[0].created_at).toLocaleDateString() }}
          </div>
          <h4 class="text-h4 text-dark">
            {{ getPosts[0].title }}
          </h4>
        </v-card-text>
      </NuxtLink>
    </v-col>
    <v-col cols="12" lg="6">
      <v-row>
        <v-col
          cols="12"
          md="6"
          v-for="(blog, index) in getPosts.slice(1, 3)"
          :key="blog.id"
        >
          <NuxtLink
            :to="`/insights/${blog.slug}`"
            class="project-card text-decoration-none"
          >
            <div class="blog-image-wrapper">
              <v-img
                class="blog-image"
                :src="$mediaUrl(blog.cover_image) || '/images/placeholder.jpg'"
                height="280"
                cover
              ></v-img>
            </div>
            <v-card-text class="px-0 pt-4">
              <div class="text-subtitle-2 text-dark opacity-70">
                {{ new Date(blog.published_at || blog.created_at).toLocaleDateString() }}
              </div>
              <h4 class="text-h4 text-dark">
                {{ blog.title }}
              </h4>
            </v-card-text>
          </NuxtLink>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>
