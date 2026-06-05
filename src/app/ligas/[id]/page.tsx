'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

type League = {
  id: string; name: string; description: string | null
  max_members: number; privacy: string; plan_type: string
  invite_code: string | null; creator_id: string | null; created_at: string
}
type Member = { user_id: string; role: string; username: string; totalPoints: number; position: number }
type Championship = { id: string; name: string }

export default function LigaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [league, setLeague] = useState<League | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [championships, setChampionships] = useState<Championship[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id ?? null)

      // Liga
      const { data: l } = await supabase.from('leagues').select('*').eq('id', id).single()
      if (!l) { router.push('/ligas'); return }
      setLeague(l)

      // Campeonatos da liga
      const { data: lcs } = await supabase
        .from('league_championships')
        .select('championship_id, championships(id, name)')
        .eq('league_id', id)
      const champs = (lcs ?? []).map((r: any) => r.championships).filter(Boolean)
      setChampionships(champs)

      // Membros
      const { data: lms } = await supabase
        .from('league_members')
        .select('user_id, role')
        .eq('league_id', id)

      if (!lms?.length) { setLoading(false); return }

      // Para cada membro, soma pontos nos campeonatos da liga
      const champIds = champs.map((c: Championship) => c.id)
      const ranked: Member[] = []

      for (const m of lms) {
        let totalPoints = 0
        if (champIds.length > 0) {
          const { data: ucRows } = await supabase
            .from('user_championships')
            .select('total_points, championship_id')
            .eq('user_id', m.user_id)
            .in('championship_id', champIds)
          totalPoints = (ucRows ?? []).reduce((s, r) => s + (r.total_points ?? 0), 0)
        }

        // Username
        const { data: authUser } = await supabase.auth.admin ? { data: null } : { data: null }
        // Fallback: busca metadata do usuário
        let username = `user_${m.user_id.slice(0, 6)}`
        const { data: prof } = await supabase
          .from('lineups')
          .select('user_id')
          .eq('user_id', m.user_id)
          .limit(1)
          .single()
        // Tenta pegar do localStorage (apenas para usuário atual)
        if (m.user_id === user?.id) {
          username = user.user_metadata?.username ?? user.email?.split('@')[0] ?? username
        }

        ranked.push({ user_id: m.user_id, role: m.role, username, totalPoints, position: 0 })
      }

      ranked.sort((a, b) => b.totalPoints - a.totalPoints)
      ranked.forEach((m, i) => { m.position = i + 1 })
      setMembers(ranked)
      setLoading(false)
    }
    load()
  }, [id, router])

  function copyInvite() {
    if (!league) return
    const url = `${window.location.origin}/ligas/entrar/${league.invite_code}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isAdmin = members.find(m => m.user_id === currentUserId)?.role === 'admin'

  if (loading) return (
    <AppLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <p style={{ color: 'var(--text3)' }}>Carregando liga...</p>
      </div>
    </AppLayout>
  )

  if (!league) return null

  return (
    <AppLayout>
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '28px 20px' }} className="page-animate">

        {/* Header da liga */}
        <div style={{ background: 'var(--bg2)', border: '1px solid rgba(139,92,246,.25)', borderRadius: 14, overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ height: 3, background: 'linear-gradient(90deg,var(--purple),var(--blue))' }} />
          <div style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 20 }}>🏅</span>
                  <h1 className="font-condensed" style={{ fontWeight: 900, fontSize: 22, color: 'var(--white)', textTransform: 'uppercase', letterSpacing: '.04em' }}>{league.name}</h1>
                  {league.plan_type === 'premium' && (
                    <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--gold)', background: 'rgba(255,200,50,.1)', border: '1px solid rgba(255,200,50,.25)', borderRadius: 4, padding: '1px 6px', letterSpacing: '.06em' }}>PREMIUM</span>
                  )}
                </div>
                {league.description && (
                  <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 10 }}>{league.description}</p>
                )}
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>👥 {members.length}/{league.max_members} membros</span>
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>{league.privacy === 'private' ? '🔒 Privada' : '🌐 Pública'}</span>
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>
                    {new Date(league.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
              {isAdmin && (
                <button onClick={copyInvite} style={{ padding: '8px 16px', background: copied ? 'rgba(0,240,117,.1)' : 'var(--bg3)', border: `1px solid ${copied ? 'rgba(0,240,117,.3)' : 'var(--border)'}`, borderRadius: 9, fontSize: 12, fontWeight: 700, color: copied ? 'var(--green)' : 'var(--text2)', cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s' }}>
                  {copied ? '✓ Copiado!' : '🔗 Convidar amigos'}
                </button>
              )}
            </div>

            {/* Campeonatos que contam */}
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 8 }}>
                Campeonatos que contam pontos
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {championships.length === 0 ? (
                  <span style={{ fontSize: 12, color: 'var(--text3)' }}>Nenhum campeonato vinculado.</span>
                ) : championships.map(c => (
                  <Link key={c.id} href={`/fantasy/${c.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(0,240,117,.06)', border: '1px solid rgba(0,240,117,.2)', borderRadius: 20, padding: '4px 10px', fontSize: 11, fontWeight: 600, color: 'var(--green)', textDecoration: 'none' }}>
                    🏆 {c.name.replace('2026','').replace('Season','S').trim()}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Ranking interno */}
        <p className="font-condensed" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          RANKING DA LIGA
          <span style={{ flex: 1, height: 1, background: 'var(--border)', display: 'block' }} />
          <span style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 400 }}>Soma de pontos nos campeonatos selecionados</span>
        </p>

        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          {members.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 16 }}>Nenhum membro ainda.</p>
              {isAdmin && (
                <button onClick={copyInvite} style={{ padding: '10px 20px', background: 'linear-gradient(90deg,var(--purple),var(--blue))', color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  🔗 Copiar link de convite
                </button>
              )}
            </div>
          ) : (
            members.map((m, i) => {
              const isMe = m.user_id === currentUserId
              const pct = members[0].totalPoints > 0 ? (m.totalPoints / members[0].totalPoints) * 100 : 0
              return (
                <div key={m.user_id} style={{ padding: '14px 18px', borderBottom: i < members.length - 1 ? '1px solid var(--border)' : 'none', background: isMe ? 'rgba(0,240,117,.03)' : 'transparent', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`, background: isMe ? 'rgba(0,240,117,.04)' : 'rgba(255,255,255,.01)', transition: 'width .5s' }} />
                  <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ fontSize: i < 3 ? 22 : 14, width: 36, textAlign: 'center' }}>
                      {['🥇','🥈','🥉'][i] ?? `#${i+1}`}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="font-condensed" style={{ fontWeight: 800, fontSize: 16, color: isMe ? 'var(--green)' : 'var(--white)', letterSpacing: '.03em' }}>
                          {m.username}
                        </span>
                        {isMe && <span style={{ fontSize: 9, color: 'var(--green)', fontWeight: 700, background: 'rgba(0,240,117,.1)', border: '1px solid rgba(0,240,117,.2)', borderRadius: 4, padding: '1px 5px' }}>VOCÊ</span>}
                        {m.role === 'admin' && <span style={{ fontSize: 9, color: 'var(--purple)', fontWeight: 700, background: 'rgba(139,92,246,.1)', border: '1px solid rgba(139,92,246,.2)', borderRadius: 4, padding: '1px 5px' }}>ADMIN</span>}
                      </div>
                    </div>
                    <div className="font-tech" style={{ fontSize: 22, fontWeight: 700, color: i === 0 ? 'var(--gold)' : i === 1 ? '#aaa' : i === 2 ? '#c05' : isMe ? 'var(--green)' : 'var(--text2)' }}>
                      {m.totalPoints.toFixed(1)}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text3)' }}>pts</div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text3)', marginTop: 12 }}>
          Os pontos são calculados em tempo real com base nos campeonatos selecionados. Monte suas lineups nos campeonatos oficiais para pontuar.
        </p>
      </div>
    </AppLayout>
  )
}
