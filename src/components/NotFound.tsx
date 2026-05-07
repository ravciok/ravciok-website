import { Title } from "@solidjs/meta";
import { HttpStatusCode } from "@solidjs/start";

export function NotFound() {
  return (
    <>
      <Title>404 · ~/ravciok.dev</Title>
      <HttpStatusCode code={404} />
      <section class="py-24 text-center flex flex-col items-center gap-4">
        <h1 class="text-6xl md:text-7xl font-bold font-mono">404</h1>
        <p class="text-lg opacity-80">Page not found.</p>
        <p class="font-mono text-sm opacity-60">cd ~/ravciok.dev # try again</p>
        <a href="/" class="btn btn-primary btn-soft mt-2">
          ← Back to home
        </a>
      </section>
    </>
  );
}
