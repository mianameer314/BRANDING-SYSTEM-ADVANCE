<script setup lang="ts">
import AnimatedIcon from "/images/svgs/astrisk-icon.svg";
import MainImage from "/images/background/privacy-policy.png";
</script>

<template>
  <div class="common-banner position-relative">
    <v-img :src="MainImage" cover height="650" class="w-100"></v-img>
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
              <span class="opacity-70">Understand the</span>
              <span class="text-primary opacity-100"> Rules & Guidelines </span>
              <span class="opacity-70">Before Using Our Services</span>
            </p>
          </div>
        </div>
        <!-- Bottom row: title + badge -->
        <div
          class="d-flex flex-md-row flex-column ga-5 align-md-end align-start mt-md-6 mt-3"
        >
          <h1 class="text-white text-h1 font-weight-bold mb-0">
            Privacy Policy
          </h1>
          <SharedBigBadge />
        </div>
      </div>
    </div>
  </div>
  <div class="bg-darkgray leagal">
    <div class="container-lg py-lg-16 py-8">
      <p class="text-subtitle-1">
        This Privacy Statement explains how personal information about our
        (potential) customers and other individuals using our services is
        collected, used, and disclosed by **Nuxtjs Template** ("us", "we",
        "our"). This Privacy Statement describes our privacy practices in
        relation to the use of our websites, including any customer portals or
        interactive websites (<a
          class="hover-primary-link text-decoration-none text-black font-weight-bold"
          target="_blank"
          href="https://nuxt.com/"
          >https://nuxt.com/</a
        >), our software (Nuxtjs), services, solutions, tools, and related
        applications, services, and programs, including research and marketing
        activities, offered by us (the "Services").
      </p>
      <p class="text-subtitle-1">
        By signing up for our Services and agreeing to our General Terms and
        Conditions, you consent to the collection, usage, storage, and
        disclosure of your information as described in this Privacy Statement.
      </p>
      <p class="text-subtitle-1">
        Our Services may contain links to external websites or services. The
        privacy practices and content of such sites or services will be governed
        by their respective privacy policies.
      </p>
      <p class="text-subtitle-1">
        We may update this Privacy Statement periodically. If changes occur, we
        will notify you by updating the date at the top of the statement and
        providing additional notifications (such as a statement on our homepage
        or an email notification). We encourage you to review this Privacy
        Statement whenever you use our Services to stay informed about how we
        handle your information.
      </p>
      <div class="my-6">
        <h4 class="text-h4 text-dark">Personal Information Collection</h4>
        <p class="mt-6 text-subtitle-1">
          While using our Services, we may ask you to provide certain personally
          identifiable information that can be used to contact or identify you.
          This may include basic user details (such as your name, email address,
          telephone number, and profile picture), company information, and any
          other data you choose to share with us.
        </p>
        <p class="text-subtitle-1">
          We do not collect financial information (such as credit card details
          or security codes). All payments are handled through a third-party
          provider. If applicable, please refer to their Privacy
        </p>
      </div>
      <div class="my-6">
        <h4 class="text-h4 text-dark">
          Personal Information You Provide to Us
        </h4>
        <p class="mt-6 text-subtitle-1">
          When using our Services, you may provide personally identifiable
          information, such as when creating an account, requesting customer
          support, or interacting with our platform.
        </p>
        <p class="mt-6 text-subtitle-1">
          As noted, we do not collect financial details directly. Payments are
          processed via third-party providers. Please review their privacy
          policy for details:<a
            class="hover-primary-link text-decoration-none text-black font-weight-bold"
            target="_blank"
            href="http://nuxtjstemplates.com/"
            >http://nuxtjstemplates.com/</a
          >.
        </p>
      </div>
    </div>
  </div>
</template>
