import { defineConfig } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";
import { readdirSync } from "node:fs";
import { join } from "node:path";

function listPostSlugs(): string[] {
  try {
    return readdirSync(join(process.cwd(), "src/content/posts"))
      .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
      .map((f) => f.replace(/\.md$/, ""));
  } catch {
    return [];
  }
}

const blogRoutes = listPostSlugs().map((slug) => `/blog/${slug}`);

export default defineConfig({
  serialization: { mode: "json" },
  vite: {
    plugins: [tailwindcss()],
    envPrefix: ["GISCUS_"],
  },
  server: {
    preset: "cloudflare_module",
    prerender: {
      routes: ["/", "/404.html", ...blogRoutes],
      crawlLinks: true,
      failOnError: true,
    },
    compatibilityDate: "2026-05-15"
  },
});