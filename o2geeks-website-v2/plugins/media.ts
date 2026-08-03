import { defineNuxtPlugin, useRuntimeConfig } from "#app";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  const apiBase = config.public.apiBase as string;

  const backend =
    apiBase.endsWith("/api/v1")
      ? apiBase.replace("/api/v1", "")
      : apiBase;

  return {
    provide: {
      mediaUrl: (path?: string) => {
        if (!path) return "";

        // Already absolute
        if (
          path.startsWith("http://") ||
          path.startsWith("https://") ||
          path.startsWith("data:") ||
          path.startsWith("blob:")
        ) {
          return path;
        }

        return `${backend}${path.startsWith("/") ? "" : "/"}${path}`;
      },
    },
  };
});