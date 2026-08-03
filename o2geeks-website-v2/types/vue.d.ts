import { NuxtApp } from '#app';

declare module '#app' {
  interface NuxtApp {
    $mediaUrl(path?: string | null): string;
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $mediaUrl(path?: string | null): string;
  }
}

export {};
