import { Show, Suspense } from "solid-js";
import { createAsync, useParams } from "@solidjs/router";
import { Link, Meta, Title } from "@solidjs/meta";
import { getPost } from "~/lib/posts";
import { ucareCrop } from "~/lib/images";
import { Comments } from "~/components/Comments";
import { TableOfContents } from "~/components/TableOfContents";
import { NotFound } from "~/components/NotFound";
import { BackFab } from "~/components/BackFab";
import { CodeCopy } from "~/components/CodeCopy";
import { HeadingAnchors } from "~/components/HeadingAnchors";
import { JsonLd } from "~/components/JsonLd";
import { SITE } from "~/lib/site";

async function fetchPost(slug: string) {
  "use server";
  return getPost(slug);
}

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
  const post = createAsync(() => fetchPost(params.slug), { deferStream: true });

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
          {(p) => {
            const url = `${SITE.url}/blog/${params.slug}`;
            return (
            <>
              <Title>{p().title} · {SITE.name}</Title>
              <Meta name="description" content={p().excerpt} />
              <Link rel="canonical" href={url} />
              <Meta property="og:type" content="article" />
              <Meta property="og:title" content={p().title} />
              <Meta property="og:description" content={p().excerpt} />
              <Meta property="og:url" content={url} />
              <Show when={p().date}>
                <Meta property="article:published_time" content={p().date} />
              </Show>
              <Meta property="article:author" content={SITE.author} />
              <Meta name="twitter:title" content={p().title} />
              <Meta name="twitter:description" content={p().excerpt} />
              <Show when={p().banner}>
                {(b) => {
                  const ogImg = ucareCrop(b().id, 1200, 630);
                  return (
                    <>
                      <Meta property="og:image" content={ogImg} />
                      <Meta property="og:image:width" content="1200" />
                      <Meta property="og:image:height" content="630" />
                      <Meta property="og:image:alt" content={b().alt} />
                      <Meta name="twitter:card" content="summary_large_image" />
                      <Meta name="twitter:image" content={ogImg} />
                      <Meta name="twitter:image:alt" content={b().alt} />
                    </>
                  );
                }}
              </Show>
              <JsonLd
                data={{
                  "@context": "https://schema.org",
                  "@type": "Article",
                  headline: p().title,
                  description: p().excerpt,
                  datePublished: p().date,
                  author: { "@id": `${SITE.url}/#person` },
                  mainEntityOfPage: { "@type": "WebPage", "@id": url },
                  ...(p().banner && { image: ucareCrop(p().banner!.id, 1200, 630) }),
                }}
              />
              <JsonLd
                data={{
                  "@context": "https://schema.org",
                  "@type": "BreadcrumbList",
                  itemListElement: [
                    { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
                    { "@type": "ListItem", position: 2, name: p().title, item: url },
                  ],
                }}
              />
              <div class="min-w-0">
                <article class="prose prose-sm md:prose-base lg:prose-lg max-w-none py-8 md:py-12">
                  <header id="post-header" class="mb-12 not-prose">
                    <h1 class="text-3xl md:text-4xl lg:text-blog-title font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {p().title}
                    </h1>
                    <div class="text-sm md:text-base opacity-70 flex items-center gap-2">
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
                  <Show when={p().banner}>
                    {(b) => (
                      <img
                        class="not-prose mb-12 w-full h-auto rounded-lg md:-mx-4 md:w-[calc(100%+2rem)] lg:-mx-10 lg:w-[calc(100%+5rem)] max-w-none"
                        src={ucareCrop(b().id, 1280, 720)}
                        srcset={`${ucareCrop(b().id, 640, 360)} 640w, ${ucareCrop(b().id, 960, 540)} 960w, ${ucareCrop(b().id, 1280, 720)} 1280w, ${ucareCrop(b().id, 1920, 1080)} 1920w`}
                        sizes="(min-width: 1024px) 848px, (min-width: 768px) 800px, 100vw"
                        width="1280"
                        height="720"
                        alt={b().alt}
                        title={b().credit}
                        fetchpriority="high"
                        decoding="async"
                      />
                    )}
                  </Show>
                  <div innerHTML={p().html} />
                </article>
                <section id="post-end" class="mt-4 mb-12">
                  <Comments />
                </section>
              </div>
              <aside class="hidden lg:block py-8 md:py-12">
                <TableOfContents toc={p().toc} />
              </aside>
              <BackFab endSelector="#post-end" />
              <CodeCopy containerSelector="article" />
              <HeadingAnchors containerSelector="article" />
            </>
            );
          }}
        </Show>
      </Suspense>
    </main>
  );
}
