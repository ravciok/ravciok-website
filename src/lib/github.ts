import { marked } from "marked";
import type { GitHubData, GitHubRepo, GitHubUser, SocialAccount } from "./github.types";
import { mockGitHubData } from "./github.mock";

const ACCEPT = "application/vnd.github+json";
const API_VERSION = "2022-11-28";

const PINNED_QUERY = /* GraphQL */ `
  query Pinned($login: String!) {
    user(login: $login) {
      pinnedItems(first: 6, types: REPOSITORY) {
        nodes {
          ... on Repository {
            name
            url
            description
            updatedAt
            pushedAt
            primaryLanguage { name }
            stargazerCount
            isFork
          }
        }
      }
    }
  }
`;

interface PinnedNode {
  name: string;
  url: string;
  description: string | null;
  updatedAt: string;
  pushedAt: string;
  primaryLanguage: { name: string } | null;
  stargazerCount: number;
  isFork: boolean;
}

function pinnedToRepo(n: PinnedNode): GitHubRepo {
  return {
    name: n.name,
    html_url: n.url,
    description: n.description,
    updated_at: n.updatedAt,
    pushed_at: n.pushedAt,
    language: n.primaryLanguage?.name ?? null,
    stargazers_count: n.stargazerCount,
    fork: n.isFork,
  };
}

async function fetchPinnedRepos(username: string, token: string): Promise<GitHubRepo[]> {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Accept: ACCEPT,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: PINNED_QUERY, variables: { login: username } }),
  });
  if (!res.ok) throw new Error(`GitHub GraphQL pinned fetch failed: ${res.status} ${res.statusText}`);
  const json = (await res.json()) as {
    data?: { user?: { pinnedItems?: { nodes?: PinnedNode[] } } };
    errors?: { message: string }[];
  };
  if (json.errors?.length) throw new Error(`GitHub GraphQL errors: ${json.errors.map((e) => e.message).join("; ")}`);
  const nodes = json.data?.user?.pinnedItems?.nodes ?? [];
  return nodes.filter((n): n is PinnedNode => Boolean(n)).map(pinnedToRepo);
}

async function fetchUser(username: string, headers: Record<string, string>): Promise<GitHubUser> {
  const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, { headers });
  if (!res.ok) throw new Error(`GitHub user fetch failed: ${res.status} ${res.statusText}`);
  return res.json();
}

async function fetchSocialAccounts(
  username: string,
  headers: Record<string, string>,
): Promise<SocialAccount[]> {
  const res = await fetch(
    `https://api.github.com/users/${encodeURIComponent(username)}/social_accounts`,
    { headers },
  );
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`GitHub social_accounts fetch failed: ${res.status} ${res.statusText}`);
  return res.json();
}

async function fetchProfileReadmeHtml(
  username: string,
  baseHeaders: Record<string, string>,
): Promise<string | null> {
  const u = encodeURIComponent(username);
  const res = await fetch(`https://api.github.com/repos/${u}/${u}/readme`, {
    headers: { ...baseHeaders, Accept: "application/vnd.github.raw" },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub profile README fetch failed: ${res.status} ${res.statusText}`);
  const md = await res.text();
  return await marked.parse(md);
}

export async function loadGitHub(): Promise<GitHubData> {
  const username = process.env.PROFILE;
  if (!username) return mockGitHubData;

  const headers: Record<string, string> = {
    Accept: ACCEPT,
    "X-GitHub-Api-Version": API_VERSION,
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  const [user, profileReadmeHtml, socialAccounts] = await Promise.all([
    fetchUser(username, headers),
    fetchProfileReadmeHtml(username, headers),
    fetchSocialAccounts(username, headers),
  ]);

  // Pinned repos require GraphQL + auth. Without a token, fall back to mock pinned set.
  const repos = token
    ? await fetchPinnedRepos(username, token)
    : mockGitHubData.repos;

  return { user, repos, profileReadmeHtml, socialAccounts };
}
