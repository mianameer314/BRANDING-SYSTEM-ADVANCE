<script setup lang="ts">
import { ref } from 'vue';

const activeTab = ref(0);
</script>

<template>
  <div class="bg-surface">
    <SharedSectionSpacer />
    <div class="container-lg overflow-hidden">
      <v-row>
        <!-- LEFT SIDE IMAGE -->
        <v-col cols="12" lg="4" class="position-relative">
          <SharedLeftSideDarkHeading number="09" title="Resources" />
        </v-col>

        <!-- RIGHT SIDE TEXT LIST -->
        <v-col cols="12" lg="8">
          <div class="d-flex flex-column ga-11">
            <SharedCommonHeading
              class="mw-670"
              title="Recent news & insights"
              subtitle="Explore the latest trends, bold projects, and creative insights from our agency—shaping the future of branding, digital experiences, and storytelling."
            />

            <!-- Tabs Switcher for Blogs, News & Insights -->
            <div class="d-flex align-center mt-4">
              <v-tabs v-model="activeTab" color="primary" align-tabs="start" class="border-b">
                <v-tab :value="0" class="text-subtitle-1 font-weight-bold">Blogs</v-tab>
                <v-tab :value="1" class="text-subtitle-1 font-weight-bold">News</v-tab>
                <v-tab :value="2" class="text-subtitle-1 font-weight-bold">Insights</v-tab>
                <v-tab :value="3" class="text-subtitle-1 font-weight-bold">Case Studies</v-tab>
              </v-tabs>
            </div>
          </div>
        </v-col>
      </v-row>

      <div class="mt-md-16 mt-10">
        <v-window v-model="activeTab">
          <v-window-item :value="0">
            <BlogsBlogGridRecentBlogGrid />
          </v-window-item>
          <v-window-item :value="1">
            <NewsNewsGrid />
          </v-window-item>
          <v-window-item :value="2">
            <InsightsInsightsGrid />
          </v-window-item>
          <v-window-item :value="3">
            <CaseStudiesCaseStudiesGrid />
          </v-window-item>
        </v-window>
      </div>
    </div>
    <SharedSectionSpacer />
  </div>
</template>
