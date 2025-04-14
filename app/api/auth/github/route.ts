import { NextResponse } from 'next/server'

const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
const REDIRECT_URI = process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI

export async function GET() {
  if (!GITHUB_CLIENT_ID || !REDIRECT_URI) {
    console.error('Missing GitHub configuration:', { 
      GITHUB_CLIENT_ID: !!GITHUB_CLIENT_ID, 
      REDIRECT_URI: !!REDIRECT_URI 
    })
    return NextResponse.json(
      { error: 'Missing GitHub configuration' },
      { status: 500 }
    )
  }

  try {
    // Patikrinam ar REDIRECT_URI yra validus URL
    try {
      new URL(REDIRECT_URI)
    } catch (urlError) {
      console.error('Invalid REDIRECT_URI:', REDIRECT_URI, urlError)
      return NextResponse.json(
        { error: 'Invalid redirect URI configuration' },
        { status: 500 }
      )
    }

    const params = new URLSearchParams({
      client_id: GITHUB_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      scope: 'read:user user:email',
    })

    // Užtikriname, kad URL yra teisingai suformuotas - naudojam saugesnį būdą
    const githubAuthUrl = `https://github.com/login/oauth/authorize?${params.toString()}`
    
    // Nebereikia atskiro URL testavimo, nes https://github.com/ yra žinomas validus URL
    return NextResponse.redirect(githubAuthUrl)
  } catch (error) {
    console.error('Error creating GitHub auth URL:', error)
    return NextResponse.json(
      { error: 'Failed to create GitHub authorization URL' },
      { status: 500 }
    )
  }
}