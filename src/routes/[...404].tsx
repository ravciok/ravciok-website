import { Title } from "@solidjs/meta";
import { HttpStatusCode } from "@solidjs/start";
import { A } from "@solidjs/router";
import { ThemeToggle } from "~/components/ThemeToggle";

export default function NotFound() {
  return (
    <main class="max-w-screen-md mx-auto px-4 md:px-6 lg:max-w-screen-lg">
      <Title>404 · ~/ravciok.dev</Title>
      <HttpStatusCode code={404} />

      <nav class="navbar bg-base-100 sticky top-0 z-10">
        <div class="flex-1 font-mono text-sm">~/ravciok.dev</div>
        <div class="flex-none">
          <ThemeToggle />
        </div>
      </nav>

      <section class="py-24 text-center flex flex-col items-center gap-4">
        <h1 class="text-6xl md:text-7xl font-bold font-mono">404</h1>
        <p class="text-lg opacity-80">Page not found.</p>
        <p class="font-mono text-sm opacity-60">cd ~/ravciok.dev # try again</p>
        <A href="/" class="btn btn-primary mt-2">
          ← Back home
        </A>
      </section>
    </main>
  );
}
