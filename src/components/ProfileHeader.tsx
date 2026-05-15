import { For, Show } from "solid-js";
import type { GitHubUser, SocialAccount } from "~/lib/github.types";

const PROVIDER_LABEL: Record<string, string> = {
  linkedin: "LinkedIn",
  mastodon: "Mastodon",
  youtube: "YouTube",
  twitch: "Twitch",
  instagram: "Instagram",
  facebook: "Facebook",
  reddit: "Reddit",
  hometown: "Hometown",
  twitter: "Twitter",
  generic: "Website",
};

function labelForProvider(p: string) {
  return PROVIDER_LABEL[p] ?? p.charAt(0).toUpperCase() + p.slice(1);
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" class="h-5 w-5 md:h-4 md:w-4 fill-current" aria-hidden="true">
      <path d="M12 .5C5.73.5.75 5.48.75 11.75c0 4.96 3.22 9.16 7.69 10.65.56.1.77-.24.77-.54v-1.9c-3.13.68-3.79-1.51-3.79-1.51-.51-1.31-1.25-1.66-1.25-1.66-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 1.72 2.63 1.22 3.27.93.1-.73.39-1.22.71-1.5-2.5-.28-5.13-1.25-5.13-5.57 0-1.23.44-2.24 1.16-3.03-.12-.28-.5-1.43.11-2.99 0 0 .95-.3 3.1 1.16.9-.25 1.86-.37 2.82-.38.96.01 1.92.13 2.82.38 2.15-1.46 3.1-1.16 3.1-1.16.61 1.56.23 2.71.11 2.99.72.79 1.16 1.8 1.16 3.03 0 4.33-2.63 5.28-5.14 5.56.4.35.76 1.02.76 2.06v3.06c0 .3.2.65.78.54 4.46-1.49 7.68-5.69 7.68-10.65C23.25 5.48 18.27.5 12 .5Z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" class="h-5 w-5 md:h-4 md:w-4 fill-current" aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13Zm1.78 13.02H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0Z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24" class="h-5 w-5 md:h-4 md:w-4 fill-current" aria-hidden="true">
      <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4-8 5-8-5V6l8 5 8-5v2Z" />
    </svg>
  );
}

function ProviderIcon(props: { provider: string }) {
  return (
    <Show when={props.provider === "linkedin"}>
      <LinkedInIcon />
    </Show>
  );
}

function sized(rawUrl: string, size: number): string {
  const url = new URL(rawUrl);
  url.searchParams.set("s", String(size));
  return url.toString();
}

export function ProfileHeader(props: { user: GitHubUser; socialAccounts: SocialAccount[] }) {
  const u = () => props.user;
  const url = u().avatar_url

  return (
    <section class="my-8">
      <div class="flex flex-col md:flex-row gap-6 items-start text-left">
        <div class="avatar shrink-0">
          <div class="w-40 md:w-32 rounded-full">
            <img
              src={sized(url,320)}
              srcset={`${sized(url,160)} 1x, ${sized(url,320)} 2x`}
              alt={`${u().name} avatar`}
              width="160"
              height="160"
              fetchpriority="high"
              decoding="async"
            />
          </div>
        </div>

        <div class="flex flex-col gap-3 items-start">
          <div>
            <h1 class="text-3xl md:text-4xl font-bold leading-tight text-primary">
              {u().name}
            </h1>

            <p class="tracking-widest opacity-70">@{u().login}</p>
          </div>

          <Show when={u().bio}>
            <p class="opacity-90 max-w-prose">{u().bio}</p>
          </Show>

          <div class="flex flex-wrap gap-x-4 gap-y-1">
            <a class="btn btn-circle btn-lg md:btn-md btn-soft btn-secondary" href={u().html_url} aria-label="github">
              <GitHubIcon />
            </a>

            <For each={props.socialAccounts}>
              {(s) => (
                <a class="btn btn-circle btn-lg md:btn-md btn-soft btn-secondary" href={s.url} aria-label={s.provider}>
                  <ProviderIcon provider={s.provider} />
                </a>
              )}
            </For>

            <Show when={u().email}>
              <a
                  class="btn btn-circle btn-lg md:btn-md btn-soft btn-secondary"
                  href={`mailto:${u().email}`}
                  aria-label="email"
              >
                <EmailIcon />
              </a>
            </Show>
          </div>
        </div>
      </div>
    </section>
  );
}
