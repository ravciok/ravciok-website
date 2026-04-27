export interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  html_url: string;
  blog: string | null;
  location: string | null;
  email: string | null;
  twitter_username: string | null;
  company: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  hireable: boolean | null;
}

export interface GitHubRepo {
  name: string;
  html_url: string;
  description: string | null;
  updated_at: string;
  pushed_at: string;
  language: string | null;
  stargazers_count: number;
  fork: boolean;
}

export interface SocialAccount {
  provider: string;
  url: string;
}

export interface GitHubData {
  user: GitHubUser;
  repos: GitHubRepo[];
  profileReadmeHtml: string | null;
  socialAccounts: SocialAccount[];
}
