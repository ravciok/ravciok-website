// @refresh reload
import { createHandler, StartServer } from "@solidjs/start/server";
import { getRequestEvent } from "solid-js/web";


const ANTI_FLASH = `(function(){try{var t=localStorage.getItem('theme');if(t!=='winter'&&t!=='dracula')t=matchMedia('(prefers-color-scheme: dark)').matches?'dracula':'winter';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default createHandler(() => {
  const nonce = (getRequestEvent()?.locals as { nonce?: string } | undefined)?.nonce;
  return (
    <StartServer
      document={({ assets, children, scripts }) => (
        <html lang="en">
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link
              rel="icon"
              type="image/svg+xml"
              href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%23570df8'/%3E%3Ctext x='50%25' y='24' text-anchor='middle' font-family='system-ui,sans-serif' font-size='24' font-weight='700' fill='white'%3Er%3C/text%3E%3C/svg%3E"
            />

            <script nonce={nonce} defer src="https://cloud.umami.is/script.js" data-website-id={process.env.UMAMI_ID} />
            <script nonce={nonce} innerHTML={ANTI_FLASH} />
            {assets}
          </head>
          <body class="min-h-screen bg-base-100 text-base-content">
            <div id="app">{children}</div>
            {scripts}
          </body>
        </html>
      )}
    />
  );
});
