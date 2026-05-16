import { Meta } from "@solidjs/meta";
import { NotFound } from "~/components/NotFound";

export default function NotFoundRoute() {
  return (
    <main class="max-w-screen-md mx-auto px-4 md:px-6 lg:max-w-screen-lg">
      <Meta name="robots" content="noindex" />
      <NotFound />
    </main>
  );
}
