<script setup lang="ts">
import { ref } from "vue";
import { Icon } from "@iconify/vue";
import img1 from "/images/projects/project3.webp";
import img2 from "/images/projects/whychoose.png";
import img3 from "/images/projects/details/pd-43.webp";
import img4 from "/images/projects/whatwedo.jpg";

// Updated with O2Geeks Services and tailored descriptions
const items = [
  {
    title: "Product Strategy & Discovery",
    description:
      "Client discovery is the foundation of every successful project. We analyze data, competitors, and market trends to create strategic plans and product roadmaps.",
    image: img1,
    offset: -50,
  },
  {
    title: "UX / UI Design & Systems",
    description:
      "We create user-centric, scalable, and efficient design solutions that solve real-world problems, enhancing user engagement and transforming digital experiences.",
    image: img2,
    offset: 80,
  },
  {
    title: "AI & Data-Driven Solutions",
    description:
      "Next-generation applications enhanced with AI-driven insights, machine learning, automation, and intelligent patterns to modernize your business operations.",
    image: img3,
    offset: 200,
  },
  {
    title: "Web & Mobile Development",
    description:
      "From early discovery to engineering execution, we deliver end-to-end custom application development tailored to your business goals with robust and scalable architecture.",
    image: img4,
    offset: 350,
  },
];

const activeItem = ref(items[0]);
</script>

<template>
  <div class="position-relative bg-secondary" id="service">
    <SharedSectionSpacer />

    <div class="container-lg">
      <v-row>
        <v-col cols="12" lg="4" class="position-relative">
          <SharedLeftSideLightHeading number="03" title="Services" />
        </v-col>

        <v-col cols="12" lg="8">
          <div class="d-flex flex-column ga-11">
            <SharedCommonHeadingWhite
              class="mw-670"
              title="One-Stop Digital Acceleration Hub"
              subtitle="We partner with startups and enterprises to design, build, and scale digital products. From strategy to execution, we deliver end-to-end solutions tailored to your business goals."
            />
          </div>
        </v-col>
      </v-row>

      <v-row class="mt-16">
        <v-col cols="12" lg="4" md="6" class="position-relative">
          <v-fade-transition>
            <img
              v-if="activeItem"
              :src="activeItem.image"
              height="250"
              width="400"
              class="img-offset"
              style="
                transition: transform 0.5s ease;
                transform: translateY(var(--img-offset));
              "
              :style="{ '--img-offset': `${activeItem.offset}px` }"
            />
          </v-fade-transition>
        </v-col>

        <v-col cols="12" lg="8" md="6">
          <div>
            <div
              v-for="(item, index) in items"
              :key="index"
              @mouseenter="activeItem = item"
              class="py-md-12 py-8 border-t border-white border-opacity hover-primary-title"
            >
              <v-row class="align-center">
                <v-col cols="12" lg="5">
                  <h3 class="text-h3 font-weight-bold cursor-pointer title">
                    {{ item.title }}
                  </h3>
                </v-col>
                <v-col cols="12" lg="7" class="py-0">
                  <div>
                    <v-expand-transition>
                      <p
                        v-if="activeItem?.title === item.title"
                        class="text-white opacity-70"
                      >
                        {{ item.description }}
                      </p>
                    </v-expand-transition>
                  </div>
                </v-col>
              </v-row>
            </div>
          </div>
          <div class="mt-lg-12 mt-8">
            <v-btn class="interactive-button" to="" size="lg" flat>
              <span class="label">Explore Services</span>
              <v-avatar size="45" class="icon bg-white">
                <Icon icon="material-symbols:arrow-outward" class="text-secondary" height="20" />
              </v-avatar>
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </div>

    <SharedSectionSpacer />
  </div>
</template>