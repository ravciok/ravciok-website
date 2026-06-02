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
    <section class="my-16">
      <h2 class="text-base md:text-lg font-semibold uppercase tracking-widest opacity-70 mb-4">Field notes</h2>
      <Show
        when={props.posts.length > 0}
        fallback={<p class="opacity-70">No posts yet.</p>}
      >
        <div class="flex flex-col gap-4">
          <For each={props.posts}>
            {(p, i) => (
              <a
                href={`/blog/${p.slug}`}
                class="group card touch-manipulation bg-secondary-content/30 ring-0 ring-offset-base-100 hover:ring-2 hover:ring-secondary/80 hover:ring-offset-4 active:bg-secondary-content/50 transition-all"
              >
                <div class="card-body">
                  <div class="text-xs opacity-70 flex items-center gap-2">
                    <Show when={p.date}>
                      <time datetime={p.date}>{formatDate(p.date)}</time>
                    </Show>
                    <Show when={p.date && p.readTime}>
                      <span aria-hidden="true">·</span>
                    </Show>
                    <Show when={p.readTime}>
                      <span>{p.readTime} min</span>
                    </Show>
                  </div>
                  <h3 class="card-title relative text-lg leading-snug break-words transition-colors group-hover:text-secondary/80">
                    <Show when={i() === 0}>
                      <span class="absolute -left-4 top-[0.5lh] flex size-2 -translate-y-1/2" aria-label="Latest post">
                        <span class="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
                        <span class="relative inline-flex size-2 rounded-full bg-primary" />
                      </span>
                    </Show>
                    {p.title}
                  </h3>
                  <Show when={p.excerpt}>
                    <p class="text-sm md:text-base opacity-80">{p.excerpt}</p>
                  </Show>
                </div>
              </a>
            )}
          </For>
        </div>
      </Show>
    </section>
  );
}
