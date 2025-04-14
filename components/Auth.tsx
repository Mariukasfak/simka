import { Auth as SupabaseAuth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'

export default function Auth() {
  const [redirectUrl, setRedirectUrl] = useState('/auth/callback')
  
  // Tik klientinėje pusėje naudojame window objektą
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRedirectUrl(`${window.location.origin}/auth/callback`)
    }
  }, [])

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