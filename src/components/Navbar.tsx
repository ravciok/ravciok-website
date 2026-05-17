import { ThemeToggle } from "~/components/ThemeToggle";

export function Navbar() {
  return (
    <nav class="navbar bg-base-100 max-w-screen-md mx-auto px-4 md:px-6 lg:max-w-screen-lg">
      <a href="/" class="font-bold text-xl md:text-2xl" aria-label="Home">
        ravciok<span class="ml-1 text-primary italic" aria-hidden="true">.dev</span>
      </a>
      <div class="flex-none ml-auto">
        <ThemeToggle />
      </div>
    </nav>
  );
}
