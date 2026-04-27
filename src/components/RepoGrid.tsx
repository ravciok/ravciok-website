import { For, Show } from "solid-js";
import type { GitHubRepo } from "~/lib/github.types";

const fmt = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export function RepoGrid(props: { repos: GitHubRepo[]; limit?: number }) {
  const items = () => props.repos.slice(0, props.limit ?? 4);

  return (
    <section class="my-8">
      <h2 class="text-xl md:text-2xl font-bold mb-4">Top repos</h2>
      <Show when={items().length > 0} fallback={<p class="opacity-70">No repos to show.</p>}>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <For each={items()}>
            {(repo) => (
              <a
                href={repo.html_url}
                class="card bg-base-200 hover:bg-base-300 transition-colors"
              >
                <div class="card-body">
                  <h3 class="card-title text-lg break-words">{repo.name}</h3>
                  <Show when={repo.description}>
                    <p class="text-sm opacity-90 break-words">{repo.description}</p>
                  </Show>
                  <div class="flex flex-wrap gap-2 mt-2">
                    <Show when={repo.language}>
                      <span class="badge badge-outline badge-sm">{repo.language}</span>
                    </Show>
                    <Show when={repo.stargazers_count > 0}>
                      <span class="badge badge-ghost badge-sm">★ {repo.stargazers_count}</span>
                    </Show>
                    <span class="badge badge-ghost badge-sm font-mono" title={repo.pushed_at}>
                      {fmt.format(new Date(repo.pushed_at))}
                    </span>
                  </div>
                </div>
              </a>
            )}
          </For>
        </div>
      </Show>
    </section>
  );
}
