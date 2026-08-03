<script setup lang="ts">
import { Icon } from "@iconify/vue";
import testimonial1 from "/images/profile/testimonial_1.webp";
import testimonial2 from "/images/profile/testimonial_2.webp";
import testimonial3 from "/images/profile/testimonial_3.webp";
import Quotes from "/images/svgs/quotes.svg";
</script>

<template>
  <div class="stories bg-surface">
    <SharedSectionSpacer />
    <div class="container-lg">
      <v-row>
        <v-col cols="12" lg="4" class="position-relative">
          <SharedLeftSideDarkHeading number="05" title="Testimonials" />
        </v-col>

        <v-col cols="12" lg="8">
          <div class="d-flex flex-column ga-11">
            <SharedCommonHeading
              class="mw-670"
              title="Trusted by Experts"
              subtitle="We collaborate with founders, leaders, and product teams who trust us to deliver impactful digital solutions."
            />
          </div>
        </v-col>
      </v-row>
      <v-row class="mt-md-16 mt-8">
        
        <v-col cols="12" lg="3" class="d-flex">
          <div class="bg-primary pa-7 d-flex flex-column h-100 justify-space-between ga-16">
            <div class="d-flex flex-column ga-6">
              <p class="text-subtitle-2 text-secondary opacity-70 font-weight-regular">
                Hear from them
              </p>
              <h4 class="text-h4">
                "o2Geeks helped us turn a complex idea into a scalable product. Their clarity and execution speed were exceptional."
              </h4>
            </div>
            <div class="pt-12">
              <div class="d-flex ga-4 align-center">
                <v-avatar size="60">
                  <img :src="testimonial1" alt="James Walker" class="w-100" />
                </v-avatar>
                <div>
                  <h5 class="text-subtitle-1">James Walker</h5>
                  <p class="text-subtitle-2 text-secondary opacity-70">
                    Founder & CEO, Tech Startup
                  </p>
                </div>
              </div>
            </div>
          </div>
        </v-col>

        <v-col cols="12" lg="6" class="d-flex">
          <div class="here-from bg-secondary pa-7 d-flex flex-column h-100 justify-space-between">
            <div class="d-flex flex-column ga-6">
              <p class="text-subtitle-2 text-white opacity-70 font-weight-regular">
                Hear from them
              </p>
              <h4 class="text-h4">
                "The team demonstrated deep technical expertise and a strong product mindset throughout the engagement."
              </h4>
              <div class="d-flex ga-2">
                <div class="d-flex ga-1">
                  <Icon icon="solar:star-bold" class="text-white" height="18" />
                  <Icon icon="solar:star-bold" class="text-white" height="18" />
                  <Icon icon="solar:star-bold" class="text-white" height="18" />
                  <Icon icon="solar:star-bold" class="text-white" height="18" />
                  <Icon icon="solar:star-bold" class="text-white" height="18" />
                </div>
                <span class="text-subtitle-2 text-white">5.0</span>
              </div>
            </div>
            <div class="pt-12">
              <div class="d-flex justify-space-between align-center">
                <div class="d-flex ga-4 align-center">
                  <v-avatar size="60">
                    <img :src="testimonial2" alt="Nader Amiri" class="w-100" />
                  </v-avatar>
                  <div>
                    <h5 class="text-subtitle-1 text-white">Nader Amiri</h5>
                    <p class="text-subtitle-2 text-white opacity-70 font-weight-regular">
                      Head of Product, Enterprise Platform
                    </p>
                  </div>
                </div>
                <div>
                  <img :src="Quotes" alt="quotes" height="35" width="45" />
                </div>
              </div>
            </div>
          </div>
        </v-col>

        <v-col cols="12" lg="3" class="d-flex">
          <div class="bg-accent pa-7 d-flex flex-column h-100 justify-space-between">
            <div class="d-flex flex-column ga-6">
              <p class="text-subtitle-2 text-dark opacity-70 font-weight-regular">
                Hear from them
              </p>
              <h4 class="text-h4">
                "From strategy to delivery, o2Geeks acted as a true partner. The results exceeded expectations."
              </h4>
            </div>
            <div class="pt-12">
              <div class="d-flex ga-4 align-center pt-5">
                <v-avatar size="60">
                  <img :src="testimonial3" alt="Daniel Kim" class="w-100" />
                </v-avatar>
                <div>
                  <h5 class="text-subtitle-1">Daniel Kim</h5>
                  <p class="text-subtitle-2 text-dark opacity-70">
                    CTO, AI Solutions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </v-col>

      </v-row>
    </div>
    <SharedSectionSpacer />
  </div>
</template>