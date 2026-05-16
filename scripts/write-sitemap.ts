import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import matter from "gray-matter";

const SITE_URL = "https://ravciok.dev";

const POSTS_DIR = join(process.cwd(), "src/content/posts");
const OUT_PATH = join(process.cwd(), ".output/public/sitemap.xml");

interface SitemapEntry {
  loc: string;
  lastmod: string;
}

function toIsoDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(+d) ? new Date().toISOString() : d.toISOString();
}

async function listPostEntries(): Promise<SitemapEntry[]> {
  const files = (await readdir(POSTS_DIR)).filter(
    (f) => f.endsWith(".md") && !f.startsWith("_"),
  );
  const entries = await Promise.all(
    files.map(async (f) => {
      const raw = await readFile(join(POSTS_DIR, f), "utf8");
      const { data } = matter(raw);
      const slug = f.replace(/\.md$/, "");
      const date = data.date instanceof Date ? data.date.toISOString() : String(data.date ?? "");
      return {
        loc: `${SITE_URL}/blog/${slug}`,
        lastmod: toIsoDate(date),
      } satisfies SitemapEntry;
    }),
  );
  return entries;
}

function buildSitemap(entries: SitemapEntry[]): string {
  const home: SitemapEntry = { loc: SITE_URL, lastmod: new Date().toISOString() };
  const all = [home, ...entries];
  const urls = all
    .map(
      (e) => `  <url>
    <loc>${e.loc}</loc>
    <lastmod>${e.lastmod}</lastmod>
  </url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/0.9">
${urls}
</urlset>
`;
}

const entries = await listPostEntries();
const xml = buildSitemap(entries);
await writeFile(OUT_PATH, xml);
console.log(`wrote ${OUT_PATH} (${entries.length + 1} urls)`);
