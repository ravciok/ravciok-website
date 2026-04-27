import { Show, Suspense } from "solid-js";
import { createAsync, query } from "@solidjs/router";
import { Title } from "@solidjs/meta";
import { loadGitHub } from "~/lib/github";
import { listPosts } from "~/lib/posts";
import { ProfileHeader } from "~/components/ProfileHeader";
import { ProfileReadme } from "~/components/ProfileReadme";
import { RepoGrid } from "~/components/RepoGrid";
import { BlogList } from "~/components/BlogList";
import { ThemeToggle } from "~/components/ThemeToggle";

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
      <Title>~/ravciok.dev</Title>
      <nav class="navbar bg-base-100 sticky top-0 z-10">
        <div class="flex-1 font-mono text-sm">~/ravciok.dev</div>
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
        <Show when={data()}>
          {(d) => (
            <>
              <ProfileHeader user={d().gh.user} socialAccounts={d().gh.socialAccounts} />

              <ProfileReadme html={d().gh.profileReadmeHtml} />

              <div class="divider" />

              <RepoGrid repos={d().gh.repos} limit={4} />

              <div class="divider" />

              <BlogList posts={d().posts} />

              <footer class="py-8 text-center text-sm opacity-60">
                © {new Date().getFullYear()} {d().gh.user.name ?? d().gh.user.login}
              </footer>
            </>
          )}
        </Show>
      </Suspense>
    </main>
  );
}
