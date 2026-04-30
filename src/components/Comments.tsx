import { createSignal, onCleanup, onMount } from "solid-js";
import { clientOnly } from "@solidjs/start";

const Giscus = clientOnly(() => import("@giscus/solid"));

const REPO = import.meta.env.GISCUS_REPO;
const REPO_ID = import.meta.env.GISCUS_REPO_ID;
const CATEGORY = import.meta.env.GISCUS_CATEGORY;
const CATEGORY_ID = import.meta.env.GISCUS_CATEGORY_ID;

type GiscusTheme = "catppuccin_latte" | "catppuccin_frappe";

function readTheme(): GiscusTheme {
  if (typeof document === "undefined") return "catppuccin_frappe";
  return document.documentElement.getAttribute("data-theme") === "night" ? "catppuccin_frappe" : "catppuccin_latte";

}

export function Comments() {
  if (!REPO || !REPO_ID || !CATEGORY || !CATEGORY_ID) return null;

  const [theme, setTheme] = createSignal<GiscusTheme>(readTheme());

  onMount(() => {
    setTheme(readTheme());
    const observer = new MutationObserver(() => setTheme(readTheme()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    onCleanup(() => observer.disconnect());
  });

  return (
    <Giscus
      repo={REPO as `${string}/${string}`}
      repoId={REPO_ID}
      category={CATEGORY}
      categoryId={CATEGORY_ID}
      mapping="pathname"
      strict="1"
      reactionsEnabled="1"
      emitMetadata="1"
      inputPosition="bottom"
      theme={theme()}
      lang="en"
      loading="lazy"
    />
  );
}
