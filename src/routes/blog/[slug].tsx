import { Show, Suspense } from "solid-js";
import { createAsync, query, useParams } from "@solidjs/router";
import { Title } from "@solidjs/meta";
import { getPost } from "~/lib/posts";
import { ThemeToggle } from "~/components/ThemeToggle";
import { Comments } from "~/components/Comments";

const getPostQuery = query(async (slug: string) => {
  "use server";
  return getPost(slug);
}, "post");

export const route = {
  preload: ({ params }: { params: { slug: string } }) => getPostQuery(params.slug),
};

const fmt = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

function formatDate(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(+d) ? iso : fmt.format(d);
}

export default function BlogPost() {
  const params = useParams<{ slug: string }>();
  const post = createAsync(() => getPostQuery(params.slug), { deferStream: true });

  return (
    <main>
      <nav class="navbar bg-base-100 sticky top-0 z-10 max-w-screen-md mx-auto px-4 md:px-6">
        <div class="flex-1">
          <a href="/" class="link link-hover">
            ← Home
          </a>
        </div>
        <div class="flex-none">
          <ThemeToggle />
        </div>
      </nav>

      <Suspense
        fallback={
          <div class="py-12 text-center">
            <span class="loading loading-spinner" />
          </div>
        }
      >
        <Show
          when={post()}
          fallback={
            <>
              <Title>Not found</Title>
              <div class="max-w-screen-md mx-auto px-4 py-12 text-center">
                <h1 class="text-2xl font-bold mb-2">Post not found</h1>
                <a href="/" class="link link-primary">
                  Back home
                </a>
              </div>
            </>
          }
        >
          {(p) => (
            <>
              <Title>{p().title}</Title>
              <article class="prose prose-sm md:prose-base lg:prose-lg max-w-screen-md mx-auto px-4 py-8 md:py-12">
                <header class="mb-6 not-prose">
                  <h1 class="text-3xl md:text-4xl font-bold">{p().title}</h1>
                  <Show when={p().date}>
                    <time class="text-sm opacity-70" datetime={p().date}>
                      {formatDate(p().date)}
                    </time>
                  </Show>
                </header>
                <div innerHTML={p().html} />
              </article>
              <section class="max-w-screen-md mx-auto px-4 my-12">
                <Comments />
              </section>
            </>
          )}
        </Show>
      </Suspense>
    </main>
  );
}
