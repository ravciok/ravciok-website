import { createMiddleware } from "@solidjs/start/middleware";
import { randomBytes } from "crypto";

const isProd = import.meta.env.PROD;

export default createMiddleware({
  onRequest: event => {
    const nonce = randomBytes(16).toString("base64");

    if (isProd) {
      event.locals.nonce = nonce;
    }

    // Notes:
    // 1. SolidStart serializes data via `eval` — requires 'unsafe-eval' in script-src.
    //    https://github.com/solidjs/solid-start/issues/1825
    // 2. Vite inlines small CSS as <style> in dev — needs 'unsafe-inline' in style-src (dev).
    // 3. Vite inlines small assets as data: URLs — needs `data:` in img-src/font-src.
    //    https://vite.dev/config/build-options.html#build-assetsinlinelimit
    // 4. Shiki renders syntax highlighting via inline `style` attributes — 'unsafe-inline'
    //    on style-src is the pragmatic strict-CSP compromise (per Google's strict CSP guide).
    // 5. With 'strict-dynamic', host allowlists in script-src are ignored — only
    //    nonce-attributed scripts and what they load are allowed. Any manual <script>
    //    tag in entry-server.tsx MUST carry the nonce (event.locals.nonce).
    // 6. img-src allows *.githubusercontent.com for avatars, user-images, and the
    //    Camo proxy used by the rendered profile README.
    // 7. frame-src whitelists giscus.app for the comments iframe.
    // 8. connect-src whitelists cloud.umami.is so the analytics script can POST events.

    const csp = [
      `default-src 'self'`,
      `script-src ${
        isProd
          ? `'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval'`
          : `'self' 'unsafe-inline' 'unsafe-eval' https: http:`
      }`,
      `style-src 'self' 'unsafe-inline'`,
      `img-src 'self' data: https://*.githubusercontent.com`,
      `font-src 'self' data:`,
      `connect-src ${
        isProd
          ? `'self' https://cloud.umami.is`
          : `'self' https://cloud.umami.is ws: wss: http: https:`
      }`,
      `frame-src https://giscus.app`,
      `frame-ancestors 'none'`,
      `form-action 'self'`,
      `base-uri 'none'`,
      `object-src 'none'`,
      isProd ? `upgrade-insecure-requests` : null,
    ]
      .filter(Boolean)
      .join("; ");

    event.response.headers.set("Content-Security-Policy", csp);
  }
});
