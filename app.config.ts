import { defineConfig } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  serialization: { mode: "json" },
  vite: {
    plugins: [tailwindcss()],
    envPrefix: ["GISCUS_"],
  },
  server: {
    preset: "cloudflare_module",
    prerender: {
      routes: ["/", "/404.html"],
      crawlLinks: true,
      failOnError: true,
    },
    compatibilityDate: "2026-05-15"
  },
});