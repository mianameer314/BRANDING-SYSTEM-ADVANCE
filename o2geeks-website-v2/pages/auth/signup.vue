<script setup lang="ts">
import { Icon } from "@iconify/vue";
import google from "/images/svgs/google.svg";
import github from "/images/svgs/github.svg";
import Logo from "@/layouts/shared/logo/index.vue";
/*for Blank Layout*/
definePageMeta({
  layout: "blank",
});
</script>

<template>
  <div class="border-t-lg border-primary border-opacity-100"></div>
  <div
    class="d-flex justify-center align-center min-h-screen h-100 bg-surface px-5"
  >
    <v-card elevation="10" class="pa-6 w-100 mw-512 pa-lg-14 pa-8 bg-accent">
      <div class="mx-auto text-center"><Logo /></div>
      <div class="d-flex justify-space-between ga-6 my-7">
        <NuxtLink
          to="/"
          class="rounded-pill w-100 justify-center d-flex align-center ga-3 border-sm  py-3 px-5 text-decoration-none text-dark text-subtitle-2 font-weight-medium"
        >
          Sign Up
          <img :src="google" alt="google" />
        </NuxtLink>
        <NuxtLink
          to="/"
          class="rounded-pill w-100 justify-center d-flex align-center ga-3 border-sm  py-3 px-5 text-decoration-none text-dark text-subtitle-2 font-weight-medium"
        >
          Sign Up
          <img :src="github" alt="google" />
        </NuxtLink>
      </div>
      <div class="d-flex align-center text-center mb-6">
        <div
          class="text-subtitle-2 w-100 px-5 font-weight-regular auth-divider position-relative"
        >
          <span class="bg-accent px-5 py-3 position-relative text-dark"
            >OR</span
          >
        </div>
      </div>
      <form>
         <v-text-field
          label="Name"
          type="text"
          variant="underlined"
        ></v-text-field>
        <v-text-field
          label="Email"
          type="email"
          variant="underlined"
        ></v-text-field>
        <v-text-field
          label="Password"
          type="password"
          variant="underlined"
        ></v-text-field>
        <v-btn class="btn-secondary w-100 rounded-pill mt-3 mb-4" flat
          >Sign Up</v-btn
        >
        <div class="d-flex justify-center flex-column align-center ga-1 mt-4">
         
          <div class="d-flex flex-column align-center ga-1 text-center">
            <span class="text-dark opacity-80"> By creating an account, you agree with our  </span>
            <NuxtLink
              to="/privacy-policy"
              class="text-dark opacity-80 text-decoration-none hover-opacity-1"
            >
              Privacy and Policy</NuxtLink
            >
          </div>
          <div class="d-flex ga-1">
            <span class="text-dark opacity-80"> Already have an account?  </span>
            <NuxtLink
              to="/auth/signin"
              class="text-dark opacity-80 text-decoration-none hover-opacity-1"
            >
              Sign In</NuxtLink
            >
          </div>
        </div>
      </form>
    </v-card>
  </div>
</template>
