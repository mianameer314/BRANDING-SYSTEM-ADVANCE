<script setup lang="ts">
import { useAsyncData } from "#imports";
import { NewsService } from "@/services/news";
import { Icon } from "@iconify/vue";
import ApiErrorState from "@/components/shared/ApiErrorState.vue";

const { data: response, pending, error } = await useAsyncData(
  'news-list',
  () => NewsService.getAll(1, 10)
);

const getPosts = computed(() => response.value?.items || []);

// Slug function not needed since backend provides the slug, 
// but keeping just in case for fallback
const slugify = (title?: string) => {
  if (!title) return "";
  return title
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");
};
</script>

<template>
  <div v-if="pending" class="d-flex justify-center align-center py-16">
    <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
  </div>
  
  <ApiErrorState v-else-if="error" :error="error" />

  <template v-else>
  <div class="bg-darkgray">
    <SharedSectionSpacer />
    <div class="container-lg">
      <v-row>
        <v-col cols="12" md="6" v-for="blog in getPosts" :key="blog.id">
          <NuxtLink
            :to="`/news/${blog.slug}`"
            class="project-card"
          >
            <div class="blog-image-wrapper">
              <v-img
                class="blog-image"
                :src="$mediaUrl(blog.cover_image) || '/images/placeholder.jpg'"
                height="280"
                cover
              ></v-img>
            </div>
          </NuxtLink>
          <v-card-text class="px-0 pt-4">
            <div class="text-subtitle-2 text-dark opacity-70">
              {{ new Date(blog.published_at || blog.created_at).toLocaleDateString() }}
            </div>
            <h4 class="text-h4 text-dark">
              {{ blog.headline }}
            </h4>
          </v-card-text>
        </v-col>
      </v-row>
    </div>
    <SharedSectionSpacer />
  </div>
  </template>
</template>
