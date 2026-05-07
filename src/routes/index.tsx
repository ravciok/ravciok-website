import { Show, Suspense } from "solid-js";
import { createAsync, query } from "@solidjs/router";
import { loadGitHub } from "~/lib/github";
import { listPosts } from "~/lib/posts";
import { ProfileHeader } from "~/components/ProfileHeader";
import { ProfileReadme } from "~/components/ProfileReadme";
import { RepoGrid } from "~/components/RepoGrid";
import { BlogList } from "~/components/BlogList";

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
