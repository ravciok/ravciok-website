import { For, Show } from "solid-js";
import type { PostMeta } from "~/lib/posts";

const fmt = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

function formatDate(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(+d) ? iso : fmt.format(d);
}

export function BlogList(props: { posts: PostMeta[] }) {
  return (
    <section class="my-8">
      <h2 class="text-xl md:text-2xl font-bold mb-4">Recent posts</h2>
      <Show
        when={props.posts.length > 0}
        fallback={<p class="opacity-70">No posts yet.</p>}
      >
        <div class="flex flex-col gap-4">
          <For each={props.posts}>
            {(p) => (
              <a
                href={`/blog/${p.slug}`}
                class="card card-side bg-base-200 hover:bg-base-300 transition-colors w-full"
              >
                <div class="card-body">
                  <div class="flex flex-col md:flex-row md:items-baseline md:justify-between gap-1">
                    <h3 class="card-title text-lg md:text-xl">{p.title}</h3>
                    <Show when={p.date}>
                      <time class="text-xs font-mono opacity-70 shrink-0" datetime={p.date}>
                        {formatDate(p.date)}
                      </time>
                    </Show>
                  </div>
                  <Show when={p.excerpt}>
                    <p class="text-sm md:text-base opacity-90 mt-1">{p.excerpt}</p>
                  </Show>
                  <div class="card-actions mt-2">
                    <span class="link link-primary text-sm">Read post →</span>
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
