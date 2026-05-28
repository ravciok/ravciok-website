import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import matter from "gray-matter";
import { marked, type Token, type Tokens } from "marked";
import {
  createHighlighter,
  type HighlighterGeneric,
  type BundledLanguage,
  type BundledTheme,
} from "shiki";

const POSTS_DIR = join(process.cwd(), "src/content/posts");

const HIGHLIGHT_LANGS: BundledLanguage[] = [
  "ts",
  "tsx",
  "js",
  "jsx",
  "css",
  "html",
  "json",
  "bash",
  "shell",
  "md",
  "yaml",
  "diff",
];

let highlighterPromise: Promise<HighlighterGeneric<BundledLanguage, BundledTheme>> | null = null;

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["catppuccin-latte", "catppuccin-frappe"],
      langs: HIGHLIGHT_LANGS,
    });
  }
  return highlighterPromise;
}

export function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function lineText(node: { children?: unknown[] }): string {
  let acc = "";
  for (const child of node.children ?? []) {
    const c = child as {
      type?: string;
      value?: string;
      children?: { type?: string; value?: string }[];
    };
    if (c.type === "element" && c.children?.[0]?.type === "text") {
      acc += c.children[0].value ?? "";
    } else if (c.type === "text") {
      acc += c.value ?? "";
    }
  }
  return acc;
}

function tintDiffLine(node: { properties?: Record<string, unknown>; children?: unknown[] }) {
  const ch = lineText(node)[0];
  if (ch !== "+" && ch !== "-") return;
  const existing = (node.properties?.class as string | undefined) ?? "";
  const klass = ch === "+" ? "line-add" : "line-remove";
  node.properties = { ...(node.properties ?? {}), class: `${existing} ${klass}`.trim() };
}

const diffLineTransformer = { name: "diff-line-tint", line: tintDiffLine };

async function highlightCode(text: string, lang: string): Promise<string> {
  const trimmed = lang.trim();
  const colonIdx = trimmed.indexOf(":");
  const language = (colonIdx >= 0 ? trimmed.slice(0, colonIdx) : trimmed).toLowerCase();
  const filename = colonIdx >= 0 ? trimmed.slice(colonIdx + 1).trim() : "";
  const supported = HIGHLIGHT_LANGS.includes(language as BundledLanguage)
    ? (language as BundledLanguage)
    : null;
  const renderLang = supported ?? "text";
  const h = await getHighlighter();
  const html = h.codeToHtml(text, {
    lang: renderLang,
    themes: { light: "catppuccin-latte", dark: "catppuccin-frappe" },
    transformers: renderLang === "diff" ? [diffLineTransformer] : [],
  });
  const langBadge = supported
    ? `<span class="code-lang" aria-hidden="true">${escapeHtml(supported)}</span>`
    : "";
  const fileBadge = filename
    ? `<span class="code-file">${escapeHtml(filename)}</span>`
    : "";
  return `<div class="code-block" data-lang="${renderLang}">${langBadge}${fileBadge}${html}</div>`;
}

const INTERNAL_HOST = /^https?:\/\/(?:[^/]+\.)?ravciok\.dev(?:\/|$)/i;

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href) && !INTERNAL_HOST.test(href);
}

marked.setOptions({ gfm: true, breaks: false });
marked.use({
  renderer: {
    code(token: Tokens.Code) {
      const cached = (token as Tokens.Code & { highlighted?: string }).highlighted;
      if (cached) return cached;
      return `<pre><code>${escapeHtml(token.text)}</code></pre>`;
    },
    heading(this: { parser: { parseInline: (tokens: Token[]) => string } }, token: Tokens.Heading) {
      const t = token as Tokens.Heading & { slug?: string };
      const inline = this.parser.parseInline(t.tokens);
      const id = t.slug ? ` id="${t.slug}"` : "";
      return `<h${t.depth}${id}>${inline}</h${t.depth}>\n`;
    },
    link(this: { parser: { parseInline: (tokens: Token[]) => string } }, token: Tokens.Link) {
      const href = token.href ?? "";
      const inner = this.parser.parseInline(token.tokens);
      const titleAttr = token.title ? ` title="${escapeHtml(token.title)}"` : "";
      const external = isExternalHref(href);
      const extra = external ? ` class="external" rel="noopener noreferrer"` : "";
      return `<a href="${escapeHtml(href)}"${titleAttr}${extra}>${inner}</a>`;
    },
  },
});

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  readTime: number;
}

