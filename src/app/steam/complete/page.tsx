'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

export default function SteamCompletePage() {
  const router = useRouter()

  useEffect(() => {
    async function syncSession() {
      // Lê tokens do hash da URL (#access_token=...&refresh_token=...)
      const hash = window.location.hash.substring(1)
      const params = new URLSearchParams(hash)
      const accessToken  = params.get('access_token')
      const refreshToken = params.get('refresh_token')

      if (!accessToken || !refreshToken) {
        router.push('/dashboard')
        return
      }

      const supabase = getSupabaseBrowserClient()

      // Define a sessão no browser (localStorage do Supabase)
      await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })

      // Garante que o cookie server-side também está setado
      await fetch('/api/auth/cookie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: accessToken }),
      })

      router.push('/dashboard')
      router.refresh()
    }

    syncSession()
  }, [router])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 36, height: 36, border: '3px solid var(--green)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: 'var(--text3)', fontSize: 13 }}>Sincronizando sessão Steam...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
