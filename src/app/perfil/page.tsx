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
  memberSince: string
}

// Moeda CS2 estilo real
function CS2Coin({ tier, size = 72 }: { tier: 'ferro' | 'bronze' | 'prata' | 'ouro' | 'diamante' | 'global'; size?: number }) {
  const TIERS = {
    ferro:    { outer: '#4a5568', inner: '#718096', shine: '#a0aec0', label: 'Ferro',    icon: '⚙',  glow: 'rgba(113,128,150,.4)' },
    bronze:   { outer: '#7b341e', inner: '#c05621', shine: '#ed8936', label: 'Bronze',   icon: '🛡',  glow: 'rgba(192,86,33,.4)' },
    prata:    { outer: '#2d3748', inner: '#718096', shine: '#e2e8f0', label: 'Prata',    icon: '⭐', glow: 'rgba(160,174,192,.4)' },
    ouro:     { outer: '#744210', inner: '#d69e2e', shine: '#fbd38d', label: 'Ouro',     icon: '👑',  glow: 'rgba(214,158,46,.5)' },
    diamante: { outer: '#1a365d', inner: '#2b6cb0', shine: '#63b3ed', label: 'Diamante', icon: '💎', glow: 'rgba(99,179,237,.5)' },
    global:   { outer: '#44337a', inner: '#6b46c1', shine: '#b794f4', label: 'Global',   icon: '🌟', glow: 'rgba(183,148,244,.6)' },
  }
  const t = TIERS[tier]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{
        width: size, height: size, borderRadius: '50%', position: 'relative',
        background: `conic-gradient(${t.shine} 0deg, ${t.inner} 60deg, ${t.outer} 120deg, ${t.inner} 180deg, ${t.shine} 240deg, ${t.inner} 300deg, ${t.outer} 360deg)`,
        boxShadow: `0 0 ${size/3}px ${t.glow}, inset 0 2px 4px rgba(255,255,255,.2), inset 0 -2px 4px rgba(0,0,0,.3)`,
        border: `2px solid ${t.shine}80`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'default',
      }}>
        {/* Inner ring */}
        <div style={{
          width: size * .78, height: size * .78, borderRadius: '50%',
          background: `radial-gradient(circle at 35% 35%, ${t.shine}40, ${t.outer} 60%)`,
          border: `1px solid ${t.shine}50`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: size * .32,
        }}>
          {t.icon}
        </div>
        {/* Shine spot */}
        <div style={{ position: 'absolute', top: size * .1, left: size * .15, width: size * .2, height: size * .12, background: `rgba(255,255,255,.3)`, borderRadius: '50%', filter: 'blur(2px)', transform: 'rotate(-30deg)' }} />
      </div>
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: t.shine }}>{t.label}</span>
    </div>
  )
}

