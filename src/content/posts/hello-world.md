---
title: Hello, world
date: 2026-04-27
excerpt: Kicking off the blog with a quick hello and a few notes about what's coming.
tags: [hello, world]
readTime: 1
bannerId: eef890aa-372b-4ba7-ae18-34852d64ac21
bannerAlt: Stunning sunrise over the rolling hills and forested valleys of Crespano del Grappa, Veneto, Italy.
bannerCredit: Photo by [Cesare Brunello](https://www.pexels.com/photo/a-scenic-view-of-a-valley-with-hills-and-grass-24643975)
---

# Hello, world

This is the first post on the new site. Static page, generated at build time
from a markdown file — `gray-matter` for frontmatter, `marked` for the body,
and [shiki](https://shiki.style) for syntax highlighting.

## Why a static blog?

Three reasons:

1. **Speed** — no server, no cold starts.
2. **Simplicity** — `pnpm build` produces a folder of HTML, CSS, and JS. That's the whole site.
3. **Portability** — any static host (GitHub Pages, Cloudflare Pages, Netlify, S3) can serve it.

## A snippet

```ts
import { marked } from "marked";
import { createHighlighter } from "shiki";

const h = await createHighlighter({
  themes: ["github-light", "github-dark"],
  langs: ["ts", "tsx", "bash"],
});

export const renderMarkdown = (raw: string) =>
  marked.parse(raw); // code blocks routed through shiki at build
```

A bit of bash too:

```bash
# build + serve
pnpm build
npx serve .output/public -p 4173
```

## Inline pieces

You can mention `inline code`, **bold**, _italic_, and link to other places
like [the Solid docs](https://docs.solidjs.com/) or
[the DaisyUI components page](https://daisyui.com/components/).

## What's next

- Posts on tooling choices: SolidStart vs Astro for this site.
- A short note on the GitHub build-time fetch.
- Probably a small CLI write-up.
