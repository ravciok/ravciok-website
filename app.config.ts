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
  middleware: "src/middleware.ts",
  vite: {
    plugins: [tailwindcss()],
    envPrefix: ["GISCUS_"],
  },
  server: {
    preset: "static",
    prerender: {
      routes: ["/", "/404.html", ...blogRoutes],
      crawlLinks: true,
      failOnError: true,
    },
  },
});
