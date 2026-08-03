<script setup lang="ts">
import AnimatedIcon from "/images/svgs/astrisk-icon.svg";
</script>

<template>
  <div class="hero-banner position-relative">
    <video autoplay muted loop playsinline class="video-bg" poster="/video/cover_video.mp4">
      <source src="/video/cover_video.mp4" type="video/mp4" />
    </video>

    <div class="banner-overlay"></div>

    <div class="container-lg h-100 d-flex align-end pb-10 pb-md-16 position-relative z-index-2">
      <div class="hero-banner-content w-100">
        
        <div class="mw-460">
          <div class="d-flex ga-4 ga-md-6 align-start">
            <img
              :src="AnimatedIcon"
              alt="icon"
              height="44"
              width="44"
              class="icon-rotate mt-1"
            />
            <p class="text-white text-subtitle-2 text-md-subtitle-1 mb-0 lh-1.6">
              <span class="opacity-70">o2Geeks provides</span>
              <span class="text-primary font-weight-bold opacity-100"> world-class growth </span>
              <span class="opacity-70">marketing services that extend across the entire customer journey.</span>
            </p>
          </div>
        </div>

        <div class="d-flex flex-column align-start mt-md-6 mt-4">
          <h1 class="text-white text-h3 text-md-h1 font-weight-bold mb-0 hero-title">
            Building <span class="text-primary">products</span> <br />
            with <span class="text-primary">Purpose.</span>
          </h1>
        </div>

        <div class="client-logos-section mt-8 mt-md-12">
          <p class="text-white text-caption text-uppercase font-weight-bold opacity-50 mb-4 tracking-widest">
            Trusted by industry leaders
          </p>
          <div class="d-flex flex-wrap ga-4 ga-md-10 align-center">
            <img src="/img/edyou-logo.svg" alt="EDYou" class="client-logo" />
            <img src="/img/Logo_2.svg" alt="Superhero" class="client-logo" />
            <img src="/img/Logo_3.svg" alt="Klaviyo" class="client-logo" />
            <img src="/img/Logo_4.svg" alt="Amazon" class="client-logo" />
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
/* Main Banner Container */
.hero-banner {
  position: relative;
  width: 100%;
  height: 100vh; /* Keeps full screen height */
  min-height: 650px; /* Safe fallback to match About Us banner height */
  overflow: hidden;
  display: flex;
  background-color: #000;
}

/* Video Background */
.video-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

/* Overlay */
.banner-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.2) 100%);
  z-index: 1;
}

/* Forces content to sit above absolute backgrounds */
.z-index-2 {
  z-index: 2;
}

/* Utility Classes */
.mw-460 {
  max-width: 460px;
}

.hero-title {
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.lh-1.6 {
  line-height: 1.6;
}

.tracking-widest {
  letter-spacing: 0.15em;
}

/* Icon Animation */
.icon-rotate {
  animation: spin 8s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}

/* Client Logos */
.client-logo {
  height: 24px;
  width: auto;
  opacity: 0.6;
  filter: brightness(0) invert(1);
  transition: all 0.3s ease;
}

.client-logo:hover {
  opacity: 1;
  transform: scale(1.05);
}

/* Responsive adjustments */
@media (max-width: 959px) {
  .client-logo {
    height: 20px;
  }
  .hero-title {
    font-size: 2.75rem !important; /* Prevents overflow on very small phones */
    line-height: 1.15;
  }
}

@media (min-width: 960px) {
  .client-logo { height: 32px; }
}

@media (min-width: 1264px) {
  .client-logo { height: 38px; }
}
</style>