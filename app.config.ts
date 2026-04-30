import { defineConfig } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

// Load .env / .env.local into process.env so server code (loadGitHub etc.)
// sees GITHUB_USERNAME and GITHUB_TOKEN during prerender. Vite only auto-loads
// .env into import.meta.env, not process.env, so we do it manually.
function loadDotenv(file: string) {
  const path = join(process.cwd(), file);
  if (!existsSync(path)) return;
  const raw = readFileSync(path, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}
loadDotenv(".env");
loadDotenv(".env.local");

const POSTS_DIR = join(process.cwd(), "src/content/posts");

function listPostSlugs(): string[] {
  try {
    return readdirSync(POSTS_DIR)
      .filter((f) => f.endsWith(".md"))
      .map((f) => f.replace(/\.md$/, ""));
  } catch {
    return [];
  }
}

const blogRoutes = listPostSlugs().map((slug) => `/blog/${slug}`);

export default defineConfig({
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
