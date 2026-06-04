'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

export default function SteamCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    // Supabase detecta o hash da URL automaticamente e cria a sessão
    supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
        // Salva cookie server-side
        await fetch('/api/auth/cookie', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: session.access_token }),
        })
        router.push('/dashboard')
        router.refresh()
      }
    })
    // Também tenta pegar sessão já existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetch('/api/auth/cookie', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: session.access_token }),
        }).then(() => { router.push('/dashboard'); router.refresh() })
      }
    })
  }, [router])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 40, height: 40, border: '3px solid var(--green)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: 'var(--text3)', fontSize: 13 }}>Conectando conta Steam...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
