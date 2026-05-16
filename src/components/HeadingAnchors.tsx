import { onMount } from "solid-js";

export function HeadingAnchors(props: { containerSelector: string }) {
  onMount(() => {
    const container = document.querySelector(props.containerSelector);
    if (!container) return;

    const headings = container.querySelectorAll<HTMLElement>(
      "h2[id], h3[id]",
    );

    for (const h of headings) {
      if (h.querySelector(":scope > a.heading-link")) continue;
      const id = h.id;

      const link = document.createElement("a");
      link.href = `#${id}`;
      link.className = "heading-link";
      link.setAttribute("aria-label", `Link to "${h.textContent ?? ""}" section`);

      while (h.firstChild) link.appendChild(h.firstChild);
      h.appendChild(link);
    }
  });

  return null;
}
