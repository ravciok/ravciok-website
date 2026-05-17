import { Show, Suspense } from "solid-js";
import { createAsync, query } from "@solidjs/router";
import { Link, Meta } from "@solidjs/meta";
import { loadGitHub } from "~/lib/github";
import { listPosts } from "~/lib/posts";
import { ProfileHeader } from "~/components/ProfileHeader";
import { ProfileReadme } from "~/components/ProfileReadme";
import { RepoGrid } from "~/components/RepoGrid";
import { BlogList } from "~/components/BlogList";
import { SITE } from "~/lib/site";
import { ucareCrop } from "~/lib/images";

const HOME_OG_IMAGE = ucareCrop(SITE.heroId, 1200, 630);

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
      <Meta property="og:image" content={HOME_OG_IMAGE} />
      <Meta property="og:image:width" content="1200" />
      <Meta property="og:image:height" content="630" />
      <Meta property="og:image:alt" content={`${SITE.author} portrait`} />
      <Meta name="twitter:card" content="summary_large_image" />
      <Meta name="twitter:title" content={SITE.name} />
      <Meta name="twitter:description" content={SITE.description} />
      <Meta name="twitter:image" content={HOME_OG_IMAGE} />
      <Meta name="twitter:image:alt" content={`${SITE.author} portrait`} />
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
