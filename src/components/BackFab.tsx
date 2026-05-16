import { createSignal, onCleanup, onMount } from "solid-js";

type Mode = "hidden" | "top" | "back";

const SCROLL_DIR_THRESHOLD = 50;

export function BackFab(props: { topSelector: string; endSelector: string }) {
  const [mode, setMode] = createSignal<Mode>("hidden");
  const [hideByDir, setHideByDir] = createSignal(false);

  onMount(() => {
    const topEl = document.querySelector(props.topSelector);
    const endEl = document.querySelector(props.endSelector);
    if (!topEl || !endEl) return;

    let pastTop = false;
    let nearEnd = false;

    const recompute = () => {
      if (!pastTop) setMode("hidden");
      else if (nearEnd) setMode("back");
      else setMode("top");
    };

    const topObs = new IntersectionObserver(
      ([e]) => {
        pastTop = !e.isIntersecting && e.boundingClientRect.top < 0;
        recompute();
      },
      { threshold: 0, rootMargin: "-80px 0px 0px 0px" },
    );

    const endObs = new IntersectionObserver(
      ([e]) => {
        nearEnd = e.isIntersecting;
        recompute();
      },
      { threshold: 0 },
    );

    topObs.observe(topEl);
    endObs.observe(endEl);

    let prevY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const diff = y - prevY;
      if (diff > SCROLL_DIR_THRESHOLD) {
        setHideByDir(false);
        prevY = y;
      } else if (diff < -SCROLL_DIR_THRESHOLD) {
        setHideByDir(true);
        prevY = y;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    onCleanup(() => {
      topObs.disconnect();
      endObs.disconnect();
      window.removeEventListener("scroll", onScroll);
    });
  });

  const visible = () => {
    const m = mode();
    if (m === "hidden") return false;
    if (m === "top" && hideByDir()) return false;
    return true;
  };

  function handleClick(e: MouseEvent) {
    if (mode() === "top") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <div class="fixed bottom-1/12 left-1/2 -translate-x-1/2 lg:hidden">
      <a
        href="/"
        aria-label={mode() === "back" ? "Back to home" : "Scroll to top"}
        onClick={handleClick}
        class={`btn btn-circle btn-lg shadow-[0_4px_10px_-2px_rgba(0,0,0,0.7)] transition-opacity duration-300 ease-out motion-reduce:transition-none ${
          mode() === "back" ? "btn-secondary" : "btn-accent"
        } ${
          visible() ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          class={`h-6 w-6 transition-transform duration-300 motion-reduce:transition-none ${
            mode() === "back" ? "-rotate-90" : "rotate-0"
          }`}
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      </a>
    </div>
  );
}
