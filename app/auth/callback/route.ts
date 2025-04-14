import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    let requestUrl;
    let code: string | null = null;
    
    try {
      requestUrl = new URL(request.url)
      code = requestUrl.searchParams.get('code')
    } catch (urlError) {
      console.error('Error parsing request URL:', urlError)
      // Tęsiame su code = null
    }

    if (code) {
      const supabase = createRouteHandlerClient({ cookies })
      await supabase.auth.exchangeCodeForSession(code)
    }

    // Naudojame saugią nuorodą grąžinimui
    const safeRedirectUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    return NextResponse.redirect(safeRedirectUrl)
  } catch (error) {
    console.error('URL handling error:', error)
    // Nukreipia į pagrindinį puslapį klaidos atveju
    return NextResponse.redirect(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
  }
}