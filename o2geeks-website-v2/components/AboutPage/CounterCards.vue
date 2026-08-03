<script setup lang="ts">
import { ref, onMounted } from "vue";
import Logo from "@/layouts/shared/logo/index.vue";

type CounterItem = {
  value: number;
  suffix?: string;
  prefix?: string;
  title: string;
  description: string;
  animatedValue?: number;
};

const counters = ref<CounterItem[]>([
  {
    value: 45,
    suffix: "+",
    title: "Presence in global markets",
    description:
      "Expanding reach across international regions with localized expertise and worldwide impact.",
  },
  {
    value: 15,
    prefix: "$",
    suffix: "M",
    title: "In strategic investments",
    description:
      "Driving growth with curated partnerships and high-performing, audience-driven initiatives.",
  },
  {
    value: 158,
    suffix: "+",
    title: "Trusted brand collaborations",
    description:
      "Shaping industry conversations through innovation, creativity, and lasting influence.",
  },
]);

/**
 * Animate counters from 0 to their target value
 */
const startCounting = () => {
  counters.value.forEach((item) => {
    item.animatedValue = 0;
    const duration = 2000; // milliseconds
    const steps = 60;
    const increment = item.value / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      item.animatedValue = Math.round(increment * currentStep);

      if (currentStep >= steps) {
        item.animatedValue = item.value; // ensure final value
        clearInterval(interval);
      }
    }, duration / steps);
  });
};

onMounted(() => {
  startCounting();
});

/**
 * Increment counter value
 */
const increment = (index: number) => {
  counters.value[index].value++;
  counters.value[index].animatedValue = counters.value[index].value;
};

/**
 * Decrement counter value
 */
const decrement = (index: number) => {
  if (counters.value[index].value > 0) {
    counters.value[index].value--;
    counters.value[index].animatedValue = counters.value[index].value;
  }
};
</script>


<template>
  <div class="bg-darkgray">
  <SharedSectionSpacer />
  <div class="container-lg overflow-hidden">
    <v-row>
      <!-- LEFT SIDE IMAGE -->
      <v-col cols="12" lg="4">
        <Logo />
      </v-col>
      <v-col cols="12" lg="8">
        <div class="d-flex flex-column ga-lg-10 ga-8">
          <p class="text-subtitle-1">
            It’s a canvas for your creativity. It’s your opportunity to
            transform bold ideas into dynamic, interactive experiences. Your
            work can shape identities, tell compelling stories, or spark
            meaningful change. As the digital landscape grows, so do the
            possibilities. And whether you thrive working remotely or in a
            buzzing agency space, the thrill of seeing your vision come to life
            is unmatched.
          </p>
          <p class="text-subtitle-1">
            At O2geeks, we bring ideas to life through a range of services:
            branding, web development, agency solutions, content creation, SaaS,
            and motion & 3D modeling. As a web designer, you merge artistry and
            technology to craft "digital experiences" that inform, captivate,
            and inspire. Every day brings something new — one moment you’re
            sketching innovative concepts, the next you’re turning them into
            seamless, responsive designs. Web design keeps you pushing
            boundaries and creating at every turn!
          </p>
        </div>
      </v-col>
    </v-row>

    <!-- Counter Blocks -->
    <SharedSectionSpacer />
    <div class="counter">
      <v-row>
        <v-col
          v-for="(item, index) in counters"
          :key="index"
          cols="12"
          md="4"
          class="px-8"
        >
          <h2 class="text-60 font-weight-bold lh-in text-dark">
            {{ item.prefix || "" }}{{ item.animatedValue
            }}{{ item.suffix || "" }}
          </h2>

          <v-divider class="mb-6 mt-4 opacity-10"></v-divider>

          <h4 class="text-h4 font-weight-bold mb-3 text-dark">
            {{ item.title }}
          </h4>

          <div
            class="text-subtitle-2 text-dark opacity-70 font-weight-regular mb-4"
          >
            {{ item.description }}
          </div>

         
        </v-col>
      </v-row>
    </div>
  </div>
  <SharedSectionSpacer />
  </div>
</template>
