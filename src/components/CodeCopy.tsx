import { onMount } from "solid-js";

const COPY_LABEL = "Copy";
const COPIED_LABEL = "Copied!";
const FEEDBACK_MS = 1500;

export function CodeCopy(props: { containerSelector: string }) {
  onMount(() => {
    const container = document.querySelector(props.containerSelector);
    if (!container) return;

    const blocks = container.querySelectorAll<HTMLElement>(
      ".code-block:not([data-lang='text'])",
    );

    for (const block of blocks) {
      if (block.querySelector(".code-copy")) continue;
      const code = block.querySelector("pre code")?.textContent ?? "";

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "code-copy";
      btn.textContent = COPY_LABEL;
      btn.setAttribute("aria-label", "Copy code to clipboard");

      let resetTimer: ReturnType<typeof setTimeout> | null = null;
      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
          await navigator.clipboard.writeText(code);
          btn.textContent = COPIED_LABEL;
          btn.classList.add("is-copied");
          if (resetTimer) clearTimeout(resetTimer);
          resetTimer = setTimeout(() => {
            btn.textContent = COPY_LABEL;
            btn.classList.remove("is-copied");
          }, FEEDBACK_MS);
        } catch {
          btn.textContent = "Failed";
        }
      });

      block.appendChild(btn);
    }
  });

  return null;
}
