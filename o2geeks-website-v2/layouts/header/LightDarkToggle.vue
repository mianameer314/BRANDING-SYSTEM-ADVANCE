<script setup lang="ts">
import { useTheme } from "vuetify";
import { Icon } from "@iconify/vue";

const LIGHT = "LIGHT_THEME";
const DARK = "DARK_THEME";

const theme = useTheme();

const toggleTheme = () => {
  theme.global.name.value = theme.global.name.value === LIGHT ? DARK : LIGHT;
};
</script>

<template>
  <div class="flex items-center gap-4">
    <v-btn
      icon flat
      @click="toggleTheme"
      class="rounded-full bg-transparent"
    >
      <Icon
        :icon="
          theme.global.name.value === LIGHT
            ? 'solar:sun-bold'
            : 'solar:moon-stars-bold'
        "
        width="40"
        height="40"
        class="text-white"
      />
    </v-btn>
  </div>
</template>
