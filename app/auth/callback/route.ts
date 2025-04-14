import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (code) {
      const supabase = createRouteHandlerClient({ cookies })
      await supabase.auth.exchangeCodeForSession(code)
    }

    // Apsaugo nuo "Invalid URL" klaidos, jei origin būtų undefined
    const origin = requestUrl.origin || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    return NextResponse.redirect(origin)
  } catch (error) {
    console.error('URL handling error:', error)
    // Nukreipia į pagrindinį puslapį klaidos atveju
    return NextResponse.redirect(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
  }
}