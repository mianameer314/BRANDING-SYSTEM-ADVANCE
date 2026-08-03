<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { useRoute } from "vue-router";
import { useAsyncData, computed } from "#imports";
import { CaseStudyService } from "@/services/case-studies";
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
  `case_study-${slug}`,
  async () => {
    if (previewMode.value !== 'none' && previewType.value === 'case_study') {
      return null;
    }
    try {
      return await CaseStudyService.getBySlug(slug);
    } catch (e) {
      return null;
    }
  }
);

const post = computed(() => {
  if (previewMode.value !== 'none' && previewType.value === 'case_study' && previewContent.value) {
    return {
      ...(fetchedPost.value || {}),
      ...previewContent.value
    };
  }
  return fetchedPost.value;
});

const allImages = computed(() => {
  if (!post.value) return [];
  const list = [post.value.cover_image, post.value.client_logo, ...(post.value.gallery || [])];
  return list.filter(Boolean) as string[];
});
</script>

<template>
  <div v-if="pending" class="d-flex justify-center align-center py-16">
    <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
  </div>
  
  <ApiErrorState v-else-if="error || !post" :error="error" />

  <template v-else>
  <div class="common-banner position-relative">
    <SharedImage :src="post.cover_image" :alt="post.title" height="380" cover class="w-100" :gallery="allImages" :gallery-index="0" />
    <div class="banner-overlay"></div>
    <div class="container-lg">
      <div class="common-banner-content">
        <div class="mw-460">
          <!-- Top row: icon + paragraph -->
          <div class="d-flex ga-6">
            <img
              :src="AnimatedIcon"
              alt="icon"
              height="44"
              width="44"
              class="icon-rotate"
            />
            <p class="text-white text-subtitle-1 mb-0">
              <span class="opacity-70">Client success story and ROI breakdown.</span>
            </p>
          </div>
        </div>
        <!-- Bottom row: title + badge -->
        <div
          class="d-flex flex-md-row flex-column ga-5 align-md-end align-start mt-md-6 mt-3"
        >
          <h1 class="text-white text-h2 font-weight-bold mb-0">
            {{ post.title }}
          </h1>
          <SharedBigBadge />
        </div>
      </div>
    </div>
  </div>

  <!-- Case Study Details -->
  <div class="bg-darkgray">
    <SharedSectionSpacer />
    <div class="container-lg">
      <v-btn class="interactive-button-small" to="/case-studies" size="lg" flat>
        <v-avatar size="30" class="icon bg-white">
          <Icon icon="material-symbols-light:arrow-back-rounded" height="20" />
        </v-avatar>
        <span class="label">Back</span>
      </v-btn>

      <div class="d-flex flex-md-row flex-column ga-10 mt-10">
        <div class="pr-md-10 pr-4 border-e" v-if="post.technologies">
          <p class="text-subtitle-2 text-dark opacity-70">Technologies</p>
          <div class="d-flex ga-2 mt-2">
            <span class="text-subtitle-1 font-weight-medium">
              {{ Array.isArray(post.technologies) ? post.technologies.join(', ') : (post.technologies || 'N/A') }}
            </span>
          </div>
        </div>
        <div class="pr-md-10 pr-4 border-e">
          <p class="text-subtitle-2 text-dark opacity-70">Client</p>
          <div class="d-flex ga-2 mt-2">
            <span class="text-subtitle-1 font-weight-medium">{{
              post.client_name || 'Client'
            }}</span>
          </div>
        </div>
        <div>
          <p class="text-subtitle-2 text-dark opacity-70">Industry</p>
          <div class="d-flex ga-2 mt-2">
            <span class="text-subtitle-1 font-weight-medium">{{
              post.industry || 'N/A'
            }}</span>
          </div>
        </div>
      </div>
      <SharedSectionSpacer />
      <v-row>
        <!-- THE CHALLENGE -->
        <v-col cols="12" lg="4" v-if="post.challenge">
          <h2 class="text-h2 text-dark">The Challenge</h2>
        </v-col>
        <v-col cols="12" lg="8" v-if="post.challenge">
          <div class="project-desciption markdown-body" v-html="renderMarkdown(post.challenge)"></div>
        </v-col>

        <!-- OUR SOLUTION -->
        <v-col cols="12" lg="4" v-if="post.solution" class="mt-lg-16 mt-8">
          <h2 class="text-h2 text-dark">Our Solution</h2>
        </v-col>
        <v-col cols="12" lg="8" v-if="post.solution" class="mt-lg-16 mt-8">
          <div class="project-desciption markdown-body" v-html="renderMarkdown(post.solution)"></div>
        </v-col>

        <!-- THE RESULTS -->
        <v-col cols="12" lg="4" v-if="post.results" class="mt-lg-16 mt-8">
          <h2 class="text-h2 text-dark">The Results</h2>
        </v-col>
        <v-col cols="12" lg="8" v-if="post.results" class="mt-lg-16 mt-8">
          <div class="project-desciption markdown-body" v-html="renderMarkdown(post.results)"></div>
        </v-col>
      </v-row>

      <!-- METRICS -->
      <v-row v-if="post.metrics && post.metrics.length > 0" class="mt-16 py-10 bg-primary rounded-xl px-4 mx-0">
        <v-col cols="12" md="4" v-for="(metric, i) in post.metrics" :key="i" class="text-center">
          <h3 class="text-h1 font-weight-bold text-white mb-2">{{ metric.value }}</h3>
          <p class="text-subtitle-1 text-white opacity-80">{{ metric.label }}</p>
        </v-col>
      </v-row>

      <!-- GALLERY -->
      <v-row class="mt-16" v-if="post.gallery && post.gallery.length > 0">
        <v-col cols="12" class="mt-lg-16 mt-8" v-if="post.gallery?.[0]">
          <div class="pa-4 bg-black rounded-xl overflow-hidden shadow-lg">
            <SharedImage :src="post.gallery[0]" alt="case study gallery 1" height="auto" contain class="w-100" :gallery="allImages" />
          </div>
        </v-col>
        <v-col cols="12" lg="6" v-if="post.gallery?.[1]">
          <div class="pa-4 bg-black rounded-xl overflow-hidden shadow-lg">
            <SharedImage :src="post.gallery[1]" alt="case study gallery 2" height="auto" contain class="w-100" :gallery="allImages" />
          </div>
        </v-col>
        <v-col cols="12" lg="6" v-if="post.gallery?.[2]">
          <div class="pa-4 bg-black rounded-xl overflow-hidden shadow-lg">
            <SharedImage :src="post.gallery[2]" alt="case study gallery 3" height="auto" contain class="w-100" :gallery="allImages" />
          </div>
        </v-col>
      </v-row>

      <!-- TESTIMONIAL -->
      <div v-if="post.testimonial" class="d-flex flex-column align-center text-center mt-16 pt-16 px-4 border-t">
        <div v-if="post.client_logo" class="mb-8 pa-4 bg-black rounded-xl border">
          <SharedImage :src="post.client_logo" alt="Client Logo" height="80" contain class="max-h-80" :gallery="allImages" />
        </div>
        <p class="text-h3 font-weight-medium text-dark font-italic mb-6" style="max-width: 800px; line-height: 1.4;">
          "{{ post.testimonial }}"
        </p>
        <p class="text-subtitle-1 text-primary font-weight-bold">
          — {{ post.testimonial_author || post.client_name || 'Client' }}
        </p>
      </div>
    </div>

    <SharedSectionSpacer />
  </div>
  </template>
</template>
