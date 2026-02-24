import { Octokit } from "octokit";

const GITHUB_APP_ID = process.env.NEXT_PUBLIC_GITHUB_APP_ID;
const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

if (!GITHUB_APP_ID || !GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
  console.warn("Missing GitHub environment variables");
}

export const octokit = new Octokit({
  auth: GITHUB_CLIENT_SECRET,
});

export async function getGitHubAccessToken(code: string) {
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const data = await response.json();
  return data.access_token;
}

export async function getGitHubUser(accessToken: string) {
  const octokit = new Octokit({ auth: accessToken });
  const { data } = await octokit.rest.users.getAuthenticated();
  return data;
}
