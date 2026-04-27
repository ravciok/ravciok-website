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

export function ProfileHeader(props: { user: GitHubUser; socialAccounts: SocialAccount[] }) {
  const u = () => props.user;
  return (
    <section class="my-8">
      <div class="flex flex-col md:flex-row gap-6 items-start text-left">
        <div class="avatar shrink-0">
          <div class="w-24 md:w-32 rounded-full">
            <img
              src={u().avatar_url}
              alt={`${u().name ?? u().login} avatar`}
              width="128"
              height="128"
            />
          </div>
        </div>

        <div class="flex flex-col gap-3 items-start">
          <div>
            <h1 class="text-3xl md:text-4xl font-bold leading-tight">
              {u().name ?? u().login}
            </h1>
            <p class="font-mono text-sm opacity-70 mt-1">@{u().login}</p>
          </div>

          <Show when={u().bio}>
            <p class="opacity-90 max-w-prose">{u().bio}</p>
          </Show>

          <div class="flex flex-wrap gap-2">
            <Show when={u().location}>
              <span class="badge badge-outline">📍 {u().location}</span>
            </Show>
            <Show when={u().company}>
              <span class="badge badge-outline">🏢 {u().company}</span>
            </Show>
            <Show when={u().hireable}>
              <span class="badge badge-success badge-outline">Open to work</span>
            </Show>
          </div>

          <div class="flex flex-wrap gap-x-4 gap-y-1">
            <a class="link link-hover link-primary" href={u().html_url}>
              GitHub
            </a>
            <Show when={u().twitter_username}>
              <a
                class="link link-hover link-primary"
                href={`https://twitter.com/${u().twitter_username}`}
              >
                Twitter
              </a>
            </Show>
            <Show when={u().email}>
              <a class="link link-hover link-primary" href={`mailto:${u().email}`}>
                Email
              </a>
            </Show>
            <For each={props.socialAccounts}>
              {(s) => (
                <a class="link link-hover link-primary" href={s.url}>
                  {labelForProvider(s.provider)}
                </a>
              )}
            </For>
          </div>
        </div>
      </div>
    </section>
  );
}
