import type { GitHubData } from "./github.types";

export const mockGitHubData: GitHubData = {
  user: {
    login: "ravciok",
    name: "Rafal",
    avatar_url: "https://avatars.githubusercontent.com/u/0?v=4",
    bio: "Building things on the web. Polish engineer who likes lean tooling.",
    html_url: "https://github.com/ravciok",
    blog: "https://ravciok.dev",
    location: "Warsaw, Poland",
    email: null,
    twitter_username: null,
    company: "@self-employed",
    public_repos: 24,
    followers: 87,
    following: 42,
    created_at: "2014-06-12T00:00:00Z",
    hireable: true,
  },
  repos: [
    {
      name: "ravciok-website",
      html_url: "https://github.com/ravciok/ravciok-website",
      description: "This site. SolidStart SSG + DaisyUI.",
      updated_at: "2026-04-27T12:00:00Z",
      pushed_at: "2026-04-27T12:00:00Z",
      language: "TypeScript",
      stargazers_count: 0,
      fork: false,
    },
    {
      name: "ledger-cli",
      html_url: "https://github.com/ravciok/ledger-cli",
      description: "Tiny CLI for tracking personal finances.",
      updated_at: "2026-03-21T10:00:00Z",
      pushed_at: "2026-03-22T10:00:00Z",
      language: "Rust",
      stargazers_count: 24,
      fork: false,
    },
    {
      name: "static-snap",
      html_url: "https://github.com/ravciok/static-snap",
      description: "One-shot screenshot service for static pages.",
      updated_at: "2026-02-15T08:00:00Z",
      pushed_at: "2026-02-18T08:00:00Z",
      language: "Go",
      stargazers_count: 11,
      fork: false,
    },
    {
      name: "useless-utils",
      html_url: "https://github.com/ravciok/useless-utils",
      description: "Tiny JS utilities I keep rewriting.",
      updated_at: "2025-12-09T08:00:00Z",
      pushed_at: "2025-12-12T08:00:00Z",
      language: "JavaScript",
      stargazers_count: 4,
      fork: false,
    },
    {
      name: "weekend-experiments",
      html_url: "https://github.com/ravciok/weekend-experiments",
      description: null,
      updated_at: "2025-08-20T08:00:00Z",
      pushed_at: "2025-08-25T08:00:00Z",
      language: "Python",
      stargazers_count: 2,
      fork: false,
    },
  ],
  socialAccounts: [
    { provider: "linkedin", url: "https://www.linkedin.com/in/ravciok" },
    { provider: "mastodon", url: "https://hachyderm.io/@ravciok" },
    { provider: "youtube", url: "https://www.youtube.com/@ravciok" },
  ],
  profileReadmeHtml: `
<h2>Hi, I'm Rafal 👋</h2>
<p>Engineer based in Warsaw. I build small, fast tools — usually in TypeScript, Rust, or Go.</p>
<h3>What I'm into</h3>
<ul>
  <li>Static sites and edge runtimes</li>
  <li>Developer tooling and CLIs</li>
  <li>Type systems that catch real bugs</li>
</ul>
<p>This block is the mock README. The real one is fetched from <code>github.com/ravciok/ravciok</code> at build time when <code>GITHUB_USERNAME</code> is set.</p>
`.trim(),
};
