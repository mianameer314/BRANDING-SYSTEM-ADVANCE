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

      <form class="mt-4">
        <v-text-field
          label="Email"
          type="email"
          variant="underlined"
        ></v-text-field>

        <v-btn class="btn-secondary w-100 rounded-pill" flat
          >send email</v-btn
        >
      </form>
    </v-card>
  </div>
</template>
