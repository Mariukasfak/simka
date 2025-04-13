import { NextResponse } from 'next/server'

const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
const REDIRECT_URI = process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI

export async function GET() {
  if (!GITHUB_CLIENT_ID || !REDIRECT_URI) {
    return NextResponse.json(
      { error: 'Missing GitHub configuration' },
      { status: 500 }
    )
  }

  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: 'read:user user:email',
  })

  return NextResponse.redirect(
    `https://github.com/login/oauth/authorize?${params.toString()}`
  )
}