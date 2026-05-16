import { Title } from "@solidjs/meta";
import { HttpStatusCode } from "@solidjs/start";
import { SITE } from "~/lib/site";

export function NotFound() {
  return (
    <>
      <Title>404 · {SITE.name}</Title>
      <HttpStatusCode code={404} />
      <section class="py-24 text-center flex flex-col items-center gap-4">
        <h1 class="text-6xl md:text-7xl font-bold font-mono">404</h1>
        <p class="text-lg opacity-80">Page not found.</p>
        <a href="/" class="btn btn-primary btn-soft btn-lg md:btn-md mt-2">
          <svg viewBox="0 0 24 24" class="h-5 w-5 md:h-4 md:w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to home
        </a>
      </section>
    </>
  );
}
