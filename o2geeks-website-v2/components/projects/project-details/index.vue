<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { useRoute } from "vue-router";
import { useAsyncData, computed } from "#imports";
import { ProjectService } from "@/services/projects";
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
  `project-${slug}`,
  async () => {
    if (previewMode.value !== 'none' && previewType.value === 'project') {
      return null;
    }
    try {
      return await ProjectService.getBySlug(slug);
    } catch (e) {
      return null;
    }
  }
);

const post = computed(() => {
  if (previewMode.value !== 'none' && previewType.value === 'project' && previewContent.value) {
    return {
      ...(fetchedPost.value || {}),
      ...previewContent.value
    };
  }
  return fetchedPost.value;
});

const allImages = computed(() => {
  if (!post.value) return [];
  const list = [post.value.cover_image, ...(post.value.gallery || [])];
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
    <SharedImage :src="post.cover_image" :alt="post.name" height="380" cover class="w-100" :gallery="allImages" :gallery-index="0" />
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
            <p class="text-white text-subtitle-1 mb-0 opacity-70" v-if="post.short_desc">
              {{ post.short_desc }}
            </p>
            <p class="text-white text-subtitle-1 mb-0" v-else>
              <span class="opacity-70">A</span>
              <span class="text-primary opacity-100"> showcase of creativity</span>
              <span class="opacity-70">, strategy, and engineering results.</span>
            </p>
          </div>
        </div>
        <!-- Bottom row: title + badge -->
        <div
          class="d-flex flex-md-row flex-column ga-5 align-md-end align-start mt-md-6 mt-3"
        >
          <h1 class="text-white text-h2 font-weight-bold mb-0">
            {{ post.name }}
          </h1>
          <SharedBigBadge />
        </div>
      </div>
    </div>
  </div>

  <!-- Project Details -->
  <div class="bg-darkgray">
    <SharedSectionSpacer />
    <div class="container-lg">
      <v-btn class="interactive-button-small" to="/projects" size="lg" flat>
        <v-avatar size="30" class="icon bg-white">
          <Icon icon="material-symbols-light:arrow-back-rounded" height="20" />
        </v-avatar>
        <span class="label">Back</span>
      </v-btn>

      <div class="d-flex flex-md-row flex-column ga-10 mt-10">
        <div class="pr-md-10 pr-4 border-e">
          <p class="text-subtitle-2 text-dark opacity-70">Technologies</p>
          <div class="d-flex ga-2 mt-2 flex-wrap">
            <span class="text-subtitle-1 font-weight-medium">
              {{ Array.isArray(post.technologies) ? post.technologies.join(', ') : (post.technologies || 'N/A') }}
            </span>
          </div>
        </div>
        <div class="pr-md-10 pr-4 border-e">
          <p class="text-subtitle-2 text-dark opacity-70">Category</p>
          <div class="d-flex ga-2 mt-2">
            <span class="text-subtitle-1 font-weight-medium">{{
              post.category || 'N/A'
            }}</span>
          </div>
        </div>
        <div class="pr-md-10 pr-4 border-e">
          <p class="text-subtitle-2 text-dark opacity-70">Client</p>
          <div class="d-flex ga-2 mt-2">
            <span class="text-subtitle-1 font-weight-medium">{{
              post.client || 'Internal'
            }}</span>
          </div>
        </div>
        <div class="pr-md-10 pr-4 border-e" v-if="post.project_url">
          <p class="text-subtitle-2 text-dark opacity-70">Website</p>
          <div class="d-flex ga-2 mt-2">
            <a :href="post.project_url" target="_blank" class="text-primary font-weight-medium text-decoration-none">
              Visit Site ↗
            </a>
          </div>
        </div>
        <div>
          <p class="text-subtitle-2 text-dark opacity-70">Completed</p>
          <div class="d-flex ga-2 mt-2">
            <span class="text-subtitle-1 font-weight-medium">
              {{ post.completed_at ? new Date(post.completed_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Ongoing' }}
            </span>
          </div>
        </div>
      </div>

      <SharedSectionSpacer />

      <v-row>
        <!-- LEFT SIDE TITLE -->
        <v-col cols="12" lg="4">
          <h2 class="text-h2 text-dark">Description</h2>
        </v-col>
        <v-col cols="12" lg="8">
          <div class="d-flex flex-column ga-lg-10 ga-8">
            <div class="project-desciption markdown-body" v-html="renderMarkdown(post.description)"></div>
          </div>
        </v-col>

        <!-- GALLERY IMAGES -->
        <v-col cols="12" class="mt-lg-16 mt-8" v-if="post.gallery && post.gallery.length > 0">
          <div class="pa-4 bg-black rounded-xl overflow-hidden shadow-lg">
            <SharedImage :src="post.gallery[0]" :alt="`${post.name} gallery 1`" height="auto" contain class="w-100" :gallery="allImages" :gallery-index="post.cover_image ? 1 : 0" />
          </div>
        </v-col>
        <v-col cols="12" lg="6" v-if="post.gallery && post.gallery.length > 1">
          <div class="pa-4 bg-black rounded-xl overflow-hidden shadow-lg">
            <SharedImage :src="post.gallery[1]" :alt="`${post.name} gallery 2`" height="auto" contain class="w-100" :gallery="allImages" :gallery-index="post.cover_image ? 2 : 1" />
          </div>
        </v-col>
        <v-col cols="12" lg="6" v-if="post.gallery && post.gallery.length > 2">
          <div class="pa-4 bg-black rounded-xl overflow-hidden shadow-lg">
            <SharedImage :src="post.gallery[2]" :alt="`${post.name} gallery 3`" height="auto" contain class="w-100" :gallery="allImages" :gallery-index="post.cover_image ? 3 : 2" />
          </div>
        </v-col>
      </v-row>
    </div>

    <SharedSectionSpacer />
  </div>
  </template>
</template>
