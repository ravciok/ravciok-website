import { writeFile } from "node:fs/promises";
import { join } from "node:path";

const OUT_DIR = join(process.cwd(), ".output", "public");
const HEADERS_PATH = join(OUT_DIR, "_headers");

const csp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline' https://cloud.umami.is`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: https://5qcsm3rhzn.ucarecd.net`,
  `font-src 'self' data:`,
  `connect-src 'self' https://cloud.umami.is https://api-gateway.umami.dev https://gateway.umami.is`,
  `frame-src https://giscus.app`,
  `frame-ancestors 'none'`,
  `form-action 'self'`,
  `base-uri 'none'`,
  `object-src 'none'`,
  `upgrade-insecure-requests`,
].join("; ");

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
console.log(`wrote ${HEADERS_PATH}`);
