<script setup lang="ts">
import { Icon } from "@iconify/vue";
const FooterLinks = ref([
  {
    title: "Home",
    url: "/",
  },
  {
    title: "About",
    url: "/about",
  },
  {
    title: "Blog",
    url: "/blog",
  },
  {
    title: "Work",
    url: "/projects",
  },
  {
    title: "Terms",
    url: "/terms-conditions",
  },
  {
    title: "Privacy Policy",
    url: "/privacy-policy",
  },
  {
    title: "Error 404",
    url: "/error",
  },
]);

const SocialLinks = ref([
  {
    title: "Facebook",
    url: "https://www.facebook.com/",
  },
  {
    title: "Instagram",
    url: "https://www.instagram.com/",
  },
  {
    title: "Twitter",
    url: "https://x.com/",
  },
  
]);
</script>
<template>
  <div class="bg-secondary">
    <SharedSectionSpacer />
    <div class="container-lg">
      <v-row>
        <v-col cols="12" lg="5">
          <div class="d-flex flex-column ga-10">
            <h2 class="text-h2 pe-lg-16">Build something together?</h2>
            <div>
              <div class="d-flex flex-column ga-2">
                <NuxtLink
                  href="https://www.wrappixel.com/"
                  target="_blank"
                  class="d-flex ga-3 align-center text-white text-decoration-none hover-primary-link"
                >
                  <Icon
                    icon="material-symbols:arrow-outward"
                    height="24"
                    class="text-primary"
                  />
                  info@o2geeks.com</NuxtLink
                >
                <NuxtLink
                  href="https://maps.app.goo.gl/hpDp81fqzGt5y4bC8"
                  target="_blank"
                  class="d-flex ga-3 align-center text-white text-decoration-none hover-primary-link"
                >
                  <Icon
                    icon="uil:map-marker"
                    height="24"
                    class="text-primary"
                  />O2geeks Pakistan</NuxtLink
                >
              </div>
            </div>
          </div>
        </v-col>
        <v-col cols="12" lg="2" md="4">
          <ul class="list-style-none d-flex flex-column ga-2">
            <li v-for="(item, i) in FooterLinks" :key="i" class="">
              <NuxtLink :to="item.url" class="text-subtitle-1 text-white text-decoration-none hover-primary-link ">{{ item.title }}</NuxtLink>
            </li>
          </ul>
        </v-col>
        <v-col cols="12" lg="2" md="4">
            <ul class="list-style-none d-flex flex-column ga-2">
            <li v-for="(item, i) in SocialLinks" :key="i" class="">
              <NuxtLink :to="item.url" target="_blank" class="text-subtitle-1 text-white text-decoration-none hover-primary-link ">{{ item.title }}</NuxtLink>
            </li>
          </ul>
        </v-col>
        <v-col cols="12" lg="3" md="4">
            <p class="text-subtitle-1 text-white text-lg-right text-left">© O2geeks copyright 2026</p>
        </v-col>
      </v-row>
    </div>
    <SharedSectionSpacer />

    <ScrollToTop/>
  </div>
</template>