// Pin tipo CS2
function CS2Pin({ icon, label, color, unlocked }: { icon: string; label: string; color: string; unlocked: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, opacity: unlocked ? 1 : .3, transition: 'opacity .2s' }}>
      <div style={{
        width: 44, height: 44, borderRadius: '50%',
        background: unlocked ? `radial-gradient(circle at 35% 30%, ${color}40, ${color}15)` : 'var(--bg3)',
        border: `2px solid ${unlocked ? color : 'var(--border)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20,
        boxShadow: unlocked ? `0 0 10px ${color}50` : 'none',
      }}>
        {icon}
      </div>
      <span style={{ fontSize: 9, color: unlocked ? color : 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', textAlign: 'center', maxWidth: 50, lineHeight: 1.2 }}>{label}</span>
    </div>
  )
}

export default function PerfilPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<Stats>({ totalPoints: 0, lineupCount: 0, bestPosition: null, lcBalance: 100000, memberSince: '' })
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

      const { count: lineupCount } = await supabase
        .from('lineups').select('*', { count: 'exact', head: true }).eq('user_id', user.id)

      const { data: ucRows } = await supabase
        .from('user_championships').select('id, lc_balance, total_points').eq('user_id', user.id)

      const totalPoints = (ucRows ?? []).reduce((s, r) => s + (r.total_points ?? 0), 0)
      const lcBalance = (ucRows ?? [])[0]?.lc_balance ?? 100000

      const ucIds = (ucRows ?? []).map(r => r.id)
      let bestPosition: number | null = null
      if (ucIds.length) {
        const { data: rankings } = await supabase
          .from('rankings').select('position').in('user_championship_id', ucIds).order('position', { ascending: true }).limit(1)
        bestPosition = rankings?.[0]?.position ?? null
      }

      const memberSince = new Date(user.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

      setStats({ totalPoints, lineupCount: lineupCount ?? 0, bestPosition, lcBalance, memberSince })

      const a: Achievement[] = [
        { id: 'first_lineup',  icon: '🎯', title: 'Primeiro Passo',   desc: 'Monte sua primeira lineup',         tier: 'bronze',   unlocked: (lineupCount ?? 0) > 0 },
        { id: 'br_fan',        icon: '🇧🇷', title: 'BR Proud',          desc: '3+ jogadores brasileiros',         tier: 'silver',   unlocked: false },
        { id: 'top10',         icon: '🔝', title: 'Top 10',            desc: 'Top 10 em uma rodada',              tier: 'silver',   unlocked: bestPosition !== null && bestPosition <= 10 },
        { id: 'top3',          icon: '🏆', title: 'Pódio',             desc: 'Top 3 em uma rodada',               tier: 'gold',     unlocked: bestPosition !== null && bestPosition <= 3 },
        { id: 'big_spender',   icon: '💸', title: 'All-In',            desc: 'Lineup com 90k+ LC gasto',         tier: 'silver',   unlocked: false },
        { id: 'elite',         icon: '👑', title: 'Elite',             desc: '500+ pontos acumulados',            tier: 'gold',     unlocked: totalPoints >= 500 },
        { id: 'legend',        icon: '🌟', title: 'Lenda',             desc: '1º lugar em qualquer rodada',       tier: 'platinum', unlocked: bestPosition === 1 },
        { id: 'veteran',       icon: '🎖️', title: 'Veterano',          desc: '5+ rodadas participadas',           tier: 'gold',     unlocked: (lineupCount ?? 0) >= 5 },
        { id: 'sniper',        icon: '🎯', title: 'Atirador de Elite', desc: 'AWPer na lineup que pontuou mais', tier: 'silver',   unlocked: false },
        { id: 'prophet',       icon: '🔮', title: 'Profeta',           desc: 'Capitão foi o MVP da rodada',       tier: 'gold',     unlocked: false },
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

  // CS2 Coin tier
  const cs2Tier = stats.totalPoints >= 1000 ? 'global' : stats.totalPoints >= 500 ? 'diamante' : stats.totalPoints >= 200 ? 'ouro' : stats.totalPoints >= 50 ? 'prata' : stats.totalPoints >= 1 ? 'bronze' : 'ferro'

  // CS2 IQ
  const cs2IQ = 1000 + Math.floor(stats.totalPoints * 2) + (stats.bestPosition ? Math.max(0, (100 - stats.bestPosition) * 5) : 0) + stats.lineupCount * 10
  const iqLabel = cs2IQ >= 2000 ? 'Global Elite' : cs2IQ >= 1500 ? 'Supremo' : cs2IQ >= 1200 ? 'Distinguished' : 'Em calibração'

  const unlockedCount = achievements.filter(a => a.unlocked).length

  const TIER_COLORS = {
    bronze:   { bg: 'rgba(180,120,60,.12)',  color: '#b4783c', border: 'rgba(180,120,60,.3)' },
    silver:   { bg: 'rgba(160,170,180,.10)', color: '#a0aab4', border: 'rgba(160,170,180,.3)' },
    gold:     { bg: 'rgba(255,200,50,.10)',  color: '#ffc832', border: 'rgba(255,200,50,.3)' },
    platinum: { bg: 'rgba(0,212,255,.10)',   color: '#00d4ff', border: 'rgba(0,212,255,.3)' },
  }

  return (
    <AppLayout>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '28px 20px' }} className="page-animate">

        {/* ── PROFILE CARD ── */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', marginBottom: 20 }}>
          {/* Banner */}
          <div style={{ height: 110, position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #02010a 0%, #07040f 50%, #0a0318 100%)' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,240,117,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,240,117,.03) 1px,transparent 1px)', backgroundSize: '32px 32px' }} />
            <div style={{ position: 'absolute', bottom: -30, left: '50%', transform: 'translateX(-50%)', width: 400, height: 200, background: 'radial-gradient(ellipse, rgba(0,212,255,.08), transparent 70%)' }} />
          </div>

          <div style={{ padding: '0 24px 22px', position: 'relative' }}>
            {/* Avatar */}
            <div style={{
              width: 82, height: 82, borderRadius: '50%', marginTop: -41,
              background: 'linear-gradient(135deg, var(--green), var(--cyan))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 900, color: '#000',
              border: '4px solid var(--bg2)', fontFamily: 'var(--font-condensed)',
              boxShadow: '0 0 20px rgba(0,240,117,.3)',
              position: 'relative', zIndex: 1,
            }}>
              {initials}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 10, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h1 className="font-condensed" style={{ fontWeight: 900, fontSize: 28, color: 'var(--white)', letterSpacing: '.04em', marginBottom: 2 }}>{username}</h1>
                <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>{user.email}</p>
                {/* MEMBRO DESDE — destaque */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(0,212,255,.08)', border: '1px solid rgba(0,212,255,.2)', borderRadius: 20, padding: '4px 12px' }}>
                  <span style={{ fontSize: 12 }}>📅</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--cyan)' }}>Membro desde {stats.memberSince}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                <Link href="/fantasy" style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)', textDecoration: 'none', background: 'rgba(0,240,117,.08)', border: '1px solid rgba(0,240,117,.25)', borderRadius: 7, padding: '8px 16px' }}>
                  → Ir ao Mercado
                </Link>
                {/* Steam connect — mostra se não tem provider Steam */}
                {!user.app_metadata?.provider?.includes('steam') && (
                  <button
                    onClick={async () => {
                      const { getSupabaseBrowserClient } = await import('@/lib/supabase/client')
                      const supabase = getSupabaseBrowserClient()
                      await supabase.auth.signInWithOAuth({
                        provider: 'steam' as Parameters<typeof supabase.auth.signInWithOAuth>[0]['provider'],
                        options: { redirectTo: `${window.location.origin}/steam/callback` },
                      })
                    }}
                    style={{ fontSize: 12, fontWeight: 700, color: '#c6d4df', background: 'linear-gradient(135deg,#1b2838,#2a475e)', border: '1px solid rgba(103,193,245,.2)', borderRadius: 7, padding: '8px 16px', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    🎮 Conectar Steam
                  </button>
                )}
                {user.app_metadata?.provider === 'steam' && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(103,193,245,.08)', border: '1px solid rgba(103,193,245,.2)', borderRadius: 7, padding: '8px 12px', fontSize: 12, color: '#c6d4df', fontWeight: 600 }}>
                    🎮 Steam conectado
                  </div>
                )}
              </div>
            </div>

            {/* ── MOEDA CS2 ── */}
            <div style={{ marginTop: 20, padding: '18px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 12 }}>
              <p className="font-condensed" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                MOEDA MYLINE <span style={{ flex: 1, height: 1, background: 'var(--border)', display: 'block' }} />
                <span style={{ fontSize: 10, color: 'var(--text3)' }}>{unlockedCount} conquistas</span>
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
                {/* Main coin */}
                <CS2Coin tier={cs2Tier as Parameters<typeof CS2Coin>[0]['tier']} size={88} />

                {/* CS2 IQ */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                    <span className="font-condensed font-tech" style={{ fontWeight: 900, fontSize: 40, color: 'var(--cyan)', lineHeight: 1 }}>{cs2IQ.toLocaleString('pt-BR')}</span>
                    <span className="font-condensed" style={{ fontWeight: 700, fontSize: 13, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '.08em' }}>{iqLabel}</span>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 10 }}>MyLine IQ — baseado em pontuação, posição e consistência</p>

                  <div style={{ background: 'var(--border)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 4, transition: 'width 1s',
                      width: `${Math.min(100, ((cs2IQ - 1000) / 2000) * 100)}%`,
                      background: 'linear-gradient(90deg, var(--green), var(--cyan), var(--purple))',
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                    {['Ferro', 'Bronze', 'Prata', 'Ouro', 'Diamante', 'Global'].map(l => (
                      <span key={l} style={{ fontSize: 8, color: 'var(--text3)' }}>{l}</span>
                    ))}
                  </div>
                </div>

                {/* Mini pins */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <CS2Pin icon="🎯" label="1ª Lineup" color="var(--green)" unlocked={stats.lineupCount > 0} />
                  <CS2Pin icon="🏆" label="Pódio" color="var(--gold)" unlocked={stats.bestPosition !== null && stats.bestPosition <= 3} />
                  <CS2Pin icon="👑" label="Elite" color="var(--yellow)" unlocked={stats.totalPoints >= 500} />
                  <CS2Pin icon="🌟" label="Lenda" color="var(--cyan)" unlocked={stats.bestPosition === 1} />
                </div>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: 'Pontos totais',  value: stats.totalPoints.toFixed(1), color: 'linear-gradient(90deg,var(--green),var(--cyan))', icon: '⭐' },
                { label: 'Lineups criadas', value: stats.lineupCount.toString(), color: 'var(--cyan)', icon: '📋' },
                { label: 'Melhor posição', value: stats.bestPosition ? `#${stats.bestPosition}` : '—', color: 'var(--gold)', icon: '🏅' },
                { label: 'Saldo LC',       value: stats.lcBalance.toLocaleString('pt-BR'), color: 'var(--yellow)', icon: '💰' },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: s.color }} />
                  <div style={{ fontSize: 18, marginBottom: 5 }}>{s.icon}</div>
                  <div className="font-condensed font-tech" style={{ fontWeight: 900, fontSize: 22, color: 'var(--white)' }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.08em', marginTop: 3 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div>
            <p className="font-condensed" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              CONQUISTAS <span style={{ color: 'var(--green)' }}>{unlockedCount}/{achievements.length}</span>
              <span style={{ flex: 1, height: 1, background: 'var(--border)', display: 'block' }} />
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {achievements.map(a => {
                const tier = TIER_COLORS[a.tier]
                return (
                  <div key={a.id} style={{
                    background: a.unlocked ? tier.bg : 'var(--bg2)',
                    border: `1px solid ${a.unlocked ? tier.border : 'var(--border)'}`,
                    borderRadius: 8, padding: '10px 12px',
                    opacity: a.unlocked ? 1 : .4,
                    transition: 'all .2s',
                  }}>
                    <div style={{ fontSize: 18, marginBottom: 4, filter: a.unlocked ? 'none' : 'grayscale(1)' }}>{a.icon}</div>
                    <div style={{ fontWeight: 700, fontSize: 11, color: a.unlocked ? tier.color : 'var(--text3)', marginBottom: 2 }}>{a.title}</div>
                    <div style={{ fontSize: 10, color: 'var(--text3)', lineHeight: 1.3 }}>{a.desc}</div>
                    {a.unlocked && <div style={{ marginTop: 5, fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: tier.color }}>✓ Desbloqueada</div>}
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
