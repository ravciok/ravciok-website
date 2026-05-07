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
                  <a href="/" class="btn btn-ghost mb-12">
                    ← Back to home
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
