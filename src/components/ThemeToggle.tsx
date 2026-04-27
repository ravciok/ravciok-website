import { createSignal, onMount } from "solid-js";

const STORAGE_KEY = "theme";
const LIGHT = "light";
const DARK = "dark";

type Theme = typeof LIGHT | typeof DARK;

function readInitialTheme(): Theme {
  if (typeof window === "undefined") return LIGHT;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === LIGHT || stored === DARK) return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? DARK : LIGHT;
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(STORAGE_KEY, theme);
}

export function ThemeToggle() {
  const [isDark, setIsDark] = createSignal(false);

  onMount(() => {
    const t = readInitialTheme();
    setIsDark(t === DARK);
    applyTheme(t);
  });

  function toggle(e: Event) {
    const checked = (e.currentTarget as HTMLInputElement).checked;
    setIsDark(checked);
    applyTheme(checked ? DARK : LIGHT);
  }

  return (
    <label class="swap swap-rotate" aria-label="Toggle dark theme">
      <input type="checkbox" checked={isDark()} onChange={toggle} />
      <svg class="swap-off h-6 w-6 fill-current" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5.64 17l-.71.71a1 1 0 0 0 1.41 1.41l.71-.71A1 1 0 0 0 5.64 17ZM5 12a1 1 0 0 0-1-1H3a1 1 0 0 0 0 2h1a1 1 0 0 0 1-1Zm7-7a1 1 0 0 0 1-1V3a1 1 0 0 0-2 0v1a1 1 0 0 0 1 1ZM5.64 7.05a1 1 0 0 0 .7.29 1 1 0 0 0 .71-.29 1 1 0 0 0 0-1.41l-.71-.71a1 1 0 0 0-1.41 1.41ZM17 5.64a1 1 0 0 0 .7-.29l.71-.71a1 1 0 1 0-1.41-1.41l-.71.71A1 1 0 0 0 17 5.64ZM21 11h-1a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2Zm-9 8a1 1 0 0 0-1 1v1a1 1 0 0 0 2 0v-1a1 1 0 0 0-1-1Zm6.36-2A1 1 0 0 0 17 18.36l.71.71a1 1 0 0 0 1.41 0 1 1 0 0 0 0-1.41ZM12 6.5a5.5 5.5 0 1 0 5.5 5.5A5.51 5.51 0 0 0 12 6.5Z" />
      </svg>
      <svg class="swap-on h-6 w-6 fill-current" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21.64 13a1 1 0 0 0-1.05-.14 8.05 8.05 0 0 1-3.37.73 8.15 8.15 0 0 1-8.14-8.1 8.59 8.59 0 0 1 .25-2A1 1 0 0 0 8 2.36a10.14 10.14 0 1 0 14 11.69 1 1 0 0 0-.36-1.05Z" />
      </svg>
    </label>
  );
}
