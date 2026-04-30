// @refresh reload
import { createHandler, StartServer } from "@solidjs/start/server";

const ANTI_FLASH = `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='night')t=matchMedia('(prefers-color-scheme: dark)').matches?'night':'light';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

const GTAG_SOURCE = `https://www.googletagmanager.com/gtag/js?id=${process.env.GOOGLE_TAG}`;
const GTAG_SCRIPT= `(function(){window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments)}; gtag('js', new Date());gtag('config', '${process.env.GOOGLE_TAG}'); })();`;

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang="en">
        <head>
          <script async src={GTAG_SOURCE} />
          <script innerHTML={GTAG_SCRIPT} />
          <script defer src="https://cloud.umami.is/script.js" data-website-id={process.env.UMAMI_ID}></script>

          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="description" content="Personal site." />
          <link
            rel="icon"
            href="data:image/svg+xml,%3Csvg xmlns='https://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ctext y='26' font-size='28'%3E~%3C/text%3E%3C/svg%3E"
          />

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
