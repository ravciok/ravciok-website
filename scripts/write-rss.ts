import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import matter from "gray-matter";

const SITE_URL = "https://ravciok.dev";
const SITE_NAME = "Rafał Ciok";
const SITE_DESCRIPTION = "Frontend tradeoffs and POCs by Rafał Ciok. Architecture, performance, and security — tested in code, not slides.";
const SITE_AUTHOR_EMAIL = "me@ravciok.dev (Rafał Ciok)";

const POSTS_DIR = join(process.cwd(), "src/content/posts");
const OUT_PATH = join(process.cwd(), ".output/public/feed.xml");

interface PostEntry {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
}

function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toRfc822(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(+d)) return new Date().toUTCString();
  return d.toUTCString();
}

async function listPosts(): Promise<PostEntry[]> {
  const files = (await readdir(POSTS_DIR)).filter(
    (f) => f.endsWith(".md") && !f.startsWith("_"),
  );
  const posts = await Promise.all(
    files.map(async (f) => {
      const raw = await readFile(join(POSTS_DIR, f), "utf8");
      const { data } = matter(raw);
      return {
        slug: f.replace(/\.md$/, ""),
        title: String(data.title ?? f),
        date: data.date instanceof Date ? data.date.toISOString() : String(data.date ?? ""),
        excerpt: String(data.excerpt ?? ""),
      } satisfies PostEntry;
    }),
  );
  return posts.sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

function buildRss(posts: PostEntry[]): string {
  const lastBuild = new Date().toUTCString();
  const items = posts
    .map((p) => {
      const link = `${SITE_URL}/blog/${p.slug}`;
      return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${toRfc822(p.date)}</pubDate>
      <description>${escapeXml(p.excerpt)}</description>
    </item>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en</language>
    <managingEditor>${escapeXml(SITE_AUTHOR_EMAIL)}</managingEditor>
    <lastBuildDate>${lastBuild}</lastBuildDate>
${items}
  </channel>
</rss>
`;
}

const posts = await listPosts();
const xml = buildRss(posts);
await writeFile(OUT_PATH, xml);
console.log(`wrote ${OUT_PATH} (${posts.length} items)`);
