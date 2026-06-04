'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AppLayout } from '@/components/layout/app-layout'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

type Achievement = {
  id: string
  icon: string
  title: string
  desc: string
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  unlocked: boolean
}

type Stats = {
  totalPoints: number
  lineupCount: number
  bestPosition: number | null
  lcBalance: number
}

const TIER_COLORS = {
  bronze:   { bg: 'rgba(180,120,60,.12)',  color: '#b4783c', border: 'rgba(180,120,60,.3)' },
  silver:   { bg: 'rgba(160,170,180,.10)', color: '#a0aab4', border: 'rgba(160,170,180,.3)' },
  gold:     { bg: 'rgba(255,200,50,.10)',  color: '#ffc832', border: 'rgba(255,200,50,.3)' },
  platinum: { bg: 'rgba(0,212,255,.10)',   color: '#00d4ff', border: 'rgba(0,212,255,.3)' },
}

export default function PerfilPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<Stats>({ totalPoints: 0, lineupCount: 0, bestPosition: null, lcBalance: 100000 })
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

      // Lineups count
      const { count: lineupCount } = await supabase
        .from('lineups')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      // Rankings
      const { data: ucRows } = await supabase
        .from('user_championships')
        .select('id, lc_balance, total_points')
        .eq('user_id', user.id)

      const totalPoints = (ucRows ?? []).reduce((s, r) => s + (r.total_points ?? 0), 0)
      const lcBalance = (ucRows ?? [])[0]?.lc_balance ?? 100000

      const ucIds = (ucRows ?? []).map(r => r.id)
      let bestPosition: number | null = null
      if (ucIds.length) {
        const { data: rankings } = await supabase
          .from('rankings')
          .select('position')
          .in('user_championship_id', ucIds)
          .order('position', { ascending: true })
          .limit(1)
        bestPosition = rankings?.[0]?.position ?? null
      }

      const s: Stats = { totalPoints, lineupCount: lineupCount ?? 0, bestPosition, lcBalance }
      setStats(s)

      // Build achievements
      const a: Achievement[] = [
        {
          id: 'first_lineup', icon: '🎯', title: 'Primeiro Passo',
          desc: 'Monte sua primeira lineup', tier: 'bronze',
          unlocked: (lineupCount ?? 0) > 0,
        },
        {
          id: 'br_fan', icon: '🇧🇷', title: 'BR Proud',
          desc: 'Escale 3+ jogadores brasileiros', tier: 'silver',
          unlocked: false,
        },
        {
          id: 'top10', icon: '🔝', title: 'Top 10',
          desc: 'Chegue ao top 10 em uma rodada', tier: 'silver',
          unlocked: bestPosition !== null && bestPosition <= 10,
        },
        {
          id: 'top3', icon: '🏆', title: 'Pódio',
          desc: 'Chegue ao top 3 em uma rodada', tier: 'gold',
          unlocked: bestPosition !== null && bestPosition <= 3,
        },
        {
          id: 'big_spender', icon: '💸', title: 'All-In',
          desc: 'Monte lineup gastando 95k+ LC', tier: 'silver',
          unlocked: false,
        },
        {
          id: 'elite', icon: '👑', title: 'Elite',
          desc: 'Acumule 500+ pontos totais', tier: 'gold',
          unlocked: totalPoints >= 500,
        },
        {
          id: 'legend', icon: '🌟', title: 'Lenda',
          desc: 'Fique em 1º lugar em qualquer rodada', tier: 'platinum',
          unlocked: bestPosition === 1,
        },
        {
          id: 'veteran', icon: '🎖️', title: 'Veterano',
          desc: 'Participe de 5+ rodadas', tier: 'gold',
          unlocked: (lineupCount ?? 0) >= 5,
        },
      ]
      setAchievements(a)
      setLoading(false)
    }

    load()
  }, [router])

  if (loading || !user) {
    return (
      <AppLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
          <p style={{ color: 'var(--text3)' }}>Carregando perfil...</p>
        </div>
      </AppLayout>
    )
  }

  const username = user.user_metadata?.username ?? user.email?.split('@')[0] ?? 'Player'
  const initials = username.slice(0, 2).toUpperCase()
  const memberSince = new Date(user.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  // CS2 IQ calculation
  const baseIQ = 1000
  const pointsBonus = Math.floor(stats.totalPoints * 2)
  const posBonus = stats.bestPosition ? Math.max(0, (100 - stats.bestPosition) * 5) : 0
  const lineupBonus = stats.lineupCount * 10
  const cs2IQ = baseIQ + pointsBonus + posBonus + lineupBonus
  const iqLabel = cs2IQ >= 2000 ? 'Lendário' : cs2IQ >= 1500 ? 'Expert' : cs2IQ >= 1200 ? 'Avançado' : 'Calibrando...'

  const unlockedCount = achievements.filter(a => a.unlocked).length

  return (
    <AppLayout>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px' }} className="page-animate">

        {/* Profile header */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', marginBottom: 20, position: 'relative' }}>
          {/* Banner */}
          <div style={{
            height: 100,
            background: 'linear-gradient(135deg, #05080f 0%, #0a1420 50%, #05080f 100%)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,240,117,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,240,117,.03) 1px,transparent 1px)', backgroundSize: '24px 24px' }} />
            <div style={{ position: 'absolute', bottom: -30, left: 24, width: 90, height: 90, borderRadius: '50%', background: 'linear-gradient(135deg, var(--green), var(--cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 900, color: '#000', border: '3px solid var(--bg2)', fontFamily: 'var(--font-condensed)' }}>
              {initials}
            </div>
          </div>

          <div style={{ padding: '40px 24px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h1 className="font-condensed" style={{ fontWeight: 900, fontSize: 26, color: 'var(--white)', letterSpacing: '.04em', marginBottom: 2 }}>{username}</h1>
                <p style={{ fontSize: 12, color: 'var(--text3)' }}>Membro desde {memberSince} · {user.email}</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Link href="/fantasy" style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)', textDecoration: 'none', background: 'rgba(0,240,117,.08)', border: '1px solid rgba(0,240,117,.25)', borderRadius: 7, padding: '6px 14px' }}>
                  Ir ao mercado
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

          {/* Stats */}
          <div>
            <p className="font-condensed" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              ESTATÍSTICAS <span style={{ flex: 1, height: 1, background: 'var(--border)', display: 'block' }} />
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
              {[
                { label: 'Pontos totais', value: stats.totalPoints.toFixed(1), color: 'linear-gradient(90deg,var(--green),var(--cyan))' },
                { label: 'Lineups criadas', value: stats.lineupCount.toString(), color: 'var(--cyan)' },
                { label: 'Melhor posição', value: stats.bestPosition ? `#${stats.bestPosition}` : '—', color: 'var(--gold)' },
                { label: 'Saldo LC', value: stats.lcBalance.toLocaleString('pt-BR'), color: 'var(--yellow)' },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: s.color }} />
                  <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 5 }}>{s.label}</div>
                  <div className="font-condensed font-tech" style={{ fontWeight: 900, fontSize: 22, color: 'var(--white)' }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* CS2 IQ */}
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(0,212,255,.2)', borderRadius: 12, padding: '18px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, var(--cyan), var(--purple))' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text3)' }}>CS2 FANTASY IQ</span>
                <span style={{ fontSize: 11, color: 'var(--cyan)', fontWeight: 700 }}>{iqLabel}</span>
              </div>
              <div className="font-condensed" style={{ fontWeight: 900, fontSize: 48, color: 'var(--cyan)', letterSpacing: '.02em', lineHeight: 1 }}>
                {cs2IQ.toLocaleString('pt-BR')}
              </div>
              <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8 }}>
                Baseado em pontuação total, melhores posições e consistência de lineup.
                {stats.lineupCount === 0 && ' Crie sua primeira lineup para começar a pontuação!'}
              </p>

              {/* IQ bar */}
              <div style={{ marginTop: 12 }}>
                <div style={{ background: 'var(--border)', borderRadius: 4, height: 4, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 4, transition: 'width 1s',
                    width: `${Math.min(100, ((cs2IQ - 1000) / 2000) * 100)}%`,
                    background: 'linear-gradient(90deg, var(--cyan), var(--purple))',
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ fontSize: 9, color: 'var(--text3)' }}>1000</span>
                  <span style={{ fontSize: 9, color: 'var(--text3)' }}>3000</span>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div>
            <p className="font-condensed" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              CONQUISTAS <span style={{ color: 'var(--green)', marginLeft: 4 }}>{unlockedCount}/{achievements.length}</span>
              <span style={{ flex: 1, height: 1, background: 'var(--border)', display: 'block' }} />
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {achievements.map(a => {
                const tier = TIER_COLORS[a.tier]
                return (
                  <div key={a.id} style={{
                    background: a.unlocked ? tier.bg : 'var(--bg2)',
                    border: `1px solid ${a.unlocked ? tier.border : 'var(--border)'}`,
                    borderRadius: 10, padding: '12px',
                    opacity: a.unlocked ? 1 : 0.45,
                    transition: 'all .2s',
                  }}>
                    <div style={{ fontSize: 22, marginBottom: 5, filter: a.unlocked ? 'none' : 'grayscale(1)' }}>{a.icon}</div>
                    <div style={{ fontWeight: 700, fontSize: 12, color: a.unlocked ? tier.color : 'var(--text3)', marginBottom: 2 }}>{a.title}</div>
                    <div style={{ fontSize: 10, color: 'var(--text3)', lineHeight: 1.4 }}>{a.desc}</div>
                    {a.unlocked && (
                      <div style={{ marginTop: 6, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: tier.color }}>
                        ✓ Desbloqueada
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
