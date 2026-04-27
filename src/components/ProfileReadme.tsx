import { Show } from "solid-js";

export function ProfileReadme(props: { html: string | null }) {
  return (
    <Show when={props.html}>
      <section class="my-6">
        <article
          class="prose prose-sm md:prose-base max-w-none"
          innerHTML={props.html!}
        />
      </section>
    </Show>
  );
}
