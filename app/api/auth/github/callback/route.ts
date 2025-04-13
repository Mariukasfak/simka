import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getGitHubAccessToken, getGitHubUser } from '@/lib/github'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json(
        { error: 'No code provided' },
        { status: 400 }
      )
    }

    // Get GitHub access token
    const accessToken = await getGitHubAccessToken(code)
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Failed to get access token' },
        { status: 400 }
      )
    }

    // Get GitHub user data
    const githubUser = await getGitHubUser(accessToken)

    // Store GitHub data in Supabase
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: user, error: userError } = await supabase
      .from('users')
      .update({
        github_id: githubUser.id.toString(),
        github_username: githubUser.login,
        github_access_token: accessToken,
      })
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .select()
      .single()

    if (userError) {
      console.error('Error updating user:', userError)
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      )
    }

    // Redirect to success page
    return NextResponse.redirect(new URL('/github/success', request.url))
  } catch (error) {
    console.error('GitHub callback error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}