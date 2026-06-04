'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { TEAMS, MATCHES, USER_LINEUPS } from '@/data/mockTournament'
import { calcFantasyPoints, calcLineupResult, buildRanking } from '@/lib/fantasyScoring'

const ROLE_COLOR: Record<string, string> = {
  awp:     '#f59e0b', igl: '#8b5cf6', entry: '#ef4444',
  support: '#1e7fff', rifler: '#5a6e90',
}
const ROLE_LABEL: Record<string, string> = {
  awp: 'AWP', igl: 'IGL', entry: 'ENT', support: 'SUP', rifler: 'RIF',
}

const ALL_PLAYERS = TEAMS.flatMap(t => t.players)
const TEAMS_BY_ID = Object.fromEntries(TEAMS.map(t => [t.id, t]))
const PLAYERS_BY_ID = Object.fromEntries(ALL_PLAYERS.map(p => [p.id, p]))

type Tab = 'overview' | 'matches' | 'players' | 'lineups' | 'ranking'

export default function SimuladorPage() {
  const [tab, setTab] = useState<Tab>('overview')
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null)

  const lineupResults = useMemo(
    () => USER_LINEUPS.map(l => calcLineupResult(l, MATCHES, ALL_PLAYERS, TEAMS)),
    []
  )
  const ranking = useMemo(() => buildRanking(lineupResults, USER_LINEUPS, ALL_PLAYERS), [lineupResults])

  const topScorer = useMemo(() => {
    const scores = ALL_PLAYERS.map(p => ({
      player: p,
      pts: MATCHES.reduce((t, m) => {
        const s = m.stats.find(s => s.playerId === p.id)
        return t + (s ? calcFantasyPoints(s) : 0)
      }, 0),
    }))
    return scores.sort((a, b) => b.pts - a.pts)[0]
  }, [])

  const rounds = [1, 2, 3]
  const roundNames = { 1: 'Quartas de Final', 2: 'Semifinal', 3: 'Grande Final' }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: '🏆 Visão Geral' },
    { key: 'matches',  label: '⚔️ Partidas' },
    { key: 'players',  label: '👤 Jogadores' },
    { key: 'lineups',  label: '📋 Lineups' },
    { key: 'ranking',  label: '🏅 Ranking' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', padding: '0 0 40px' }}>
      {/* Header */}
      <div style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)', padding: '20px 24px', marginBottom: 24 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(0,240,117,.1)', border: '1px solid rgba(0,240,117,.25)', borderRadius: 20, padding: '3px 12px', marginBottom: 8, fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--green)' }}>
                ✅ SIMULAÇÃO COMPLETA — FANTASY ENGINE VALIDADA
              </div>
              <h1 className="font-condensed" style={{ fontWeight: 900, fontSize: 28, color: 'var(--white)', textTransform: 'uppercase', letterSpacing: '.04em' }}>
                TESTE · Bounty 2026 Season 2
              </h1>
              <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>
                8 times · 40 jogadores · 7 partidas · 5 lineups · ranking calculado em tempo real
              </p>
            </div>
            <Link href="/dashboard" style={{ fontSize: 12, color: 'var(--text3)', textDecoration: 'none', padding: '7px 14px', border: '1px solid var(--border)', borderRadius: 8 }}>
              ← Arena
            </Link>
          </div>

          {/* Quick stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))', gap: 10, marginTop: 16 }}>
            {[
              { label: 'Campeão',     value: 'Spirit 🏆',           color: 'var(--gold)' },
              { label: 'Top Scorer',  value: `donk — ${topScorer.pts.toFixed(1)} pts`, color: 'var(--green)' },
              { label: '1º Lugar',    value: ranking[0]?.username ?? '—', color: 'var(--cyan)' },
              { label: 'Total pts',   value: `${ranking[0]?.totalPoints ?? 0}`,  color: 'var(--white)' },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 3 }}>{s.label}</div>
                <div className="font-condensed font-tech" style={{ fontWeight: 700, fontSize: 16, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              padding: '10px 16px', fontSize: 13, fontWeight: 600, marginBottom: -1,
              color: tab === t.key ? 'var(--green)' : 'var(--text3)',
              borderBottom: tab === t.key ? '2px solid var(--green)' : '2px solid transparent',
            }}>{t.label}</button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Bracket */}
              <div>
                <p className="font-condensed" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 14 }}>
                  CHAVEAMENTO FINAL
                </p>
                {rounds.map(r => (
                  <div key={r} style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 8 }}>
                      {roundNames[r as keyof typeof roundNames]}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {MATCHES.filter(m => m.roundOrder === r).map(m => {
                        const tA = TEAMS_BY_ID[m.teamAId]
                        const tB = TEAMS_BY_ID[m.teamBId]
                        const winner = TEAMS_BY_ID[m.winnerId]
                        return (
                          <div key={m.id} onClick={() => { setSelectedMatch(m.id); setTab('matches') }}
                            style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', cursor: 'pointer', display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 10, alignItems: 'center' }}
                            className="hover-card hover-card-green">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 28, height: 28, borderRadius: 5, background: m.winnerId === m.teamAId ? 'rgba(0,240,117,.15)' : 'var(--bg3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: m.winnerId === m.teamAId ? 'var(--green)' : 'var(--text3)' }}>
                                {tA.name.slice(0,3).toUpperCase()}
                              </div>
                              <span className="font-condensed" style={{ fontWeight: 800, fontSize: 14, color: m.winnerId === m.teamAId ? 'var(--white)' : 'var(--text3)' }}>{tA.name}</span>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                              <div className="font-tech" style={{ fontSize: 16, fontWeight: 700, color: 'var(--white)' }}>{m.scoreA} — {m.scoreB}</div>
                              <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{m.format}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                              <span className="font-condensed" style={{ fontWeight: 800, fontSize: 14, color: m.winnerId === m.teamBId ? 'var(--white)' : 'var(--text3)' }}>{tB.name}</span>
                              <div style={{ width: 28, height: 28, borderRadius: 5, background: m.winnerId === m.teamBId ? 'rgba(0,240,117,.15)' : 'var(--bg3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: m.winnerId === m.teamBId ? 'var(--green)' : 'var(--text3)' }}>
                                {tB.name.slice(0,3).toUpperCase()}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Mini Ranking */}
              <div>
                <p className="font-condensed" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 14 }}>
                  RANKING FANTASY
                </p>
                <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                  {ranking.map((r, i) => (
                    <div key={r.userId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i < ranking.length - 1 ? '1px solid var(--border)' : 'none', background: i === 0 ? 'rgba(255,200,50,.04)' : 'transparent' }}>
                      <span style={{ fontSize: i < 3 ? 20 : 13, width: 28, textAlign: 'center', color: i < 3 ? undefined : 'var(--text3)' }}>
                        {['🥇','🥈','🥉'][i] ?? `#${i+1}`}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div className="font-condensed" style={{ fontWeight: 800, fontSize: 15, color: 'var(--white)' }}>{r.username}</div>
                        <div style={{ fontSize: 10, color: 'var(--text3)' }}>Cap: {r.captainNick}</div>
                      </div>
                      <div className="font-tech" style={{ fontSize: 18, fontWeight: 700, color: i === 0 ? 'var(--gold)' : i === 1 ? 'var(--text2)' : 'var(--text3)' }}>
                        {r.totalPoints}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── MATCHES ── */}
        {tab === 'matches' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {MATCHES.map(m => {
              const tA = TEAMS_BY_ID[m.teamAId]
              const tB = TEAMS_BY_ID[m.teamBId]
              const isOpen = selectedMatch === m.id
              const statsA = m.stats.filter(s => tA.players.some(p => p.id === s.playerId))
              const statsB = m.stats.filter(s => tB.players.some(p => p.id === s.playerId))

              return (
                <div key={m.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
                  {/* Match header */}
                  <div onClick={() => setSelectedMatch(isOpen ? null : m.id)} style={{ padding: '16px 20px', cursor: 'pointer', display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 3 }}>{m.roundName}</div>
                      <div className="font-condensed" style={{ fontWeight: 900, fontSize: 20, color: m.winnerId === m.teamAId ? 'var(--green)' : 'var(--text2)', letterSpacing: '.04em' }}>{tA.name}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div className="font-tech" style={{ fontSize: 28, fontWeight: 700, color: 'var(--white)', letterSpacing: '.04em' }}>{m.scoreA} — {m.scoreB}</div>
                      <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{m.format}</div>
                      <div style={{ fontSize: 10, color: m.winnerId === m.teamAId ? 'var(--green)' : 'var(--cyan)', fontWeight: 700, marginTop: 3 }}>
                        {TEAMS_BY_ID[m.winnerId].name} vence
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 3 }}>{m.format}</div>
                      <div className="font-condensed" style={{ fontWeight: 900, fontSize: 20, color: m.winnerId === m.teamBId ? 'var(--green)' : 'var(--text2)', letterSpacing: '.04em' }}>{tB.name}</div>
                    </div>
                  </div>

                  {/* Stats table */}
                  {isOpen && (
                    <div style={{ borderTop: '1px solid var(--border)', padding: '16px 20px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        {[{ team: tA, stats: statsA, won: m.winnerId === m.teamAId },
                          { team: tB, stats: statsB, won: m.winnerId === m.teamBId }].map(({ team, stats, won }) => (
                          <div key={team.id}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                              <div className="font-condensed" style={{ fontWeight: 900, fontSize: 14, color: won ? 'var(--green)' : 'var(--text2)' }}>{team.name}</div>
                              {won && <span style={{ fontSize: 10, color: 'var(--green)', background: 'rgba(0,240,117,.1)', border: '1px solid rgba(0,240,117,.2)', borderRadius: 10, padding: '1px 7px', fontWeight: 700 }}>VENCEDOR</span>}
                            </div>
                            <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 32px 32px 32px 46px 46px 32px', gap: 4, padding: '5px 10px', borderBottom: '1px solid var(--border)' }}>
                                {['Jogador','K','D','A','ADR','Rtg','Pts'].map(h => (
                                  <span key={h} style={{ fontSize: 8, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text3)', textAlign: h !== 'Jogador' ? 'right' : 'left' }}>{h}</span>
                                ))}
                              </div>
                              {stats.map(s => {
                                const pts = calcFantasyPoints(s)
                                const player = PLAYERS_BY_ID[s.playerId]
                                const color = ROLE_COLOR[player?.role ?? ''] ?? '#5a6e90'
                                return (
                                  <div key={s.playerId} style={{ display: 'grid', gridTemplateColumns: '1fr 32px 32px 32px 46px 46px 32px', gap: 4, padding: '6px 10px', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                      {s.isMvp && <span style={{ fontSize: 10 }}>⭐</span>}
                                      <span style={{ background: `${color}15`, color, borderRadius: 3, padding: '0 4px', fontSize: 7, fontWeight: 700 }}>{ROLE_LABEL[player?.role ?? '']}</span>
                                      <span className="font-condensed" style={{ fontWeight: 700, fontSize: 12, color: 'var(--white)' }}>{player?.nickname ?? s.playerId}</span>
                                    </div>
                                    <span className="font-tech" style={{ fontSize: 11, color: 'var(--green)', textAlign: 'right' }}>{s.kills}</span>
                                    <span className="font-tech" style={{ fontSize: 11, color: 'var(--red)', textAlign: 'right' }}>{s.deaths}</span>
                                    <span className="font-tech" style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'right' }}>{s.assists}</span>
                                    <span className="font-tech" style={{ fontSize: 11, color: s.adr > 80 ? 'var(--yellow)' : 'var(--text3)', textAlign: 'right' }}>{s.adr.toFixed(1)}</span>
                                    <span className="font-tech" style={{ fontSize: 11, color: s.rating > 1.10 ? 'var(--cyan)' : 'var(--text3)', textAlign: 'right' }}>{s.rating.toFixed(2)}</span>
                                    <span className="font-tech" style={{ fontSize: 12, fontWeight: 700, color: pts >= 50 ? 'var(--gold)' : pts >= 30 ? 'var(--green)' : 'var(--text2)', textAlign: 'right' }}>{pts}</span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* ── PLAYERS ── */}
        {tab === 'players' && (
          <div>
            {/* Top 10 */}
            <p className="font-condensed" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 14 }}>
              RANKING DE JOGADORES — PONTUAÇÃO TOTAL DO TORNEIO
            </p>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 100px 70px 70px 70px 70px', gap: 8, padding: '8px 16px', borderBottom: '1px solid var(--border)' }}>
                {['#','Jogador','Time','Preço LC','Role','Rodadas','Pts Total'].map((h,i) => (
                  <span key={h} style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text3)', textAlign: i >= 3 ? 'right' : 'left' }}>{h}</span>
                ))}
              </div>
              {ALL_PLAYERS
                .map(p => ({
                  player: p,
                  pts: MATCHES.reduce((t, m) => {
                    const s = m.stats.find(s => s.playerId === p.id)
                    return t + (s ? calcFantasyPoints(s) : 0)
                  }, 0),
                  rounds: MATCHES.filter(m => m.stats.some(s => s.playerId === p.id)).length,
                }))
                .sort((a, b) => b.pts - a.pts)
                .map(({ player, pts, rounds }, i) => {
                  const team = TEAMS_BY_ID[player.teamId]
                  const color = ROLE_COLOR[player.role] ?? '#5a6e90'
                  return (
                    <div key={player.id} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 100px 70px 70px 70px 70px', gap: 8, padding: '9px 16px', alignItems: 'center', borderBottom: i < ALL_PLAYERS.length - 1 ? '1px solid var(--border)' : 'none', background: i < 3 ? `${color}05` : 'transparent' }}>
                      <span style={{ fontSize: i < 3 ? 16 : 12, textAlign: 'center' }}>
                        {['🥇','🥈','🥉'][i] ?? i + 1}
                      </span>
                      <span className="font-condensed" style={{ fontWeight: 800, fontSize: 14, color: 'var(--white)' }}>{player.nickname}</span>
                      <span style={{ fontSize: 11, color: 'var(--text3)' }}>{team.name}</span>
                      <span className="font-tech" style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'right' }}>{player.priceLc.toLocaleString('pt-BR')}</span>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <span style={{ background: `${color}15`, color, borderRadius: 4, padding: '1px 6px', fontSize: 9, fontWeight: 700 }}>{ROLE_LABEL[player.role]}</span>
                      </div>
                      <span className="font-tech" style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'right' }}>{rounds}</span>
                      <span className="font-tech" style={{ fontSize: 14, fontWeight: 700, color: pts >= 150 ? 'var(--gold)' : pts >= 100 ? 'var(--green)' : 'var(--text2)', textAlign: 'right' }}>{pts.toFixed(1)}</span>
                    </div>
                  )
                })}
            </div>
          </div>
        )}

        {/* ── LINEUPS ── */}
        {tab === 'lineups' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px,1fr))', gap: 16 }}>
            {lineupResults.map((result, rank) => {
              const pos = ranking.find(r => r.userId === result.userId)?.position ?? 0
              return (
                <div key={result.userId} style={{ background: 'var(--bg2)', border: `1px solid ${pos === 1 ? 'rgba(255,200,50,.3)' : 'var(--border)'}`, borderRadius: 14, overflow: 'hidden' }}>
                  <div style={{ height: 3, background: pos === 1 ? 'linear-gradient(90deg,var(--gold),var(--yellow))' : pos <= 3 ? 'linear-gradient(90deg,var(--green),var(--cyan))' : 'var(--border2)' }} />
                  <div style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: pos <= 3 ? 22 : 14, color: 'var(--text3)' }}>
                          {['🥇','🥈','🥉'][pos-1] ?? `#${pos}`}
                        </span>
                        <div>
                          <div className="font-condensed" style={{ fontWeight: 900, fontSize: 16, color: 'var(--white)', letterSpacing: '.03em' }}>{result.username}</div>
                          <div style={{ fontSize: 10, color: 'var(--text3)' }}>Budget: {result.budgetUsed.toLocaleString('pt-BR')} LC</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="font-tech" style={{ fontSize: 24, fontWeight: 700, color: pos === 1 ? 'var(--gold)' : 'var(--green)', lineHeight: 1 }}>{result.totalPoints}</div>
                        <div style={{ fontSize: 9, color: 'var(--text3)' }}>pts totais</div>
                      </div>
                    </div>

                    {result.players.map(p => {
                      const player = PLAYERS_BY_ID[p.playerId]
                      const color = ROLE_COLOR[player?.role ?? ''] ?? '#5a6e90'
                      return (
                        <div key={p.playerId} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: p.isCaptain ? 'rgba(255,200,50,.06)' : 'var(--bg3)', border: `1px solid ${p.isCaptain ? 'rgba(255,200,50,.2)' : 'var(--border)'}`, borderRadius: 7, marginBottom: 5 }}>
                          {p.isCaptain && <span style={{ fontSize: 12 }}>⭐</span>}
                          <span style={{ background: `${color}15`, color, borderRadius: 3, padding: '1px 4px', fontSize: 8, fontWeight: 700 }}>{ROLE_LABEL[player?.role ?? '']}</span>
                          <span className="font-condensed" style={{ flex: 1, fontWeight: 800, fontSize: 13, color: p.isCaptain ? 'var(--gold)' : 'var(--white)' }}>
                            {p.nickname}
                            {p.isCaptain && <span style={{ fontSize: 9, color: 'var(--gold)', marginLeft: 5 }}>1.5×</span>}
                          </span>
                          <span style={{ fontSize: 10, color: 'var(--text3)' }}>{p.teamName}</span>
                          <span className="font-tech" style={{ fontSize: 13, fontWeight: 700, color: p.isCaptain ? 'var(--gold)' : 'var(--green)' }}>{p.finalPoints}</span>
                        </div>
                      )
                    })}

                    {result.captainBonus > 0 && (
                      <div style={{ textAlign: 'right', fontSize: 10, color: 'var(--gold)', marginTop: 6 }}>
                        Bônus capitão: +{result.captainBonus} pts
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── RANKING ── */}
        {tab === 'ranking' && (
          <div>
            <p className="font-condensed" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 14 }}>
              RANKING FINAL — TESTE BOUNTY 2026 S2
            </p>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
              {ranking.map((r, i) => {
                const result = lineupResults.find(l => l.userId === r.userId)!
                const pct = (r.totalPoints / (ranking[0]?.totalPoints || 1)) * 100
                return (
                  <div key={r.userId} style={{ padding: '16px 20px', borderBottom: i < ranking.length - 1 ? '1px solid var(--border)' : 'none', background: i === 0 ? 'rgba(255,200,50,.04)' : 'transparent', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`, background: i === 0 ? 'rgba(255,200,50,.04)' : 'rgba(0,240,117,.02)', transition: 'width .5s' }} />
                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: i < 3 ? 28 : 18, width: 40, textAlign: 'center' }}>
                        {['🥇','🥈','🥉'][i] ?? `#${i+1}`}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div className="font-condensed" style={{ fontWeight: 900, fontSize: 18, color: 'var(--white)', marginBottom: 3 }}>{r.username}</div>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 11, color: 'var(--text3)' }}>
                            Cap: <strong style={{ color: 'var(--gold)' }}>{r.captainNick}</strong>
                          </span>
                          <span style={{ fontSize: 11, color: 'var(--text3)' }}>
                            Budget: {r.budgetUsed.toLocaleString('pt-BR')} LC
                          </span>
                          <span style={{ fontSize: 11, color: 'var(--text3)' }}>
                            5 jogadores
                          </span>
                        </div>
                        {/* Player breakdown */}
                        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                          {result.players.map(p => (
                            <div key={p.playerId} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: p.isCaptain ? 'rgba(255,200,50,.1)' : 'var(--bg3)', border: `1px solid ${p.isCaptain ? 'rgba(255,200,50,.2)' : 'var(--border)'}`, borderRadius: 6, padding: '3px 8px' }}>
                              {p.isCaptain && <span style={{ fontSize: 9 }}>⭐</span>}
                              <span style={{ fontSize: 11, color: p.isCaptain ? 'var(--gold)' : 'var(--text2)', fontWeight: 600 }}>{p.nickname}</span>
                              <span className="font-tech" style={{ fontSize: 10, color: 'var(--green)' }}>{p.finalPoints}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div className="font-tech" style={{ fontSize: 36, fontWeight: 700, color: i === 0 ? 'var(--gold)' : i === 1 ? '#aaa' : i === 2 ? '#c05' : 'var(--text2)', lineHeight: 1 }}>
                          {r.totalPoints}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>pontos</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
