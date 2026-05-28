import { Show, Suspense } from "solid-js";
import { createAsync, useParams } from "@solidjs/router";
import { Link, Meta, Title } from "@solidjs/meta";
import { getPost } from "~/lib/posts";
import { ucareCrop, ucareResize } from "~/lib/images";
import { Comments } from "~/components/Comments";
import { TableOfContents } from "~/components/TableOfContents";
import { NotFound } from "~/components/NotFound";
import { BackFab } from "~/components/BackFab";
import { CodeCopy } from "~/components/CodeCopy";
import { HeadingAnchors } from "~/components/HeadingAnchors";
import { SITE } from "~/lib/site";

const FALLBACK_OG_IMAGE = ucareResize(SITE.heroId, 1200, 630);

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
              <Meta name="twitter:title" content={p().title} />
              <Meta name="twitter:description" content={p().excerpt} />
              <Meta name="twitter:card" content="summary_large_image" />
              {(() => {
                const b = p().banner;
                const img = b ? ucareCrop(b.id, 1200, 630, 'bottom') : FALLBACK_OG_IMAGE;
                const alt = b ? b.alt : `${SITE.author} portrait`;
                const ldJson = JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "BlogPosting",
                  headline: p().title,
                  description: p().excerpt,
                  image: img,
                  datePublished: p().date,
                  ...(p().updated ? { dateModified: p().updated } : {}),
                  author: { "@id": `${SITE.url}/#person` },
                  publisher: { "@id": `${SITE.url}/#person` },
                  isPartOf: { "@id": `${SITE.url}/#website` },
                  mainEntityOfPage: url,
                }).replace(/</g, "\\u003c");
                const breadcrumbJson = JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "BreadcrumbList",
                  itemListElement: [
                    { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
                    { "@type": "ListItem", position: 2, name: p().title, item: url },
                  ],
                }).replace(/</g, "\\u003c");
                return (
                  <>
                    <Meta property="og:image" content={img} />
                    <Meta property="og:image:width" content="1200" />
                    <Meta property="og:image:height" content="630" />
                    <Meta property="og:image:alt" content={alt} />
                    <Meta name="twitter:image" content={img} />
                    <Meta name="twitter:image:alt" content={alt} />
                    <script type="application/ld+json" innerHTML={ldJson} />
                    <script type="application/ld+json" innerHTML={breadcrumbJson} />
                  </>
                );
              })()}
              <div class="min-w-0">
                <article class="prose leading-loose max-w-none py-8 md:py-12">
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
                        src={ucareCrop(b().id, 1280, 720, 'bottom')}
                        srcset={`${ucareCrop(b().id, 640, 360, 'bottom')} 640w, ${ucareCrop(b().id, 960, 540, 'bottom')} 960w, ${ucareCrop(b().id, 1280, 720,'bottom')} 1280w, ${ucareCrop(b().id, 1920, 1080,'bottom')} 1920w`}
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
