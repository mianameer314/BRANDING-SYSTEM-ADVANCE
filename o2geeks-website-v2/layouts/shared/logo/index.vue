<script setup lang="ts">
import { useTheme } from "vuetify";
import LightLogo from "./LightLogo.vue";
import DarkLogo from "./DarkLogo.vue";
const LIGHT = "LIGHT_THEME";
const DARK = "DARK_THEME";

const theme = useTheme();

const toggleTheme = () => {
  theme.global.name.value = theme.global.name.value === LIGHT ? DARK : LIGHT;
};
</script>

<template>
  <div>
    <DarkLogo v-if="theme.global.name.value === LIGHT" />
    <LightLogo v-else />
  </div>
</template>
