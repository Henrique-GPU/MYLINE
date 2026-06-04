'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

type StatusType = 'complete' | 'incomplete' | 'out' | 'loading'

interface Props {
  id: string
  name: string
  status: string
  initialLc: number
  accentColor: string
  bannerUrl: string | null
  org: string
  prize: string
  location: string
  dates: string
  flagEmoji: string
  teams: number
  format: string
  invitedTeams: string[]
  roundId: string
  participants?: number
  featuredRewards?: { pos: string; lc: string }[]
}

function pad(n: number) { return String(n).padStart(2, '0') }

export function ChampionshipCard(props: Props) {
  const { id, name, status, accentColor, bannerUrl, org, prize, location, dates, flagEmoji, teams, invitedTeams, roundId, featuredRewards } = props
  const participants = props.participants ?? Math.floor(Math.random() * 4000 + 800)

  const [lineupStatus, setLineupStatus] = useState<StatusType>('loading')
  const [userPosition, setUserPosition] = useState<number | null>(null)
  const [userPoints, setUserPoints] = useState<number>(0)
  const [now, setNow] = useState(Date.now())
  const [marketTarget] = useState(() => Date.now() + 2 * 60 * 60 * 1000 + 14 * 60 * 1000)

  useEffect(() => {
    const id2 = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id2)
  }, [])

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLineupStatus('out'); return }

      const { data: lineup } = await supabase
        .from('lineups')
        .select('id')
        .eq('user_id', user.id)
        .eq('round_id', roundId)
        .single()

      if (!lineup) { setLineupStatus('out'); return }

      const { count } = await supabase
        .from('lineup_players')
        .select('*', { count: 'exact', head: true })
        .eq('lineup_id', lineup.id)

      setLineupStatus((count ?? 0) >= 5 ? 'complete' : 'incomplete')

      // Mock position
      setUserPosition(Math.floor(Math.random() * 400) + 50)
      setUserPoints(Math.floor(Math.random() * 300) + 200)
    }
    check()
  }, [roundId])

  const diff = Math.max(0, marketTarget - now)
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  const marketOpen = diff > 0 && status !== 'finished'

  const statusConfig = {
    complete:   { dot: '🟢', label: 'Lineup Completa',   color: 'var(--green)', bg: 'rgba(0,240,117,.08)', border: 'rgba(0,240,117,.2)' },
    incomplete: { dot: '🟡', label: 'Escalação Pendente', color: 'var(--yellow)', bg: 'rgba(245,158,11,.08)', border: 'rgba(245,158,11,.2)' },
    out:        { dot: '🔴', label: 'Não Participando',   color: 'var(--red)',  bg: 'rgba(239,68,68,.08)', border: 'rgba(239,68,68,.15)' },
    loading:    { dot: '⬜', label: '...',                color: 'var(--text3)', bg: 'var(--bg3)', border: 'var(--border)' },
  }[lineupStatus]

  const isFinished = status === 'finished'

  return (
    <div style={{
      background: 'var(--bg2)',
      border: `1px solid ${lineupStatus === 'complete' ? 'rgba(0,240,117,.2)' : lineupStatus === 'incomplete' ? 'rgba(245,158,11,.2)' : `${accentColor}20`}`,
      borderRadius: 16, overflow: 'hidden',
      transition: 'all .25s',
      boxShadow: lineupStatus === 'complete' ? '0 0 20px rgba(0,240,117,.06)' : 'none',
    }}
      className="hover-card">

      {/* ── BANNER ── */}
      <div style={{ height: 120, position: 'relative', overflow: 'hidden', background: `linear-gradient(180deg,#01000a,#0d0300 60%,${accentColor}18)` }}>
        {bannerUrl && <img src={bannerUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%', opacity: .42 }} />}
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, rgba(1,0,10,.15), transparent 40%, rgba(1,0,10,.9) 100%)` }} />
        <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', height: 60, background: `radial-gradient(ellipse 60% 100% at 50% 100%, ${accentColor}40, transparent)` }} />

        {/* Status pill */}
        <div style={{ position: 'absolute', top: 10, left: 12, display: 'flex', alignItems: 'center', gap: 5, background: statusConfig.bg, border: `1px solid ${statusConfig.border}`, borderRadius: 20, padding: '3px 9px' }}>
          <span style={{ fontSize: 8 }}>{statusConfig.dot}</span>
          <span style={{ fontSize: 9, fontWeight: 700, color: statusConfig.color, letterSpacing: '.06em' }}>{statusConfig.label}</span>
        </div>

        {/* Prize badge */}
        <div style={{ position: 'absolute', top: 10, right: 12, background: `${accentColor}18`, border: `1px solid ${accentColor}30`, borderRadius: 20, padding: '3px 9px', display: 'flex', gap: 4, alignItems: 'center' }}>
          <span style={{ fontSize: 10 }}>💰</span>
          <span className="font-tech" style={{ fontSize: 10, fontWeight: 700, color: 'var(--gold)' }}>{prize}</span>
        </div>

        {/* Event name */}
        <div style={{ position: 'absolute', bottom: 10, left: 14, right: 14, zIndex: 2 }}>
          <div className="font-condensed" style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: `${accentColor}aa`, marginBottom: 2 }}>{org}</div>
          <h3 className="font-condensed" style={{ fontWeight: 900, fontSize: 18, color: '#fff', textTransform: 'uppercase', letterSpacing: '.02em', lineHeight: .95 }}>
            {name.replace('2026','').replace('Season','S').trim()}
          </h3>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ padding: '12px 14px 14px' }}>

        {/* Countdown + participants */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
          <div style={{ background: marketOpen ? 'rgba(239,68,68,.06)' : 'var(--bg3)', border: `1px solid ${marketOpen ? 'rgba(239,68,68,.2)' : 'var(--border)'}`, borderRadius: 8, padding: '7px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: 'var(--text3)', marginBottom: 2 }}>
              {isFinished ? '🔒 Mercado' : marketOpen ? '⏳ Fecha em' : '✅ Mercado'}
            </div>
            {isFinished ? (
              <div className="font-tech" style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)' }}>ENCERRADO</div>
            ) : marketOpen ? (
              <div className="font-tech" style={{ fontSize: 14, fontWeight: 700, color: 'var(--red)', animation: h < 1 ? 'blink .9s ease-in-out infinite' : 'none' }}>
                {pad(h)}:{pad(m)}:{pad(s)}
              </div>
            ) : (
              <div className="font-tech" style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)' }}>ABERTO</div>
            )}
          </div>
          <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: 'var(--text3)', marginBottom: 2 }}>👥 Participantes</div>
            <div className="font-tech" style={{ fontSize: 14, fontWeight: 700, color: 'var(--white)' }}>{participants.toLocaleString('pt-BR')}</div>
          </div>
        </div>

        {/* User position (if participating) */}
        {(lineupStatus === 'complete' || lineupStatus === 'incomplete') && userPosition && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 10 }}>
            {[
              { label: 'Posição', value: `#${userPosition}`, color: userPosition <= 10 ? 'var(--gold)' : userPosition <= 100 ? 'var(--green)' : 'var(--white)' },
              { label: 'Pontos',  value: `${userPoints}`, color: 'var(--cyan)' },
              { label: 'Proj.',   value: `~${userPoints + Math.floor(Math.random()*30+10)}`, color: 'var(--text2)' },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 6px', textAlign: 'center' }}>
                <div style={{ fontSize: 8, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{s.label}</div>
                <div className="font-tech" style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Fantasy Rewards */}
        {featuredRewards && (
          <div style={{ background: 'rgba(255,200,50,.05)', border: '1px solid rgba(255,200,50,.15)', borderRadius: 8, padding: '8px 10px', marginBottom: 10 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 5 }}>🏆 Fantasy Rewards</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {featuredRewards.map(r => (
                <div key={r.pos} style={{ flex: 1, textAlign: 'center' }}>
                  <div className="font-condensed" style={{ fontSize: 9, color: 'var(--text3)' }}>{r.pos}</div>
                  <div className="font-tech" style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold)' }}>{r.lc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Location pills */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
          {[flagEmoji + ' ' + location, `${teams} times`, dates].map(pill => (
            <div key={pill} style={{ display: 'inline-flex', alignItems: 'center', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 20, padding: '3px 8px', fontSize: 9, color: 'var(--text2)', fontWeight: 600 }}>
              {pill}
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: 6 }}>
          <Link href={`/fantasy/${id}`} style={{
            flex: 2, textAlign: 'center', padding: '9px 8px',
            background: isFinished ? 'var(--bg3)' : lineupStatus === 'complete'
              ? 'linear-gradient(90deg,var(--green),var(--cyan))'
              : `linear-gradient(90deg,${accentColor},${accentColor}cc)`,
            color: isFinished ? 'var(--text2)' : '#000',
            fontFamily: 'inherit', fontWeight: 900, fontSize: 12,
            letterSpacing: '.05em', textTransform: 'uppercase', textDecoration: 'none',
            borderRadius: 9, border: isFinished ? '1px solid var(--border)' : 'none',
            boxShadow: !isFinished ? `0 0 14px ${accentColor}25` : 'none',
            transition: 'all .15s',
          }}>
            {isFinished ? '📊 Resultado' : lineupStatus === 'complete' ? '✅ Ver Lineup' : '⚡ Montar Lineup'}
          </Link>
          <Link href={`/fantasy/${id}/ranking`} style={{
            flex: 1, textAlign: 'center', padding: '9px 6px',
            background: 'var(--bg3)', color: 'var(--text2)',
            fontFamily: 'inherit', fontWeight: 600, fontSize: 11,
            letterSpacing: '.04em', textDecoration: 'none',
            borderRadius: 9, border: '1px solid var(--border)',
            transition: 'all .15s',
          }}>
            🏆 Ranking
          </Link>
        </div>
      </div>
    </div>
  )
}
