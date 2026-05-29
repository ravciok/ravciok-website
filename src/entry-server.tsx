// @refresh reload
import { createHandler, StartServer } from "@solidjs/start/server";
import { SITE } from "~/lib/site";
import { ucareSquare } from "~/lib/images";

const ANTI_FLASH = `(function(){try{var t=localStorage.getItem('theme');if(t!=='winter'&&t!=='dracula')t=matchMedia('(prefers-color-scheme: dark)').matches?'dracula':'winter';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

const LD_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE.url}/#website`,
      url: SITE.url,
      name: SITE.name,
      description: SITE.description,
      publisher: { "@id": `${SITE.url}/#person` },
      inLanguage: "en",
    },
    {
      "@type": "Person",
      "@id": `${SITE.url}/#person`,
      name: SITE.author,
      url: SITE.url,
      image: ucareSquare(SITE.heroId, 512),
      jobTitle: "Staff Frontend Engineer",
      description: "Writes about frontend architecture, performance, and security across modern frameworks.",
      sameAs: SITE.profiles,
    },
  ],
});

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
          <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
          <link rel="icon" href="/favicon.ico" sizes="any" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

          <script defer src="https://cloud.umami.is/script.js" data-website-id={process.env.UMAMI_ID}/>
          <script type="application/ld+json" innerHTML={LD_JSON}/>
          <script innerHTML={ANTI_FLASH}/>
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
