'use client'

import { Auth as SupabaseAuth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Auth() {
  const [redirectUrl, setRedirectUrl] = useState('/auth/callback')
  const [isConfigurationValid, setIsConfigurationValid] = useState(true)
  
  // Tikriname, ar Supabase konfigūracija yra tinkama tikrai autentifikacijai
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL
    if (!url || url.includes('example.supabase.co')) {
      setIsConfigurationValid(false)
    }
  }, [])
  
  // Tik klientinėje pusėje naudojame window objektą
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRedirectUrl(`${window.location.origin}/auth/callback`)
    }
  }, [])

  if (!isConfigurationValid) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-4">
            ⚠️ Supabase konfigūracija neužbaigta
          </div>
          <p className="text-gray-700 mb-4">
            Trūksta Supabase aplinkos kintamųjų. Autentifikacija laikinai neveikia.
          </p>
          <p className="text-sm text-gray-500">
            Dėl testavimo galite tęsti su <Link href="/" className="text-blue-500 hover:underline">pagrindiniu puslapiu</Link>.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <SupabaseAuth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={[]}
        redirectTo={redirectUrl}
      />
    </div>
  )
}