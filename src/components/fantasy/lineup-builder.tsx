'use client'

import { useState, useEffect, useTransition } from 'react'
import Image from 'next/image'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

const BUDGET = 100_000
const MAX_PLAYERS = 5

type Team = { id: string; name: string; hltv_id: number | null }

type PlayerWithPrice = {
  player_id: string
  price: number
  price_change: number
  nickname: string
  role: string | null
  hltv_id: number | null
  team: Team | null
}

type LineupSlot = { player: PlayerWithPrice; is_captain: boolean }

const ROLE_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  awper:   { bg: 'rgba(245,158,11,.12)', color: '#f59e0b', label: 'AWP' },
  igl:     { bg: 'rgba(139,92,246,.12)', color: '#8b5cf6', label: 'IGL' },
  entry:   { bg: 'rgba(239,68,68,.12)',  color: '#ef4444', label: 'ENT' },
  support: { bg: 'rgba(30,127,255,.12)', color: '#1e7fff', label: 'SUP' },
  rifler:  { bg: 'rgba(255,255,255,.06)', color: '#5a6e90', label: 'RIF' },
}

function formatLC(v: number) { return v.toLocaleString('pt-BR') }

function playerPhotoUrl(hltv_id: number | null) {
  return hltv_id ? `/api/img/player/${hltv_id}` : null
}
function teamLogoUrl(hltv_id: number | null) {
  return hltv_id ? `/api/img/team/${hltv_id}` : null
}

function RoleBadge({ role }: { role: string | null }) {
  if (!role) return null
  const r = ROLE_STYLE[role] ?? ROLE_STYLE.rifler
  return (
    <span style={{ background: r.bg, color: r.color, border: `1px solid ${r.color}40`, borderRadius: 4, padding: '1px 6px', fontSize: 9, fontWeight: 700, letterSpacing: '.06em' }}>
      {r.label}
    </span>
  )
}

function PlayerAvatar({ hltv_id, nickname, size = 36 }: { hltv_id: number | null; nickname: string; size?: number }) {
  const [err, setErr] = useState(false)
  const url = playerPhotoUrl(hltv_id)

  if (url && !err) {
    return (
      <div style={{ width: size, height: size, borderRadius: 6, overflow: 'hidden', background: 'var(--bg3)', flexShrink: 0, border: '1px solid var(--border)' }}>
        <Image
          src={url}
          alt={nickname}
          width={size}
          height={size}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
          onError={() => setErr(true)}
          unoptimized
        />
      </div>
    )
  }

  const initials = nickname.slice(0, 2).toUpperCase()
  const colors = ['#00f075','#00d4ff','#f59e0b','#8b5cf6','#ef4444','#1e7fff']
  const color = colors[nickname.charCodeAt(0) % colors.length]
  return (
    <div style={{
      width: size, height: size, borderRadius: 6, flexShrink: 0,
      background: `${color}22`, border: `1px solid ${color}44`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.33, fontWeight: 900, color, fontFamily: 'var(--font-condensed)',
    }}>
      {initials}
    </div>
  )
}

