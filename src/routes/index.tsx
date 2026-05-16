import { Show, Suspense } from "solid-js";
import { createAsync, query } from "@solidjs/router";
import { Link, Meta } from "@solidjs/meta";
import { loadGitHub } from "~/lib/github";
import { listPosts } from "~/lib/posts";
import { ProfileHeader } from "~/components/ProfileHeader";
import { ProfileReadme } from "~/components/ProfileReadme";
import { RepoGrid } from "~/components/RepoGrid";
import { BlogList } from "~/components/BlogList";
import { JsonLd } from "~/components/JsonLd";
import { SITE } from "~/lib/site";

const getHomeData = query(async () => {
  "use server";
  const [gh, posts] = await Promise.all([loadGitHub(), listPosts()]);
  return { gh, posts };
}, "home");

export const route = {
  preload: () => getHomeData(),
};

export default function Home() {
  const data = createAsync(() => getHomeData(), { deferStream: true });

  return (
    <main class="max-w-screen-md mx-auto px-4 md:px-6 lg:max-w-screen-lg">
      <Link rel="canonical" href={SITE.url} />
      <Meta name="description" content={SITE.description} />
      <Meta property="og:type" content="website" />
      <Meta property="og:title" content={SITE.name} />
      <Meta property="og:description" content={SITE.description} />
      <Meta property="og:url" content={SITE.url} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          url: SITE.url,
          name: SITE.name,
          description: SITE.description,
          author: { "@id": `${SITE.url}/#person` },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          "@id": `${SITE.url}/#person`,
          name: SITE.author,
          url: SITE.url,
          sameAs: SITE.profiles,
        }}
      />
      <Suspense
        fallback={
          <div class="py-12 text-center">
            <span class="loading loading-spinner" />
          </div>
        }
      >
        <Show when={data()}>
          {(d) => (
            <>
              <ProfileHeader user={d().gh.user} socialAccounts={d().gh.socialAccounts} />

              <ProfileReadme html={d().gh.profileReadmeHtml} />

              <RepoGrid repos={d().gh.repos} limit={4} />

              <BlogList posts={d().posts} />
            </>
          )}
        </Show>
      </Suspense>
    </main>
  );
}
