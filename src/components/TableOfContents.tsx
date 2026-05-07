import { For, createSignal, onCleanup, onMount } from "solid-js";
import type { TocEntry } from "~/lib/posts";

export function TableOfContents(props: { toc: TocEntry[] }) {
  const [active, setActive] = createSignal<string>("");

  onMount(() => {
    const headings = props.toc
      .map((e) => document.getElementById(e.slug))
      .filter((h): h is HTMLElement => h !== null);

    if (headings.length === 0) return;

    const threshold = window.innerHeight * 0.3;
    let initial = props.toc[0]?.slug ?? "";
    for (const h of headings) {
      if (h.getBoundingClientRect().top <= threshold) initial = h.id;
      else break;
    }
    setActive(initial);

    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        const next = props.toc.find((e) => visible.has(e.slug));
        if (next) setActive(next.slug);
      },
      { rootMargin: "0px 0px -70% 0px", threshold: 0 },
    );

    for (const h of headings) observer.observe(h);
    onCleanup(() => observer.disconnect());
  });

  if (props.toc.length === 0) return null;

  return (
    <nav
      aria-label="Table of contents"
      class="hidden xl:block fixed top-24 right-[max(0.5rem,calc(50vw-41rem))] w-56 max-h-[calc(100vh-8rem)] overflow-y-auto text-sm"
    >
      <p class="font-semibold mb-2 opacity-80 uppercase tracking-wider text-xs">
        On this page
      </p>
      <ul class="border-l border-base-300 space-y-1">
        <For each={props.toc}>
          {(e) => (
            <li>
              <a
                href={`#${e.slug}`}
                class={`block -ml-px border-l py-1 transition-colors ${
                  active() === e.slug
                    ? "border-accent text-accent"
                    : "border-transparent opacity-60 hover:opacity-100"
                } ${e.depth === 3 ? "pl-7" : "pl-3"}`}
              >
                {e.text}
              </a>
            </li>
          )}
        </For>
      </ul>
    </nav>
  );
}
