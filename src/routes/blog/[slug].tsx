import { Show, Suspense } from "solid-js";
import { createAsync, query, useParams } from "@solidjs/router";
import { Title } from "@solidjs/meta";
import { getPost } from "~/lib/posts";
import { Comments } from "~/components/Comments";
import { TableOfContents } from "~/components/TableOfContents";
import { NotFound } from "~/components/NotFound";
import { BackFab } from "~/components/BackFab";

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
    <main class="max-w-screen-md lg:max-w-screen-lg mx-auto px-4 md:px-6 lg:grid lg:grid-cols-[1fr_14rem] lg:gap-12">
      <Suspense
        fallback={
          <div class="py-12 text-center lg:col-span-2">
            <span class="loading loading-spinner" />
          </div>
        }
      >
        <Show
          when={post()}
          fallback={<div class="lg:col-span-2"><NotFound /></div>}
        >
          {(p) => (
            <>
              <Title>{p().title}</Title>
              <div class="min-w-0">
                <article class="prose prose-sm md:prose-base lg:prose-lg max-w-none py-8 md:py-12">
                  <header id="post-header" class="mb-12 not-prose">
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
                <section id="post-end" class="my-12">
                  <Comments />
                </section>
              </div>
              <aside class="hidden lg:block py-8 md:py-12">
                <TableOfContents toc={p().toc} />
              </aside>
              <BackFab endSelector="#post-end" />
            </>
          )}
        </Show>
      </Suspense>
    </main>
  );
}
