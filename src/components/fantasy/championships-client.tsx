'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ChampionshipFilters } from './championship-filters'
import { ChampionshipCard } from './championship-card'
import type { getEventMeta } from '@/lib/events'

type EventMeta = ReturnType<typeof getEventMeta>

interface Championship {
  id: string
  name: string
  status: string
  initial_lc: number
}

interface Props {
  championships: Championship[]
  metas: Record<string, EventMeta>
  bannerUrls: Record<string, string | null>
  roundId: string
}

const FANTASY_REWARDS = [
  { pos: '🥇 Top 1',   lc: '50.000 LC' },
  { pos: '🥈 Top 10',  lc: '10.000 LC' },
  { pos: '🥉 Top 100', lc: '1.000 LC'  },
]

export function ChampionshipsClient({ championships, metas, bannerUrls, roundId }: Props) {
  const [filter, setFilter] = useState('all')

  const featured = championships.find(c => c.status === 'active') ?? championships.find(c => c.status === 'upcoming') ?? championships[0]

  const filtered = championships.filter(c => {
    if (filter === 'active')   return c.status === 'active'
    if (filter === 'upcoming') return c.status === 'upcoming'
    if (filter === 'finished') return c.status === 'finished'
    return true
  })

  const counts = {
    all:      championships.length,
    active:   championships.filter(c => c.status === 'active').length,
    upcoming: championships.filter(c => c.status === 'upcoming').length,
    finished: championships.filter(c => c.status === 'finished').length,
    mine:     0,
  }

  const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
    active:   { label: 'AO VIVO',  cls: 's-live' },
    upcoming: { label: 'EM BREVE', cls: 's-soon' },
    finished: { label: 'ENCERRADO', cls: 's-done' },
  }

  return (
    <>
      {/* ── HERO CARD — Campeonato da Semana ── */}
      {featured && (() => {
        const meta = metas[featured.name]
        const bannerUrl = bannerUrls[featured.name]
        const accent = meta.accentColor
        return (
          <div style={{
            background: 'var(--bg2)', border: `2px solid ${accent}30`, borderRadius: 18,
            overflow: 'hidden', marginBottom: 24,
            boxShadow: `0 0 40px ${accent}15`,
          }}>
            {/* Banner */}
            <div style={{ height: 200, position: 'relative', overflow: 'hidden', background: `linear-gradient(180deg,#02010a,#100300 60%,${accent}25)` }}>
              {bannerUrl && <img src={bannerUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%', opacity: .55 }} />}
              <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, rgba(1,0,10,.1), transparent 30%, rgba(1,0,10,.88) 100%)` }} />
              <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', height: 100, background: `radial-gradient(ellipse 70% 100% at 50% 100%, ${accent}50, transparent)` }} />

              {/* HOT badge */}
              <div style={{ position: 'absolute', top: 16, left: 16, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(239,68,68,.15)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 20, padding: '5px 12px' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red)', display: 'inline-block', animation: 'blink .9s ease-in-out infinite' }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--red)', letterSpacing: '.1em', textTransform: 'uppercase' }}>
                  🔥 CAMPEONATO DA SEMANA
                </span>
              </div>

              {/* Prize */}
              <div style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,200,50,.12)', border: '1px solid rgba(255,200,50,.3)', borderRadius: 20, padding: '5px 12px', display: 'flex', gap: 5, alignItems: 'center' }}>
                <span style={{ fontSize: 14 }}>💰</span>
                <span className="font-tech" style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold)' }}>{meta.prize}</span>
              </div>

              {/* Event info */}
              <div style={{ position: 'absolute', bottom: 20, left: 24, right: 24, zIndex: 2 }}>
                <div className="font-condensed" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: `${accent}bb`, marginBottom: 4 }}>{meta.org.toUpperCase()}</div>
                <h2 className="font-condensed" style={{ fontWeight: 900, fontSize: 'clamp(24px,4vw,40px)', color: '#fff', textTransform: 'uppercase', letterSpacing: '.02em', lineHeight: .9, textShadow: '0 2px 12px rgba(0,0,0,.8)' }}>
                  {featured.name.replace('2026','').replace('Season','S').trim()}
                </h2>
              </div>
            </div>

            {/* Hero body */}
            <div style={{ padding: '18px 24px 20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12, marginBottom: 16 }}>
                {[
                  { icon: '👥', label: 'Participantes', value: '5.482' },
                  { icon: '⏳', label: 'Mercado fecha', value: '03h 11m', urgent: true },
                  { icon: '💎', label: 'Fantasy Prize', value: '50.000 LC', gold: true },
                  { icon: meta.flagEmoji, label: 'Local', value: meta.location },
                  { icon: '📅', label: 'Datas', value: meta.dates },
                ].map(s => (
                  <div key={s.label} style={{ background: 'var(--bg3)', border: `1px solid ${s.urgent ? 'rgba(239,68,68,.2)' : s.gold ? 'rgba(255,200,50,.2)' : 'var(--border)'}`, borderRadius: 10, padding: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: 14, marginBottom: 4 }}>{s.icon}</div>
                    <div className="font-tech" style={{ fontSize: 14, fontWeight: 700, color: s.urgent ? 'var(--red)' : s.gold ? 'var(--gold)' : 'var(--white)', animation: s.urgent ? 'blink 1.5s ease-in-out infinite' : 'none' }}>
                      {s.value}
                    </div>
                    <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.07em', marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Fantasy Rewards strip */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,200,50,.06)', border: '1px solid rgba(255,200,50,.15)', borderRadius: 10, padding: '10px 14px' }}>
                  <span style={{ fontSize: 16 }}>🏆</span>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--gold)', letterSpacing: '.08em', textTransform: 'uppercase' }}>Fantasy Rewards</div>
                    <div style={{ display: 'flex', gap: 14, marginTop: 3 }}>
                      {FANTASY_REWARDS.map(r => (
                        <span key={r.pos} style={{ fontSize: 11, color: 'var(--text2)' }}>
                          <span className="font-tech" style={{ color: 'var(--gold)', fontWeight: 700 }}>{r.lc}</span> {r.pos}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <Link href={`/fantasy/${featured.id}/mercado`} style={{
                  flex: 3, textAlign: 'center', padding: '13px',
                  background: `linear-gradient(90deg, ${accent}, ${accent}cc)`,
                  color: '#000', fontFamily: 'inherit', fontWeight: 900, fontSize: 15,
                  letterSpacing: '.06em', textTransform: 'uppercase', textDecoration: 'none',
                  borderRadius: 12, boxShadow: `0 0 24px ${accent}35`,
                }}>
                  🔥 Montar Lineup
                </Link>
                <Link href={`/fantasy/${featured.id}/ranking`} style={{
                  flex: 1, textAlign: 'center', padding: '13px',
                  background: 'var(--bg3)', color: 'var(--text2)',
                  fontFamily: 'inherit', fontWeight: 600, fontSize: 13, textDecoration: 'none',
                  borderRadius: 12, border: '1px solid var(--border)',
                }}>
                  🏆 Ranking
                </Link>
                <Link href={`/fantasy/${featured.id}`} style={{
                  flex: 1, textAlign: 'center', padding: '13px',
                  background: 'var(--bg3)', color: 'var(--text2)',
                  fontFamily: 'inherit', fontWeight: 600, fontSize: 13, textDecoration: 'none',
                  borderRadius: 12, border: '1px solid var(--border)',
                }}>
                  📋 Detalhes
                </Link>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── SUAS LIGAS STRIP ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'var(--bg2)', border: '1px solid rgba(139,92,246,.2)', borderRadius: 12, marginBottom: 20, overflowX: 'auto' }}>
        <span className="font-condensed" style={{ fontWeight: 700, fontSize: 12, color: 'var(--purple)', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '.08em' }}>🏅 Suas Ligas:</span>
        {[
          { name: 'Amigos do CS', pos: 3, n: 18 },
          { name: 'Empresa XPTO', pos: 1, n: 27 },
        ].map(liga => (
          <Link key={liga.name} href="/ligas" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 20, padding: '5px 12px', whiteSpace: 'nowrap', flexShrink: 0 }}>
            <span style={{ fontSize: 11 }}>{liga.pos === 1 ? '🥇' : '🏅'}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--white)' }}>{liga.name}</span>
            <span style={{ fontSize: 10, color: 'var(--text3)' }}>#{liga.pos} · {liga.n}</span>
          </Link>
        ))}
        <Link href="/ligas/criar" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', background: 'rgba(139,92,246,.1)', border: '1px solid rgba(139,92,246,.25)', borderRadius: 20, fontSize: 11, fontWeight: 700, color: 'var(--purple)', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
          ➕ Criar Liga
        </Link>
      </div>

      {/* ── FILTERS ── */}
      <ChampionshipFilters onFilter={setFilter} counts={counts} />

      {/* ── GRID ── */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14 }}>
          <p style={{ color: 'var(--text3)', fontSize: 13 }}>Nenhum campeonato nesta categoria.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: 14 }}>
          {filtered.map(c => {
            const meta = metas[c.name]
            return (
              <ChampionshipCard
                key={c.id}
                id={c.id}
                name={c.name}
                status={c.status}
                initialLc={c.initial_lc}
                accentColor={meta.accentColor}
                bannerUrl={bannerUrls[c.name]}
                org={meta.org}
                prize={meta.prize}
                location={meta.location}
                dates={meta.dates}
                flagEmoji={meta.flagEmoji}
                teams={meta.teams}
                format={meta.format}
                invitedTeams={meta.invitedTeams}
                roundId={roundId}
                featuredRewards={FANTASY_REWARDS}
              />
            )
          })}
        </div>
      )}

      {/* ── MONETIZAÇÃO CTA ── */}
      <div style={{ marginTop: 28, background: 'var(--bg2)', border: '1px solid rgba(255,200,50,.2)', borderRadius: 14, padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'center' }}>
        <div style={{ height: 2, background: 'linear-gradient(90deg,var(--gold),var(--orange))', margin: '-20px -24px 16px', gridColumn: '1/-1', borderRadius: '14px 14px 0 0' }} />
        <div>
          <div className="font-condensed" style={{ fontWeight: 900, fontSize: 18, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 6 }}>🏆 Crie sua Liga Particular</div>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>
            Convide amigos, configure premiações e monte o campeonato do seu time.
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {['Até 10 participantes grátis', 'Logo personalizada', 'Mata-mata', 'Premiações reais', 'Chat exclusivo'].map(f => (
              <span key={f} style={{ fontSize: 12, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ color: 'var(--gold)' }}>★</span> {f}
              </span>
            ))}
          </div>
        </div>
        <Link href="/ligas/criar" className="btn-orange" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 10,
          padding: '12px 24px', fontSize: 13, fontWeight: 900, textDecoration: 'none',
          fontFamily: 'inherit', letterSpacing: '.06em', textTransform: 'uppercase', whiteSpace: 'nowrap',
        }}>
          🚀 Criar Liga
        </Link>
      </div>
    </>
  )
}
