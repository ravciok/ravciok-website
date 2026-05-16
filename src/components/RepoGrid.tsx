import { For, Show } from "solid-js";
import type { GitHubRepo } from "~/lib/github.types";

export function RepoGrid(props: { repos: GitHubRepo[]; limit?: number }) {
  const items = () => props.repos.slice(0, props.limit ?? 4);

  return (
    <section class="my-16">
      <h2 class="text-base md:text-lg font-semibold uppercase tracking-widest opacity-70 mb-4">Playground</h2>
      <Show when={items().length > 0} fallback={<p class="opacity-70">No repos to show.</p>}>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <For each={items()}>
            {(repo) => (
              <div class="group card bg-secondary-content/30 ring-0 hover:ring-2 hover:ring-secondary/80 active:bg-secondary-content/50 transition-all relative">
                <a
                  href={repo.html_url}
                  class="absolute inset-0 z-0 rounded-[inherit]"
                  aria-label={repo.name}
                />
                <div class="card-body pointer-events-none">
                  <div class="flex items-center">
                    <h3 class="card-title text-lg break-words transition-colors group-hover:text-secondary/80">
                      {repo.name}
                    </h3>
                    <Show when={repo.homepage}>
                      <a
                        href={repo.homepage!}
                        class="btn btn-soft btn-accent btn-xs ml-3 relative z-10 pointer-events-auto"
                      >
                        🚀 Live
                      </a>
                    </Show>
                  </div>

                  <Show when={repo.description}>
                    <p class="text-sm opacity-80 break-words">{repo.description}</p>
                  </Show>
                  <div class="flex flex-wrap gap-2 mt-2">
                    <Show when={repo.language}>
                      <span class="badge bg-secondary-content/50">{repo.language}</span>
                    </Show>
                    <Show when={repo.stargazers_count > 0}>
                      <span class="badge bg-secondary-content/50">★ {repo.stargazers_count}</span>
                    </Show>
                  </div>
                </div>
              </div>
            )}
          </For>
        </div>
      </Show>
    </section>
  );
}
