<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from "vue-router";
import { useAsyncData } from "#imports";
import { NewsService } from "@/services/news";
import AnimatedIcon from "/images/svgs/astrisk-icon.svg";
import ApiErrorState from "@/components/shared/ApiErrorState.vue";
import SharedImage from "@/components/shared/SharedImage.vue";
import { usePreviewState } from '@/composables/usePreviewState';
import { useMarkdown } from '@/composables/useMarkdown';

const route = useRoute();
const slug = route.params.slug as string;

const { previewContent, previewMode, previewType } = usePreviewState();
const { renderMarkdown } = useMarkdown();

const { data: fetchedPost, pending, error } = await useAsyncData(
  `news-${slug}`,
  async () => {
    if (previewMode.value !== 'none' && previewType.value === 'news') {
      return null;
    }
    try {
      return await NewsService.getBySlug(slug);
    } catch (e) {
      return null;
    }
  }
);

const post = computed(() => {
  if (previewMode.value !== 'none' && previewType.value === 'news' && previewContent.value) {
    return {
      ...(fetchedPost.value || {}),
      ...previewContent.value
    };
  }
  return fetchedPost.value;
});
</script>

<template>
  <div v-if="pending" class="d-flex justify-center align-center py-16">
    <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
  </div>
  
  <ApiErrorState v-else-if="error || !post" :error="error" />

  <template v-else>
  <div class="common-banner position-relative">
    <SharedImage :src="post.cover_image" :alt="post.headline" height="380" cover class="w-100" />
    <div class="banner-overlay"></div>
    <div class="container-lg">
      <div class="common-banner-content">
        <div class="mw-575">
          <!-- Top row: icon + paragraph -->
          <div class="d-flex ga-6">
            <img
              :src="AnimatedIcon"
              alt="icon"
              height="44"
              width="44"
              class="icon-rotate"
            />
            <p class="text-white text-subtitle-1 mb-0 opacity-70">
              Latest news, updates, and announcements.
            </p>
          </div>
        </div>
        <!-- Bottom row: title + badge -->
        <div
          class="d-flex flex-md-row flex-column ga-5 align-md-end align-start mt-md-6 mt-3"
        >
          <div>
            <h1 class="text-white text-h2 font-weight-bold mb-0">
              {{ post.headline }}
            </h1>
            <div class="d-flex ga-4 mt-4 align-center" v-if="post.published_at">
              <span class="text-white opacity-70 text-subtitle-2">
                Published {{ new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}
              </span>
            </div>
          </div>
          <SharedBigBadge />
        </div>
      </div>
    </div>
  </div>
  <!-- News Details -->
  <div class="bg-darkgray">
    <SharedSectionSpacer />
    <div class="container-lg">
      <v-row class="d-flex align-center">
        <!-- LEFT SIDE HEADING -->
        <v-col cols="12" lg="4">
          <h2 class="text-h2 text-dark">Announcement</h2>
        </v-col>
        <v-col cols="12" lg="8"></v-col>
        <v-col cols="12" class="mt-lg-16 mt-8" v-if="post.cover_image">
          <div class="pa-4 bg-black rounded-xl overflow-hidden shadow-lg">
            <SharedImage :src="post.cover_image" :alt="post.headline" height="auto" contain class="w-100" />
          </div>
        </v-col>
        <v-col cols="12" lg="4"></v-col>
        <v-col cols="12" lg="8">
          <div
            class="project-desciption markdown-body mt-lg-16 mt-8"
            v-html="renderMarkdown(post.summary || post.content)"
          ></div>
        </v-col>
      </v-row>
      
      <v-row v-if="post.source">
        <v-col cols="12" class="mt-8 pt-8 border-t text-center">
          <v-btn
            :href="post.source"
            target="_blank"
            color="primary"
            variant="flat"
            size="large"
            class="rounded-pill"
          >
            Read Original Source
          </v-btn>
        </v-col>
      </v-row>
    </div>
    <SharedSectionSpacer />
  </div>
  </template>
</template>
