import { ThemeToggle } from "~/components/ThemeToggle";

export function Navbar() {
  return (
    <nav class="navbar bg-base-100 max-w-screen-md mx-auto px-4 md:px-6 lg:max-w-screen-lg">
      <div class="flex-1 font-mono">~/ravciok.dev</div>
      <div class="flex-none">
        <ThemeToggle />
      </div>
    </nav>
  );
}