function TeamLogo({ hltv_id, name, size = 32 }: { hltv_id: number | null; name: string; size?: number }) {
  const [err, setErr] = useState(false)
  const url = teamLogoUrl(hltv_id)

  if (url && !err) {
    return (
      <div style={{ width: size, height: size, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Image src={url} alt={name} width={size} height={size} style={{ objectFit: 'contain' }} onError={() => setErr(true)} unoptimized />
      </div>
    )
  }
  return (
    <div style={{ width: size, height: size, borderRadius: 6, background: 'var(--bg3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: 'var(--text3)', flexShrink: 0 }}>
      {name.slice(0, 2).toUpperCase()}
    </div>
  )
}

function PriceChange({ pct }: { pct: number }) {
  if (pct === 0) return <span style={{ color: 'var(--text3)', fontSize: 10 }}>—</span>
  const pos = pct > 0
  return <span style={{ color: pos ? 'var(--green)' : 'var(--red)', fontSize: 10, fontWeight: 700 }}>{pos ? '▲' : '▼'} {Math.abs(pct * 100).toFixed(1)}%</span>
}

export function LineupBuilder({ championshipId, roundId, roundName }: { championshipId: string; roundId: string; roundName: string }) {
  const [players, setPlayers] = useState<PlayerWithPrice[]>([])
  const [lineup, setLineup] = useState<LineupSlot[]>([])
  const [tab, setTab] = useState<'players' | 'teams'>('players')
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const spent = lineup.reduce((s, sl) => s + sl.player.price, 0)
  const remaining = BUDGET - spent
  const budgetPct = Math.max(0, Math.min(100, (remaining / BUDGET) * 100))

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    async function load() {
      setLoading(true)
      const { data: prices } = await supabase.from('player_prices').select('player_id, price, price_change').eq('round_id', roundId).order('price', { ascending: false })
      if (!prices?.length) { setLoading(false); return }

      const ids = prices.map(p => p.player_id)
      const { data: pRows } = await supabase.from('players').select('id, nickname, role, team_id, hltv_id').in('id', ids)
      const teamIds = [...new Set((pRows ?? []).map(p => p.team_id).filter(Boolean))]
      const { data: tRows } = teamIds.length ? await supabase.from('teams').select('id, name, hltv_id').in('id', teamIds as string[]) : { data: [] }

      const tById = Object.fromEntries((tRows ?? []).map(t => [t.id, t]))
      const pById = Object.fromEntries((pRows ?? []).map(p => [p.id, p]))

      const merged: PlayerWithPrice[] = prices.map(pp => {
        const p = pById[pp.player_id]
        return {
          player_id: pp.player_id, price: pp.price, price_change: pp.price_change,
          nickname: p?.nickname ?? '???', role: p?.role ?? null,
          hltv_id: p?.hltv_id ?? null,
          team: p?.team_id ? (tById[p.team_id] ?? null) : null,
        }
      })
      setPlayers(merged)

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: ex } = await supabase.from('lineups').select('id').eq('user_id', user.id).eq('round_id', roundId).single()
        if (ex) {
          const { data: slots } = await supabase.from('lineup_players').select('player_id, is_captain').eq('lineup_id', ex.id)
          setLineup((slots ?? []).map(s => { const pl = merged.find(p => p.player_id === s.player_id); return pl ? { player: pl, is_captain: s.is_captain } : null }).filter(Boolean) as LineupSlot[])
        }
      }
      setLoading(false)
    }
    load()
  }, [roundId])

  function add(p: PlayerWithPrice) {
    if (lineup.length >= MAX_PLAYERS || lineup.some(s => s.player.player_id === p.player_id) || remaining < p.price) return
    setLineup(prev => [...prev, { player: p, is_captain: false }])
  }
  function remove(id: string) { setLineup(prev => prev.filter(s => s.player.player_id !== id)) }
  function setCap(id: string) { setLineup(prev => prev.map(s => ({ ...s, is_captain: s.player.player_id === id }))) }
  const inLineup = (id: string) => lineup.some(s => s.player.player_id === id)

  async function save() {
    setSaveError(null); setSaved(false)
    const supabase = getSupabaseBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaveError('Faça login.'); return }
    if (!lineup.length) { setSaveError('Adicione ao menos 1 jogador.'); return }
    let lineupId: string
    const { data: ex } = await supabase.from('lineups').select('id').eq('user_id', user.id).eq('round_id', roundId).single()
    if (ex) { lineupId = ex.id; await supabase.from('lineup_players').delete().eq('lineup_id', lineupId) }
    else {
      const { data: cr, error } = await supabase.from('lineups').insert({ user_id: user.id, championship_id: championshipId, round_id: roundId }).select('id').single()
      if (error || !cr) { setSaveError(error?.message ?? 'Erro.'); return }
      lineupId = cr.id
    }
    const { error } = await supabase.from('lineup_players').insert(lineup.map(s => ({ lineup_id: lineupId, player_id: s.player.player_id, is_captain: s.is_captain })))
    if (error) { setSaveError(error.message); return }
    setSaved(true)
  }

  // ── Filtered players list ──
  const filtered = players.filter(p => {
    const q = search.toLowerCase()
    return (p.nickname.toLowerCase().includes(q) || (p.team?.name ?? '').toLowerCase().includes(q))
      && (filterRole === 'all' || p.role === filterRole)
  })

  // ── Grouped by team ──
  const byTeam = players.reduce((acc, p) => {
    const key = p.team?.id ?? '__'
    if (!acc[key]) acc[key] = { team: p.team, players: [] }
    acc[key].players.push(p)
    return acc
  }, {} as Record<string, { team: Team | null; players: PlayerWithPrice[] }>)

  const teamGroups = Object.values(byTeam).sort((a, b) =>
    Math.max(...b.players.map(p => p.price)) - Math.max(...a.players.map(p => p.price))
  )

  function AddBtn({ player }: { player: PlayerWithPrice }) {
    const added = inLineup(player.player_id)
    const canAdd = !added && lineup.length < MAX_PLAYERS && remaining >= player.price
    return (
      <button onClick={() => added ? remove(player.player_id) : add(player)} disabled={!added && !canAdd} style={{
        width: 28, height: 28, borderRadius: 6, flexShrink: 0,
        background: added ? 'rgba(239,68,68,.08)' : canAdd ? 'rgba(0,240,117,.08)' : 'transparent',
        border: added ? '1px solid rgba(239,68,68,.3)' : canAdd ? '1px solid rgba(0,240,117,.3)' : '1px solid var(--border)',
        color: added ? 'var(--red)' : canAdd ? 'var(--green)' : 'var(--text3)',
        fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: added || canAdd ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
      }}>
        {added ? '−' : '+'}
      </button>
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 16, alignItems: 'start' }}>

      {/* ── LEFT PANEL ── */}
      <div>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border)', marginBottom: 14 }}>
          {([['players', '👤 Jogadores'], ['teams', '🛡️ Times']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              padding: '10px 16px', fontSize: 13, fontWeight: 600, marginBottom: -1,
              color: tab === key ? 'var(--green)' : 'var(--text3)',
              borderBottom: tab === key ? '2px solid var(--green)' : '2px solid transparent',
              transition: 'all .15s',
            }}>
              {label}
            </button>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>{players.length} jogadores</span>
          </div>
        </div>

        {/* Search + filter (only on players tab) */}
        {tab === 'players' && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <input type="text" placeholder="Buscar jogador ou time..." value={search} onChange={e => setSearch(e.target.value)} style={{
              flex: 1, minWidth: 160, background: 'var(--bg2)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '7px 12px', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'inherit',
            }} />
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {['all', 'awper', 'igl', 'entry', 'support', 'rifler'].map(r => (
                <button key={r} onClick={() => setFilterRole(r)} style={{
                  background: filterRole === r ? 'rgba(0,240,117,.08)' : 'var(--bg2)',
                  border: filterRole === r ? '1px solid rgba(0,240,117,.35)' : '1px solid var(--border)',
                  color: filterRole === r ? 'var(--green)' : 'var(--text2)',
                  borderRadius: 7, padding: '5px 11px', fontSize: 11, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize',
                }}>
                  {r === 'all' ? 'Todos' : r}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 13 }}>Carregando jogadores...</div>
        ) : tab === 'players' ? (
          /* ── PLAYERS TAB ── */
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr 90px 80px 50px 36px', gap: 8, padding: '7px 12px', borderBottom: '1px solid var(--border)' }}>
              {['', 'Jogador', 'Time', 'Preço', 'Var.', ''].map((h, i) => (
                <span key={i} style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text3)', textAlign: i >= 3 ? 'right' : 'left' }}>{h}</span>
              ))}
            </div>
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '28px 20px', color: 'var(--text3)', fontSize: 13 }}>
                {players.length === 0 ? 'Nenhum jogador nesta rodada.' : 'Nenhum resultado.'}
              </div>
            ) : filtered.map((p, i) => (
              <div key={p.player_id} style={{
                display: 'grid', gridTemplateColumns: '36px 1fr 90px 80px 50px 36px', gap: 8,
                padding: '8px 12px', alignItems: 'center',
                borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                background: inLineup(p.player_id) ? 'rgba(0,240,117,.03)' : 'transparent',
                borderLeft: inLineup(p.player_id) ? '2px solid var(--green)' : '2px solid transparent',
              }}>
                <PlayerAvatar hltv_id={p.hltv_id} nickname={p.nickname} size={34} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                  <span className="font-condensed" style={{ fontWeight: 800, fontSize: 15, color: 'var(--white)', letterSpacing: '.03em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.nickname}</span>
                  <RoleBadge role={p.role} />
                </div>
                <span style={{ fontSize: 11, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.team?.name ?? '—'}</span>
                <span className="font-tech" style={{ fontSize: 13, fontWeight: 700, color: 'var(--white)', textAlign: 'right' }}>{formatLC(p.price)}</span>
                <div style={{ textAlign: 'right' }}><PriceChange pct={p.price_change} /></div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}><AddBtn player={p} /></div>
              </div>
            ))}
          </div>
        ) : (
          /* ── TEAMS TAB ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {teamGroups.map(({ team, players: tp }) => (
              <div key={team?.id ?? '__'} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                {/* Team header */}
                <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,.01)' }}>
                  <TeamLogo hltv_id={team?.hltv_id ?? null} name={team?.name ?? '?'} size={28} />
                  <span className="font-condensed" style={{ fontWeight: 900, fontSize: 16, color: 'var(--white)', letterSpacing: '.04em' }}>{team?.name ?? 'Sem time'}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text3)' }}>{tp.length} jogadores</span>
                </div>
                {/* Players */}
                {tp.map((p, i) => (
                  <div key={p.player_id} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px',
                    borderBottom: i < tp.length - 1 ? '1px solid var(--border)' : 'none',
                    background: inLineup(p.player_id) ? 'rgba(0,240,117,.03)' : 'transparent',
                    borderLeft: inLineup(p.player_id) ? '2px solid var(--green)' : '2px solid transparent',
                  }}>
                    <PlayerAvatar hltv_id={p.hltv_id} nickname={p.nickname} size={40} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span className="font-condensed" style={{ fontWeight: 800, fontSize: 15, color: 'var(--white)', letterSpacing: '.03em' }}>{p.nickname}</span>
                        <RoleBadge role={p.role} />
                      </div>
                    </div>
                    <span className="font-tech" style={{ fontSize: 13, fontWeight: 700, color: 'var(--white)' }}>{formatLC(p.price)} <span style={{ fontSize: 10, color: 'var(--text3)' }}>LC</span></span>
                    <AddBtn player={p} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── RIGHT: Lineup Panel ── */}
      <div style={{ position: 'sticky', top: 74 }}>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text2)' }}>Minha Lineup</span>
            <span style={{ fontSize: 10, color: 'var(--text3)' }}>{roundName} · {lineup.length}/{MAX_PLAYERS}</span>
          </div>

          <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 5 }}>
            {Array.from({ length: MAX_PLAYERS }).map((_, i) => {
              const slot = lineup[i]
              return (
                <div key={i} style={{
                  background: slot ? 'rgba(0,240,117,.03)' : 'var(--bg)',
                  border: slot ? '1px solid rgba(0,240,117,.2)' : '1px dashed var(--border2)',
                  borderRadius: 8, padding: slot ? '6px 8px' : '10px 8px',
                  display: 'flex', alignItems: 'center', gap: 7, minHeight: 44,
                }}>
                  {slot ? (
                    <>
                      <PlayerAvatar hltv_id={slot.player.hltv_id} nickname={slot.player.nickname} size={32} />
                      <button onClick={() => setCap(slot.player.player_id)} style={{
                        width: 18, height: 18, borderRadius: 3, flexShrink: 0,
                        background: slot.is_captain ? 'var(--gold)' : 'var(--bg3)',
                        border: slot.is_captain ? 'none' : '1px solid var(--border2)',
                        color: slot.is_captain ? '#000' : 'var(--text3)',
                        fontSize: 8, fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit',
                      }} title="Capitão">C</button>
                      <span className="font-condensed" style={{ flex: 1, fontWeight: 800, fontSize: 13, color: 'var(--white)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {slot.player.nickname}
                      </span>
                      <button onClick={() => remove(slot.player.player_id)} style={{ background: 'transparent', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 11, padding: 0, flexShrink: 0, lineHeight: 1 }}>✕</button>
                    </>
                  ) : (
                    <span style={{ fontSize: 11, color: 'var(--text3)', fontStyle: 'italic', width: '100%', textAlign: 'center' }}>Slot {i + 1}</span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Budget */}
          <div style={{ padding: '0 12px 10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 5 }}>
              <span style={{ color: 'var(--text3)', fontWeight: 600, letterSpacing: '.08em' }}>SALDO</span>
              <span className="font-tech" style={{ fontWeight: 700, color: remaining < 0 ? 'var(--red)' : 'var(--green)' }}>{formatLC(remaining)} LC</span>
            </div>
            <div style={{ background: 'var(--border)', borderRadius: 4, height: 5, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 4, transition: 'width .35s', width: `${budgetPct}%`,
                background: remaining < 20000 ? 'linear-gradient(90deg,var(--red),#c03050)' : remaining < 50000 ? 'linear-gradient(90deg,var(--yellow),#e08800)' : 'linear-gradient(90deg,var(--green),var(--cyan))',
              }} />
            </div>
          </div>

          {saveError && <div style={{ margin: '0 12px 8px', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 7, padding: '7px 10px', fontSize: 11, color: 'var(--red)' }}>{saveError}</div>}
          {saved && <div style={{ margin: '0 12px 8px', background: 'rgba(0,240,117,.08)', border: '1px solid rgba(0,240,117,.25)', borderRadius: 7, padding: '7px 10px', fontSize: 11, color: 'var(--green)' }}>✓ Lineup salva!</div>}

          <div style={{ padding: '0 12px 12px' }}>
            <button onClick={() => startTransition(save)} disabled={isPending || lineup.length === 0} className="btn-green" style={{
              width: '100%', borderRadius: 8, padding: 10, fontSize: 12, fontWeight: 900,
              fontFamily: 'inherit', border: 'none', letterSpacing: '.06em', textTransform: 'uppercase',
              cursor: lineup.length ? 'pointer' : 'not-allowed', opacity: lineup.length === 0 ? 0.4 : 1,
            }}>
              {isPending ? 'Salvando...' : '✓ Confirmar Lineup'}
            </button>
            {lineup.length > 0 && !lineup.some(s => s.is_captain) && (
              <p style={{ textAlign: 'center', fontSize: 10, color: 'var(--text3)', marginTop: 6 }}>Toque em "C" para definir capitão</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
