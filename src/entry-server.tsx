// @refresh reload
import { createHandler, StartServer } from "@solidjs/start/server";

const ANTI_FLASH = `(function(){try{var t=localStorage.getItem('theme');if(t!=='winter'&&t!=='dracula')t=matchMedia('(prefers-color-scheme: dark)').matches?'dracula':'winter';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
          <meta name="theme-color" content="#282a36" media="(prefers-color-scheme: dark)" />
          <link rel="preconnect" href="https://5qcsm3rhzn.ucarecd.net" crossorigin="anonymous" />
          <link rel="alternate" type="application/rss+xml" title="Rafał Ciok" href="/feed.xml" />
          <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
          <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.svg" />

          <script defer src="https://cloud.umami.is/script.js" data-website-id={process.env.UMAMI_ID} />
          <script innerHTML={ANTI_FLASH} />
          {assets}
        </head>
        <body class="min-h-screen bg-base-100 text-base-content">
          <div id="app">{children}</div>
          {scripts}
        </body>
      </html>
    )}
  />
));
