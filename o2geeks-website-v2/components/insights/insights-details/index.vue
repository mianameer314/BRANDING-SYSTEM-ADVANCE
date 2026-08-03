<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from "vue-router";
import { useAsyncData } from "#imports";
import { InsightService } from "@/services/insights";
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
  `insight-${slug}`,
  async () => {
    if (previewMode.value !== 'none' && previewType.value === 'insight') {
      return null;
    }
    try {
      return await InsightService.getBySlug(slug);
    } catch (e) {
      return null;
    }
  }
);

const post = computed(() => {
  if (previewMode.value !== 'none' && previewType.value === 'insight' && previewContent.value) {
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
    <SharedImage :src="post.cover_image" :alt="post.title" height="380" cover class="w-100" />
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
            <p class="text-white text-subtitle-1 mb-0 opacity-70" v-if="post.excerpt">
              {{ post.excerpt }}
            </p>
            <p class="text-white text-subtitle-1 mb-0 opacity-70" v-else>
              Market research, trends, and strategic insights.
            </p>
          </div>
        </div>
        <!-- Bottom row: title + badge -->
        <div
          class="d-flex flex-md-row flex-column ga-5 align-md-end align-start mt-md-6 mt-3"
        >
          <div>
            <h1 class="text-white text-h2 font-weight-bold mb-0">
              {{ post.title }}
            </h1>
            <div class="d-flex ga-4 mt-4 align-center flex-wrap">
              <v-chip color="primary" variant="flat" size="small" v-if="post.category">{{ post.category }}</v-chip>
              <span class="text-white opacity-70 text-subtitle-2" v-if="post.author">By {{ post.author }}</span>
              <span class="text-white opacity-50 text-subtitle-2" v-if="post.read_time">• {{ post.read_time }}</span>
            </div>
          </div>
          <SharedBigBadge />
        </div>
      </div>
    </div>
  </div>
  <!-- Insight Details -->
  <div class="bg-darkgray">
    <SharedSectionSpacer />
    <div class="container-lg">
      <v-row class="d-flex align-center">
        <!-- LEFT SIDE HEADING -->
        <v-col cols="12" lg="4">
          <h2 class="text-h2 text-dark">Scroll to read</h2>
        </v-col>
        <v-col cols="12" lg="8">
          <p class="text-dark text-subtitle-1 opacity-70" v-if="post.excerpt">
            {{ post.excerpt }}
          </p>
        </v-col>
        <v-col cols="12" class="mt-lg-16 mt-8" v-if="post.cover_image">
          <div class="pa-4 bg-black rounded-xl overflow-hidden shadow-lg">
            <SharedImage :src="post.cover_image" :alt="post.title" height="auto" contain class="w-100" />
          </div>
        </v-col>
        <v-col cols="12" lg="4"></v-col>
        <v-col cols="12" lg="8">
          <div
            class="project-desciption markdown-body mt-lg-16 mt-8"
            v-html="renderMarkdown(post.content)"
          ></div>
        </v-col>
      </v-row>
      
      <v-row v-if="post.tags">
        <v-col cols="12" class="mt-8 pt-8 border-t">
          <div class="d-flex align-center ga-2 flex-wrap">
            <span class="text-subtitle-2 text-dark opacity-70 mr-2">Tags:</span>
            <v-chip
              v-for="(tag, index) in (Array.isArray(post.tags) ? post.tags : post.tags.split(','))"
              :key="index"
              color="dark"
              variant="outlined"
              size="small"
            >
              {{ tag.trim() }}
            </v-chip>
          </div>
        </v-col>
      </v-row>
    </div>
    <SharedSectionSpacer />
  </div>
  </template>
</template>
