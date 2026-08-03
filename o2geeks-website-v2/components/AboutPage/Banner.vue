<script setup lang="ts">
import AnimatedIcon from "/images/svgs/astrisk-icon.svg";
import ManImage from "/images/background/aboutus-banner.png";
</script>

<template>
  <div class="common-banner position-relative">
    <v-img :src="ManImage" cover height="650" class="w-100"></v-img>
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
              <span class="opacity-70">We craft</span>
              <span class="text-primary opacity-100"> innovative digital </span>
              <span class="opacity-70"
                >designs that amplify brand identity and drive meaningful
                results</span
              >
            </p>
          </div>
        </div>
        <!-- Bottom row: title + badge -->
        <div class="d-flex flex-md-row flex-column ga-5 align-md-end align-start mt-md-6 mt-3">
          <h1 class="text-white text-h1 font-weight-bold mb-0">About us</h1>
          <SharedBigBadge />
        </div>
      </div>
    </div>
  </div>
</template>