export interface TocEntry {
  depth: number;
  text: string;
  slug: string;
}

export interface PostBanner {
  id: string;
  alt: string;
  credit: string;
}

export interface Post extends PostMeta {
  html: string;
  toc: TocEntry[];
  banner: PostBanner | null;
  updated: string | null;
}

function stripMdLinks(s: string): string {
  return s.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

function parseBanner(data: Record<string, unknown>): PostBanner | null {
  const id = typeof data.bannerId === "string" ? data.bannerId.trim() : "";
  if (!id) return null;
  const alt = typeof data.bannerAlt === "string" ? data.bannerAlt : "";
  const creditRaw = typeof data.bannerCredit === "string" ? data.bannerCredit : "";
  const credit = creditRaw ? stripMdLinks(creditRaw) : "";
  return { id, alt, credit };
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[`*_~]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function buildToc(tokens: Token[]): TocEntry[] {
  const toc: TocEntry[] = [];
  const seen = new Map<string, number>();
  for (const t of tokens) {
    if (t.type !== "heading") continue;
    const h = t as Tokens.Heading & { slug?: string };
    if (h.depth < 2 || h.depth > 3) continue;
    const cleanText = h.text.replace(/[`*_~]/g, "").trim();
    let s = slugify(cleanText) || `section-${toc.length + 1}`;
    const count = seen.get(s) ?? 0;
    seen.set(s, count + 1);
    if (count > 0) s = `${s}-${count + 1}`;
    h.slug = s;
    toc.push({ depth: h.depth, text: cleanText, slug: s });
  }
  return toc;
}

async function highlightAllCode(tokens: Token[]): Promise<void> {
  for (const t of tokens) {
    if (t.type === "code") {
      const c = t as Tokens.Code & { highlighted?: string };
      c.highlighted = await highlightCode(c.text, c.lang ?? "");
    }
    const nested = (t as { tokens?: Token[] }).tokens;
    if (Array.isArray(nested)) await highlightAllCode(nested);
  }
}

const WORDS_PER_MINUTE = 200;

function estimateReadTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

function resolveReadTime(data: Record<string, unknown>, content: string): number {
  const raw = data.readTime;
  const n = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : estimateReadTime(content);
}

export async function listPosts(): Promise<PostMeta[]> {
  const files = (await readdir(POSTS_DIR)).filter(
    (f) => f.endsWith(".md") && !f.startsWith("_"),
  );
  const metas = await Promise.all(
    files.map(async (f) => {
      const raw = await readFile(join(POSTS_DIR, f), "utf8");
      const { data, content } = matter(raw);
      return {
        slug: f.replace(/\.md$/, ""),
        title: String(data.title ?? f),
        date: data.date instanceof Date ? data.date.toISOString() : String(data.date ?? ""),
        excerpt: String(data.excerpt ?? ""),
        readTime: resolveReadTime(data, content),
      };
    }),
  );
  return metas.sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

function stripLeadingH1(content: string, title: string): string {
  const match = content.match(/^\s*#\s+(.+?)\s*\n+/);
  if (!match) return content;
  const heading = match[1].trim().toLowerCase();
  if (heading !== title.trim().toLowerCase()) return content;
  return content.slice(match[0].length);
}

export async function getPost(slug: string): Promise<Post | null> {
  try {
    const raw = await readFile(join(POSTS_DIR, `${slug}.md`), "utf8");
    const { data, content } = matter(raw);
    const title = String(data.title ?? slug);
    const body = stripLeadingH1(content, title);
    const tokens = marked.lexer(body);
    const toc = buildToc(tokens);
    await highlightAllCode(tokens);
    const html = marked.parser(tokens);
    const updated =
      data.updated instanceof Date
        ? data.updated.toISOString()
        : typeof data.updated === "string" && data.updated.trim()
          ? data.updated.trim()
          : null;
    return {
      slug,
      title,
      date: data.date instanceof Date ? data.date.toISOString() : String(data.date ?? ""),
      excerpt: String(data.excerpt ?? ""),
      readTime: resolveReadTime(data, body),
      html,
      toc,
      banner: parseBanner(data),
      updated,
    };
  } catch {
    return null;
  }
}
