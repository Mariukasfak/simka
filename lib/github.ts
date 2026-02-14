import { Octokit } from 'octokit'

// Removed top-level environment variable check to prevent build failures

export async function getGitHubAccessToken(code: string) {
  const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
  const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET

  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    throw new Error('Missing GitHub environment variables (GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET)')
  }

  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code,
    }),
  })

  const data = await response.json()
  return data.access_token
}

export async function getGitHubUser(accessToken: string) {
  const octokit = new Octokit({ auth: accessToken })
  const { data } = await octokit.rest.users.getAuthenticated()
  return data
}
