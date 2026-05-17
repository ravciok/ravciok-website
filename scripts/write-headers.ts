import { createHash } from "node:crypto";
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";

const OUT_DIR = join(process.cwd(), ".output", "public");
const HEADERS_PATH = join(OUT_DIR, "_headers");

const INLINE_SCRIPT_RE = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;

async function walkHtml(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await walkHtml(full)));
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      out.push(full);
    }
  }
  return out;
}

async function collectInlineScriptHashes(): Promise<string[]> {
  const files = await walkHtml(OUT_DIR);
  const hashes = new Set<string>();
  for (const file of files) {
    const html = await readFile(file, "utf8");
    for (const match of html.matchAll(INLINE_SCRIPT_RE)) {
      const body = match[1];
      if (!body) continue;
      hashes.add(createHash("sha256").update(body).digest("base64"));
    }
  }
  return [...hashes].sort();
}

function buildCsp(scriptHashes: string[]): string {
  const hashList = scriptHashes.map(h => `'sha256-${h}'`).join(" ");
  return [
    `default-src 'self'`,
    `script-src 'self' ${hashList} https://cloud.umami.is`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: https://5qcsm3rhzn.ucarecd.net`,
    `font-src 'self' data:`,
    `connect-src 'self' https://cloud.umami.is https://api-gateway.umami.dev`,
    `frame-src https://giscus.app`,
    `frame-ancestors 'none'`,
    `form-action 'self'`,
    `base-uri 'none'`,
    `object-src 'none'`,
    `upgrade-insecure-requests`,
  ].join("; ");
}

const hashes = await collectInlineScriptHashes();
const csp = buildCsp(hashes);

const headers = `/*
  Content-Security-Policy: ${csp}
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Resource-Policy: same-origin
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()

/_build/assets/*
  cache-control: public, immutable, max-age=31536000

/feed.xml
  Content-Type: application/rss+xml; charset=utf-8

/sitemap.xml
  Content-Type: application/xml; charset=utf-8
`;

await writeFile(HEADERS_PATH, headers);
console.log(`wrote ${HEADERS_PATH} with ${hashes.length} inline script hashes`);
