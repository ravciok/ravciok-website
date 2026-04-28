import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import matter from "gray-matter";
import { marked, type Tokens } from "marked";
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

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function highlightCode(text: string, lang: string): Promise<string> {
  const language = lang.trim().toLowerCase();
  const supported = HIGHLIGHT_LANGS.includes(language as BundledLanguage)
    ? (language as BundledLanguage)
    : null;
  if (!supported) {
    return `<pre><code>${escapeHtml(text)}</code></pre>`;
  }
  const h = await getHighlighter();
  return h.codeToHtml(text, {
    lang: supported,
    themes: { light: "catppuccin-latte", dark: "catppuccin-frappe" },
  });
}

marked.setOptions({ gfm: true, breaks: false });
marked.use({
  async: true,
  walkTokens: async (token) => {
    if (token.type === "code") {
      const t = token as Tokens.Code & { highlighted?: string };
      t.highlighted = await highlightCode(t.text, t.lang ?? "");
    }
  },
  renderer: {
    code(token: Tokens.Code) {
      const cached = (token as Tokens.Code & { highlighted?: string }).highlighted;
      if (cached) return cached;
      return `<pre><code>${escapeHtml(token.text)}</code></pre>`;
    },
  },
});

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
}

export interface Post extends PostMeta {
  html: string;
}

export async function listPosts(): Promise<PostMeta[]> {
  const files = (await readdir(POSTS_DIR)).filter((f) => f.endsWith(".md"));
  const metas = await Promise.all(
    files.map(async (f) => {
      const raw = await readFile(join(POSTS_DIR, f), "utf8");
      const { data } = matter(raw);
      return {
        slug: f.replace(/\.md$/, ""),
        title: String(data.title ?? f),
        date: data.date instanceof Date ? data.date.toISOString() : String(data.date ?? ""),
        excerpt: String(data.excerpt ?? ""),
      };
    }),
  );
  return metas.sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export async function getPost(slug: string): Promise<Post | null> {
  try {
    const raw = await readFile(join(POSTS_DIR, `${slug}.md`), "utf8");
    const { data, content } = matter(raw);
    const html = await marked.parse(content);
    return {
      slug,
      title: String(data.title ?? slug),
      date: data.date instanceof Date ? data.date.toISOString() : String(data.date ?? ""),
      excerpt: String(data.excerpt ?? ""),
      html,
    };
  } catch {
    return null;
  }
}
