'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

export default function EntrarLigaPage() {
  const { code } = useParams<{ code: string }>()
  const router = useRouter()
  const [league, setLeague] = useState<{ id: string; name: string; max_members: number } | null>(null)
  const [membersCount, setMembersCount] = useState(0)
  const [status, setStatus] = useState<'loading' | 'ready' | 'joined' | 'already' | 'full' | 'error'>('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    async function load() {
      const { data: l } = await supabase.from('leagues').select('id, name, max_members').eq('invite_code', code).single()
      if (!l) { setStatus('error'); setError('Link inválido ou expirado.'); return }
      setLeague(l)

      const { count } = await supabase.from('league_members').select('*', { count: 'exact', head: true }).eq('league_id', l.id)
      setMembersCount(count ?? 0)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setStatus('ready'); return }

      const { data: existing } = await supabase.from('league_members').select('id').eq('league_id', l.id).eq('user_id', user.id).single()
      if (existing) { setStatus('already'); return }

      if ((count ?? 0) >= l.max_members) { setStatus('full'); return }
      setStatus('ready')
    }
    load()
  }, [code])

  async function join() {
    const supabase = getSupabaseBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push(`/login?next=/ligas/entrar/${code}`); return }
    if (!league) return

    const { error } = await supabase.from('league_members').insert({ league_id: league.id, user_id: user.id, role: 'member' })
    if (error) { setError(error.message); return }
    setStatus('joined')
    setTimeout(() => router.push(`/ligas/${league.id}`), 1500)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
        {status === 'loading' && <p style={{ color: 'var(--text3)' }}>Carregando...</p>}

        {status === 'error' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 12 }}>❌</div>
            <p style={{ color: 'var(--red)', marginBottom: 16 }}>{error}</p>
            <Link href="/ligas" style={{ color: 'var(--green)', textDecoration: 'none', fontWeight: 700 }}>← Ver ligas</Link>
          </>
        )}

        {(status === 'ready' || status === 'full' || status === 'already') && league && (
          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(139,92,246,.25)', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ height: 3, background: 'linear-gradient(90deg,var(--purple),var(--blue))' }} />
            <div style={{ padding: '28px 24px' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🏅</div>
              <p style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>Convite para liga</p>
              <h2 className="font-condensed" style={{ fontWeight: 900, fontSize: 24, color: 'var(--white)', textTransform: 'uppercase', marginBottom: 8 }}>{league.name}</h2>
              <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 20 }}>{membersCount} de {league.max_members} membros</p>

              {status === 'already' && (
                <>
                  <p style={{ color: 'var(--green)', fontSize: 13, marginBottom: 16 }}>✓ Você já é membro desta liga.</p>
                  <Link href={`/ligas/${league.id}`} style={{ display: 'block', padding: '12px', background: 'linear-gradient(90deg,var(--green),var(--cyan))', color: '#000', borderRadius: 10, fontSize: 14, fontWeight: 900, textDecoration: 'none', fontFamily: 'inherit', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                    Ver liga →
                  </Link>
                </>
              )}

              {status === 'full' && (
                <p style={{ color: 'var(--red)', fontSize: 13 }}>Liga cheia ({league.max_members}/{league.max_members} membros).</p>
              )}

              {status === 'ready' && (
                <>
                  {error && <p style={{ color: 'var(--red)', fontSize: 12, marginBottom: 12 }}>{error}</p>}
                  <button onClick={join} className="btn-green" style={{ display: 'block', width: '100%', padding: '13px', borderRadius: 12, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 900, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 10 }}>
                    🏅 Entrar na liga
                  </button>
                  <Link href="/ligas" style={{ fontSize: 12, color: 'var(--text3)', textDecoration: 'none' }}>Ver todas as ligas</Link>
                </>
              )}
            </div>
          </div>
        )}

        {status === 'joined' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <p style={{ color: 'var(--green)', fontSize: 15, fontWeight: 700 }}>Você entrou na liga! Redirecionando...</p>
          </>
        )}
      </div>
    </div>
  )
}
