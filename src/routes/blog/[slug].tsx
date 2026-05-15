import { Show, Suspense } from "solid-js";
import { createAsync, query, useParams } from "@solidjs/router";
import {Meta, Title} from "@solidjs/meta";
import { getPost } from "~/lib/posts";
import { Comments } from "~/components/Comments";
import { TableOfContents } from "~/components/TableOfContents";
import { NotFound } from "~/components/NotFound";

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
    <main class="max-w-screen-md mx-auto px-4 md:px-6">
      <Suspense
        fallback={
          <div class="py-12 text-center">
            <span class="loading loading-spinner" />
          </div>
        }
      >
        <Show
          when={post()}
          fallback={<NotFound />}
        >
          {(p) => (
            <>
              <Title>{p().title}</Title>
              <TableOfContents toc={p().toc} />
              <article class="prose prose-sm md:prose-base lg:prose-lg py-8 md:py-12">
                <header class="mb-12 not-prose">
                  <a href="/" class="btn btn-ghost btn-lg md:btn-md mb-12">
                    <svg viewBox="0 0 24 24" class="h-5 w-5 md:h-4 md:w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Back to home
                  </a>
                  <h1 class="text-blog-title font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {p().title}
                  </h1>
                  <div class="text-sm opacity-70 flex items-center gap-2">
                    <Show when={p().date}>
                      <time datetime={p().date}>{formatDate(p().date)}</time>
                    </Show>
                    <Show when={p().date && p().readTime}>
                      <span aria-hidden="true">·</span>
                    </Show>
                    <Show when={p().readTime}>
                      <span>{p().readTime} min read</span>
                    </Show>
                  </div>
                </header>
                <div innerHTML={p().html} />
              </article>
              <section class="my-12">
                <Comments />
              </section>
            </>
          )}
        </Show>
      </Suspense>
    </main>
  );
}
