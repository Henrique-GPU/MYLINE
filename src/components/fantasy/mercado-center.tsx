'use client'

import Link from 'next/link'
import { useState, useEffect, useTransition } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

// ── Tipos ──
type Team = { id: string; name: string; hltv_id: number | null }
type PlayerWithPrice = {
  player_id: string; price: number; price_change: number
  nickname: string; role: string | null; hltv_id: number | null; team: Team | null
  // Fantasy stats (combinação real + mock para MVP)
  avg_pts: number; ownership: number; projection: number; trend: 'up' | 'down' | 'neutral'
  form: number[]
}
type Slot = { player: PlayerWithPrice; is_captain: boolean }

// ── Confrontos mock (substituir por real quando matches estiver populado) ──
const CONFRONTOS = [
  { id: '1', t1: 'Spirit',   t2: 'FURIA',     format: 'BO3', time: '14:00', date: '21 Jul', status: 'upcoming', odds1: 65 },
  { id: '2', t1: 'Vitality', t2: 'MOUZ',      format: 'BO3', time: '16:30', date: '21 Jul', status: 'upcoming', odds1: 58 },
  { id: '3', t1: 'FaZe',     t2: 'G2',        format: 'BO3', time: '19:00', date: '21 Jul', status: 'upcoming', odds1: 52 },
  { id: '4', t1: 'Astralis', t2: 'Natus Vincere', format: 'BO3', time: '21:30', date: '21 Jul', status: 'upcoming', odds1: 47 },
  { id: '5', t1: 'HEROIC',   t2: 'Team Liquid',   format: 'BO3', time: '14:00', date: '22 Jul', status: 'upcoming', odds1: 54 },
  { id: '6', t1: 'MIBR',     t2: 'paiN',          format: 'BO3', time: '16:30', date: '22 Jul', status: 'upcoming', odds1: 49 },
]

// ── Community mock ──
const COMMUNITY = {
  mostPicked:   { nick: 'donk',    pct: 52 },
  trending:     { nick: 'ZywOo',   pct: 48 },
  differential: { nick: 'w0nderful', pct: 19 },
  contrarian:   { nick: 'sdy',       pct: 6 },
}

const ROLE_COLOR: Record<string, string> = { awper: '#f59e0b', igl: '#8b5cf6', entry: '#ef4444', support: '#1e7fff', rifler: '#5a6e90' }
const ROLE_LABEL: Record<string, string> = { awper: 'AWP', igl: 'IGL', entry: 'ENT', support: 'SUP', rifler: 'RIF' }
const BUDGET = 100_000
const MAX = 5

function pad(n: number) { return String(n).padStart(2, '0') }
function formatLC(v: number) { return v.toLocaleString('pt-BR') }

function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values); const min = Math.min(...values)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 16 }}>
      {values.map((v, i) => {
        const pct = max === min ? 0.5 : (v - min) / (max - min)
        const h = Math.max(3, Math.round(pct * 14))
        const c = pct > .6 ? '#00f075' : pct > .3 ? '#f59e0b' : '#ef4444'
        return <div key={i} style={{ width: 5, height: h, borderRadius: 2, background: c, opacity: i === values.length - 1 ? 1 : .55 }} />
      })}
    </div>
  )
}

function MatchCard({ m, highlight }: { m: typeof CONFRONTOS[0]; highlight?: boolean }) {
  return (
    <div style={{
      flexShrink: 0, width: 200, background: highlight ? 'rgba(0,240,117,.06)' : 'var(--bg3)',
      border: `1px solid ${highlight ? 'rgba(0,240,117,.2)' : 'var(--border)'}`,
      borderRadius: 10, padding: '10px 12px', cursor: 'pointer',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.08em' }}>{m.date} · {m.time}</span>
        <span style={{ fontSize: 8, fontWeight: 700, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 5px', color: 'var(--text3)' }}>{m.format}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <div style={{ flex: 1 }}>
          <div className="font-condensed" style={{ fontWeight: 900, fontSize: 13, color: m.odds1 >= 50 ? 'var(--white)' : 'var(--text2)', letterSpacing: '.03em' }}>{m.t1}</div>
          <div style={{ fontSize: 10, color: m.odds1 >= 50 ? 'var(--green)' : 'var(--text3)' }}>{m.odds1}%</div>
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)' }}>vs</div>
        <div style={{ flex: 1, textAlign: 'right' }}>
          <div className="font-condensed" style={{ fontWeight: 900, fontSize: 13, color: m.odds1 < 50 ? 'var(--white)' : 'var(--text2)', letterSpacing: '.03em' }}>{m.t2}</div>
          <div style={{ fontSize: 10, color: m.odds1 < 50 ? 'var(--green)' : 'var(--text3)' }}>{100 - m.odds1}%</div>
        </div>
      </div>
      {/* Win probability bar */}
      <div style={{ background: 'var(--border)', borderRadius: 3, height: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 3, background: 'linear-gradient(90deg,var(--green),var(--cyan))', width: `${m.odds1}%`, transition: 'width .5s' }} />
      </div>
    </div>
  )
}

export function MercadoCenter({
  championshipId, roundId, roundName, initialLc,
}: {
  championshipId: string; roundId: string; roundName: string; initialLc: number
}) {
  const [players, setPlayers] = useState<PlayerWithPrice[]>([])
  const [lineup, setLineup] = useState<Slot[]>([])
  const [tab, setTab] = useState<'players' | 'teams'>('players')
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterTeam, setFilterTeam] = useState('all')
  const [sortBy, setSortBy] = useState<'price' | 'avg' | 'ownership' | 'trend'>('price')
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerWithPrice | null>(null)
  const [now, setNow] = useState(Date.now())
  const [marketTarget] = useState(() => Date.now() + 2 * 60 * 60 * 1000 + 13 * 60 * 1000 + 48 * 1000)

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const diff = Math.max(0, marketTarget - now)
  const mH = Math.floor(diff / 3600000)
  const mM = Math.floor((diff % 3600000) / 60000)
  const mS = Math.floor((diff % 60000) / 1000)
  const urgent = mH < 1

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

      // Enriquecer com fantasy stats baseados no preço (MVP — substituir por dados reais)
      const merged: PlayerWithPrice[] = prices.map(pp => {
        const p = pById[pp.player_id]
        const priceNorm = pp.price / 45000 // normaliza pelo jogador mais caro
        const baseAvg = Math.round(60 + priceNorm * 30 + Math.random() * 8)
        const ownership = Math.round(priceNorm * 45 + Math.random() * 15)
        const projection = Math.round(baseAvg + Math.random() * 15 - 5)
        const trend: 'up' | 'down' | 'neutral' = pp.price_change > 0 ? 'up' : pp.price_change < 0 ? 'down' : 'neutral'
        const form = Array.from({ length: 5 }, () => Math.round(baseAvg - 10 + Math.random() * 25))
        return {
          player_id: pp.player_id, price: pp.price, price_change: pp.price_change,
          nickname: p?.nickname ?? '???', role: p?.role ?? null, hltv_id: p?.hltv_id ?? null,
          team: p?.team_id ? (tById[p.team_id] ?? null) : null,
          avg_pts: baseAvg, ownership, projection, trend, form,
        }
      })
      setPlayers(merged)

      // Existing lineup
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: ex } = await supabase.from('lineups').select('id').eq('user_id', user.id).eq('round_id', roundId).single()
        if (ex) {
          const { data: slots } = await supabase.from('lineup_players').select('player_id, is_captain').eq('lineup_id', ex.id)
          setLineup((slots ?? []).map(s => { const pl = merged.find(p => p.player_id === s.player_id); return pl ? { player: pl, is_captain: s.is_captain } : null }).filter(Boolean) as Slot[])
        }
      }
      setLoading(false)
    }
    load()
  }, [roundId])

  const spent = lineup.reduce((s, sl) => s + sl.player.price, 0)
  const remaining = initialLc - spent
  const projection = lineup.reduce((s, sl) => s + (sl.is_captain ? sl.player.projection * 2 : sl.player.projection), 0)
  const avgChange = lineup.length > 0 ? lineup.reduce((s, sl) => s + sl.player.price_change, 0) / lineup.length : 0

  function add(p: PlayerWithPrice) {
    if (lineup.length >= MAX || lineup.some(s => s.player.player_id === p.player_id) || remaining < p.price) return
    setLineup(prev => [...prev, { player: p, is_captain: false }])
    setSelectedPlayer(null)
  }
  function remove(id: string) { setLineup(prev => prev.filter(s => s.player.player_id !== id)) }
  function setCap(id: string) { setLineup(prev => prev.map(s => ({ ...s, is_captain: s.player.player_id === id }))) }
  const inLineup = (id: string) => lineup.some(s => s.player.player_id === id)

  async function save() {
    setSaveError(null); setSaved(false)
    const supabase = getSupabaseBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaveError('Faça login.'); return }
    if (!lineup.length) { setSaveError('Adicione jogadores.'); return }
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

  // Filter + sort
  const allTeams = [...new Set(players.map(p => p.team?.name).filter(Boolean))] as string[]
  const filtered = players
    .filter(p => {
      const q = search.toLowerCase()
      return (p.nickname.toLowerCase().includes(q) || (p.team?.name ?? '').toLowerCase().includes(q))
        && (filterRole === 'all' || p.role === filterRole)
        && (filterTeam === 'all' || p.team?.name === filterTeam)
    })
    .sort((a, b) => {
      if (sortBy === 'avg') return b.avg_pts - a.avg_pts
      if (sortBy === 'ownership') return b.ownership - a.ownership
      if (sortBy === 'trend') return b.price_change - a.price_change
      return b.price - a.price
    })

  // Group by team for teams tab
  const byTeam = players.reduce((acc, p) => {
    const key = p.team?.name ?? '—'
    if (!acc[key]) acc[key] = []
    acc[key].push(p)
    return acc
  }, {} as Record<string, PlayerWithPrice[]>)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 16, alignItems: 'start' }}>

      {/* ══ LEFT ══ */}
      <div>

        {/* ── CONFRONTOS DA RODADA ── */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span className="font-condensed" style={{ fontWeight: 700, fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text3)' }}>
              🏆 CONFRONTOS DA RODADA — {roundName}
            </span>
            <span style={{ fontSize: 10, color: 'var(--text3)' }}>{CONFRONTOS.length} partidas · {CONFRONTOS.filter(m => m.format === 'BO3').length}× BO3</span>
          </div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {CONFRONTOS.map(m => (
              <MatchCard key={m.id} m={m} highlight={lineup.some(s => s.player.team?.name === m.t1 || s.player.team?.name === m.t2)} />
            ))}
          </div>
          <p style={{ fontSize: 10, color: 'var(--text3)', marginTop: 6 }}>
            💡 <strong style={{ color: 'var(--text2)' }}>Dica:</strong> Times que avançam mais rodadas jogam mais mapas e pontuam mais no Fantasy.
          </p>
        </div>

        {/* ── TABS ── */}
        <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border)', marginBottom: 12 }}>
          {([['players', '👤 Jogadores'], ['teams', '🛡️ Por Time']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              padding: '9px 14px', fontSize: 13, fontWeight: 600, marginBottom: -1,
              color: tab === key ? 'var(--green)' : 'var(--text3)',
              borderBottom: tab === key ? '2px solid var(--green)' : '2px solid transparent',
            }}>{label}</button>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, paddingBottom: 8 }}>
            <span style={{ fontSize: 10, color: 'var(--text3)' }}>{players.length} jogadores</span>
          </div>
        </div>

        {/* ── FILTERS ── */}
        {tab === 'players' && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            <input type="text" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 120, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px', color: 'var(--text)', fontSize: 12, fontFamily: 'inherit', outline: 'none' }} />
            {/* Role filter */}
            {['all', 'awper', 'igl', 'entry', 'support', 'rifler'].map(r => (
              <button key={r} onClick={() => setFilterRole(r)} style={{ padding: '5px 10px', borderRadius: 20, cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, fontWeight: filterRole === r ? 700 : 500, background: filterRole === r ? 'rgba(0,240,117,.08)' : 'var(--bg2)', color: filterRole === r ? 'var(--green)' : 'var(--text2)', border: filterRole === r ? '1px solid rgba(0,240,117,.25)' : '1px solid var(--border)', textTransform: 'capitalize' }}>
                {r === 'all' ? 'Todos' : r}
              </button>
            ))}
            {/* Sort */}
            <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} style={{ padding: '5px 8px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text2)', fontSize: 11, fontFamily: 'inherit', outline: 'none', cursor: 'pointer' }}>
              <option value="price">Preço ↓</option>
              <option value="avg">Média ↓</option>
              <option value="ownership">Ownership ↓</option>
              <option value="trend">Tendência</option>
            </select>
          </div>
        )}

        {/* ── PLAYER LIST ── */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>Carregando mercado...</div>
        ) : tab === 'players' ? (
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 55px 55px 55px 36px', gap: 6, padding: '7px 14px', borderBottom: '1px solid var(--border)' }}>
              {['Jogador', 'Preço', 'Média', 'Proj.', 'Own%', ''].map((h, i) => (
                <span key={i} style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text3)', textAlign: i >= 1 ? 'right' : 'left' }}>{h}</span>
              ))}
            </div>
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, color: 'var(--text3)', fontSize: 12 }}>Nenhum resultado.</div>
            ) : filtered.map((p, i) => {
              const color = ROLE_COLOR[p.role ?? ''] ?? '#5a6e90'
              const added = inLineup(p.player_id)
              const canAdd = !added && lineup.length < MAX && remaining >= p.price
              const isSelected = selectedPlayer?.player_id === p.player_id
              return (
                <div key={p.player_id}
                  onClick={() => setSelectedPlayer(isSelected ? null : p)}
                  style={{
                    display: 'grid', gridTemplateColumns: '1fr 60px 55px 55px 55px 36px', gap: 6,
                    padding: '8px 14px', alignItems: 'center', cursor: 'pointer',
                    borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                    background: isSelected ? `${color}08` : added ? 'rgba(0,240,117,.03)' : 'transparent',
                    borderLeft: added ? '2px solid var(--green)' : isSelected ? `2px solid ${color}` : '2px solid transparent',
                    transition: 'background .1s',
                  }}>
                  {/* Player */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 5, flexShrink: 0, background: `${color}18`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, color, fontFamily: 'var(--font-condensed)' }}>
                      {p.nickname.slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span className="font-condensed" style={{ fontWeight: 800, fontSize: 14, color: added ? 'var(--green)' : 'var(--white)', letterSpacing: '.03em' }}>{p.nickname}</span>
                        <span style={{ background: `${color}15`, color, border: `1px solid ${color}30`, borderRadius: 3, padding: '0 4px', fontSize: 8, fontWeight: 700, letterSpacing: '.06em' }}>{ROLE_LABEL[p.role ?? ''] ?? 'RIF'}</span>
                        {p.trend === 'up' && <span style={{ fontSize: 9, color: 'var(--green)' }}>▲</span>}
                        {p.trend === 'down' && <span style={{ fontSize: 9, color: 'var(--red)' }}>▼</span>}
                      </div>
                      <div style={{ fontSize: 9, color: 'var(--text3)' }}>{p.team?.name ?? '—'}</div>
                    </div>
                  </div>
                  {/* Price */}
                  <span className="font-tech" style={{ fontSize: 11, fontWeight: 700, color: 'var(--white)', textAlign: 'right' }}>{formatLC(p.price)}</span>
                  {/* Avg */}
                  <span className="font-tech" style={{ fontSize: 11, fontWeight: 700, color: p.avg_pts >= 80 ? 'var(--green)' : p.avg_pts >= 65 ? 'var(--yellow)' : 'var(--text2)', textAlign: 'right' }}>{p.avg_pts}</span>
                  {/* Projection */}
                  <span className="font-tech" style={{ fontSize: 11, fontWeight: 700, color: 'var(--cyan)', textAlign: 'right' }}>~{p.projection}</span>
                  {/* Ownership */}
                  <span className="font-tech" style={{ fontSize: 11, color: p.ownership >= 40 ? 'var(--orange)' : 'var(--text3)', textAlign: 'right' }}>{p.ownership}%</span>
                  {/* Button */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={e => { e.stopPropagation(); added ? remove(p.player_id) : add(p) }} disabled={!added && !canAdd} style={{
                      width: 26, height: 26, borderRadius: 5, cursor: added || canAdd ? 'pointer' : 'not-allowed',
                      background: added ? 'rgba(239,68,68,.08)' : canAdd ? 'rgba(0,240,117,.08)' : 'transparent',
                      border: added ? '1px solid rgba(239,68,68,.25)' : canAdd ? '1px solid rgba(0,240,117,.25)' : '1px solid var(--border)',
                      color: added ? 'var(--red)' : canAdd ? 'var(--green)' : 'var(--text3)',
                      fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit',
                    }}>{added ? '−' : '+'}</button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* TEAMS TAB */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Object.entries(byTeam).sort((a, b) => Math.max(...b[1].map(p => p.price)) - Math.max(...a[1].map(p => p.price))).map(([teamName, tPlayers]) => (
              <div key={teamName} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,.01)' }}>
                  <span className="font-condensed" style={{ fontWeight: 900, fontSize: 15, color: 'var(--white)', letterSpacing: '.04em', flex: 1 }}>{teamName}</span>
                  {/* Próximo confronto */}
                  {(() => {
                    const match = CONFRONTOS.find(m => m.t1 === teamName || m.t2 === teamName)
                    if (!match) return null
                    const opp = match.t1 === teamName ? match.t2 : match.t1
                    const winPct = match.t1 === teamName ? match.odds1 : 100 - match.odds1
                    return (
                      <div style={{ fontSize: 10, color: 'var(--text3)', display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span>vs {opp}</span>
                        <span style={{ color: winPct >= 50 ? 'var(--green)' : 'var(--yellow)', fontWeight: 700 }}>{winPct}%</span>
                        <span style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 5px', fontSize: 9 }}>{match.format}</span>
                      </div>
                    )
                  })()}
                </div>
                {tPlayers.map((p, i) => {
                  const color = ROLE_COLOR[p.role ?? ''] ?? '#5a6e90'
                  const added = inLineup(p.player_id)
                  const canAdd = !added && lineup.length < MAX && remaining >= p.price
                  return (
                    <div key={p.player_id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: i < tPlayers.length - 1 ? '1px solid var(--border)' : 'none', background: added ? 'rgba(0,240,117,.03)' : 'transparent', borderLeft: added ? '2px solid var(--green)' : '2px solid transparent' }}>
                      <div style={{ width: 4, height: 24, borderRadius: 2, background: color, flexShrink: 0, opacity: .7 }} />
                      <span className="font-condensed" style={{ flex: 1, fontWeight: 800, fontSize: 14, color: 'var(--white)', letterSpacing: '.03em' }}>{p.nickname}</span>
                      <Sparkline values={p.form} />
                      <span style={{ background: `${color}15`, color, borderRadius: 4, padding: '1px 5px', fontSize: 8, fontWeight: 700 }}>{ROLE_LABEL[p.role ?? ''] ?? 'RIF'}</span>
                      <span className="font-tech" style={{ fontSize: 12, color: 'var(--white)', fontWeight: 700 }}>{formatLC(p.price)}</span>
                      <span className="font-tech" style={{ fontSize: 11, color: 'var(--cyan)' }}>~{p.projection}</span>
                      <button onClick={() => added ? remove(p.player_id) : add(p)} disabled={!added && !canAdd} style={{ width: 26, height: 26, borderRadius: 5, cursor: added || canAdd ? 'pointer' : 'not-allowed', background: added ? 'rgba(239,68,68,.08)' : canAdd ? 'rgba(0,240,117,.08)' : 'transparent', border: added ? '1px solid rgba(239,68,68,.25)' : canAdd ? '1px solid rgba(0,240,117,.25)' : '1px solid var(--border)', color: added ? 'var(--red)' : canAdd ? 'var(--green)' : 'var(--text3)', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>{added ? '−' : '+'}</button>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )}

        {/* Player detail drawer */}
        {selectedPlayer && (() => {
          const p = selectedPlayer
          const color = ROLE_COLOR[p.role ?? ''] ?? '#5a6e90'
          const match = CONFRONTOS.find(m => m.t1 === p.team?.name || m.t2 === p.team?.name)
          const opp = match ? (match.t1 === p.team?.name ? match.t2 : match.t1) : null
          const winPct = match ? (match.t1 === p.team?.name ? match.odds1 : 100 - match.odds1) : null
          return (
            <div style={{ marginTop: 10, background: `${color}08`, border: `1px solid ${color}25`, borderRadius: 12, padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color, fontFamily: 'var(--font-condensed)' }}>
                    {p.nickname.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-condensed" style={{ fontWeight: 900, fontSize: 18, color: 'var(--white)', letterSpacing: '.03em' }}>{p.nickname}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{p.team?.name} · {ROLE_LABEL[p.role ?? ''] ?? 'RIF'}</div>
                  </div>
                </div>
                <button onClick={() => setSelectedPlayer(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 16 }}>✕</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 12 }}>
                {[
                  { label: 'Preço',      value: `${formatLC(p.price)} LC`, c: 'var(--white)' },
                  { label: 'Média',      value: `${p.avg_pts} pts`,          c: p.avg_pts >= 80 ? 'var(--green)' : 'var(--yellow)' },
                  { label: 'Projeção',   value: `~${p.projection} pts`,      c: 'var(--cyan)' },
                  { label: 'Ownership',  value: `${p.ownership}%`,           c: p.ownership >= 40 ? 'var(--orange)' : 'var(--text2)' },
                ].map(s => (
                  <div key={s.label} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px', textAlign: 'center' }}>
                    <div className="font-tech" style={{ fontSize: 14, fontWeight: 700, color: s.c }}>{s.value}</div>
                    <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.07em', marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              {/* Confronto */}
              {match && opp && (
                <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', marginBottom: 12 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6 }}>Próximo Confronto</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span className="font-condensed" style={{ fontWeight: 800, fontSize: 14, color: 'var(--white)' }}>{p.team?.name} vs {opp}</span>
                    <span style={{ fontSize: 10, color: 'var(--text3)', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 7px' }}>{match.format} · {match.date}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 9, color: 'var(--text3)' }}>Chance de vitória</div>
                      <div className="font-tech" style={{ fontSize: 15, fontWeight: 700, color: winPct! >= 50 ? 'var(--green)' : 'var(--yellow)' }}>{winPct}%</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 9, color: 'var(--text3)' }}>Séries estimadas</div>
                      <div className="font-tech" style={{ fontSize: 15, fontWeight: 700, color: 'var(--white)' }}>2–3</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 9, color: 'var(--text3)' }}>Potencial Fantasy</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: winPct! >= 60 ? 'var(--green)' : winPct! >= 45 ? 'var(--yellow)' : 'var(--red)' }}>
                        {winPct! >= 60 ? '🔥 Muito Alto' : winPct! >= 45 ? '⭐ Alto' : '⚠️ Médio'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <button onClick={() => inLineup(p.player_id) ? remove(p.player_id) : add(p)} disabled={!inLineup(p.player_id) && (lineup.length >= MAX || remaining < p.price)} style={{
                width: '100%', padding: '10px',
                background: inLineup(p.player_id) ? 'rgba(239,68,68,.1)' : lineup.length < MAX && remaining >= p.price ? `linear-gradient(90deg,${color},${color}cc)` : 'var(--bg3)',
                color: inLineup(p.player_id) ? 'var(--red)' : '#000',
                fontFamily: 'inherit', fontWeight: 900, fontSize: 13, letterSpacing: '.06em', textTransform: 'uppercase',
                border: inLineup(p.player_id) ? '1px solid rgba(239,68,68,.25)' : 'none',
                borderRadius: 9, cursor: inLineup(p.player_id) || (lineup.length < MAX && remaining >= p.price) ? 'pointer' : 'not-allowed',
              }}>
                {inLineup(p.player_id) ? '− Remover da Lineup' : lineup.length >= MAX ? '⚠️ Lineup cheia' : remaining < p.price ? '⚠️ Saldo insuficiente' : `⚡ Escalar ${p.nickname}`}
              </button>
            </div>
          )
        })()}
      </div>

      {/* ══ RIGHT: LINEUP PANEL ══ */}
      <div style={{ position: 'sticky', top: 74 }}>

        {/* Countdown */}
        <div style={{
          background: urgent ? 'rgba(239,68,68,.08)' : 'var(--bg2)',
          border: `1px solid ${urgent ? 'rgba(239,68,68,.25)' : 'var(--border)'}`,
          borderRadius: 12, padding: '12px 14px', marginBottom: 10, textAlign: 'center',
        }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: urgent ? 'var(--red)' : 'var(--text3)', marginBottom: 4 }}>
            ⏳ MERCADO FECHA EM
          </div>
          <div className="font-tech" style={{ fontSize: 28, fontWeight: 700, color: urgent ? 'var(--red)' : 'var(--white)', letterSpacing: '.04em', lineHeight: 1, animation: urgent ? 'blink 1.5s ease-in-out infinite' : 'none' }}>
            {pad(mH)}:{pad(mM)}:{pad(mS)}
          </div>
        </div>

        {/* Lineup */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ height: 2, background: lineup.length === MAX ? 'linear-gradient(90deg,var(--green),var(--cyan))' : 'var(--border2)' }} />
          <div style={{ padding: '12px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text2)' }}>⭐ Minha Lineup</span>
              <span style={{ fontSize: 10, color: 'var(--text3)' }}>{roundName}</span>
            </div>

            {/* Slots */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 10 }}>
              {Array.from({ length: MAX }).map((_, i) => {
                const slot = lineup[i]
                const color = slot ? (ROLE_COLOR[slot.player.role ?? ''] ?? '#5a6e90') : undefined
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 9px', borderRadius: 8, border: slot ? `1px solid ${color}25` : '1px dashed var(--border2)', background: slot ? `${color}06` : 'var(--bg)', minHeight: 40 }}>
                    {slot ? (
                      <>
                        <button onClick={() => setCap(slot.player.player_id)} style={{ width: 18, height: 18, borderRadius: 3, flexShrink: 0, background: slot.is_captain ? 'var(--gold)' : 'var(--bg3)', border: slot.is_captain ? 'none' : '1px solid var(--border2)', color: slot.is_captain ? '#000' : 'var(--text3)', fontSize: 8, fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit' }} title="Capitão">C</button>
                        <span className="font-condensed" style={{ flex: 1, fontWeight: 800, fontSize: 13, color: slot.is_captain ? 'var(--gold)' : 'var(--white)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{slot.player.nickname}</span>
                        <span className="font-tech" style={{ fontSize: 10, color: 'var(--text3)', flexShrink: 0 }}>{formatLC(slot.player.price)}</span>
                        <button onClick={() => remove(slot.player.player_id)} style={{ background: 'transparent', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 11, padding: 0, flexShrink: 0 }}>✕</button>
                      </>
                    ) : (
                      <span style={{ fontSize: 10, color: 'var(--text3)', fontStyle: 'italic', width: '100%', textAlign: 'center' }}>Slot {i + 1}</span>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 10 }}>
              {/* Budget bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, marginBottom: 3 }}>
                  <span style={{ color: 'var(--text3)', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase' }}>Saldo</span>
                  <span className="font-tech" style={{ fontWeight: 700, color: remaining < 0 ? 'var(--red)' : 'var(--green)' }}>{formatLC(remaining)} LC</span>
                </div>
                <div style={{ background: 'var(--border)', borderRadius: 3, height: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 3, transition: 'width .35s', width: `${Math.max(0, Math.min(100, (remaining / initialLc) * 100))}%`, background: remaining < 20000 ? 'var(--red)' : 'linear-gradient(90deg,var(--green),var(--cyan))' }} />
                </div>
              </div>

              {/* Projection & valorização */}
              {lineup.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 7, padding: '7px', textAlign: 'center' }}>
                    <div className="font-tech" style={{ fontSize: 16, fontWeight: 700, color: 'var(--cyan)' }}>~{projection}</div>
                    <div style={{ fontSize: 8, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.07em' }}>Projeção pts</div>
                  </div>
                  <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 7, padding: '7px', textAlign: 'center' }}>
                    <div className="font-tech" style={{ fontSize: 16, fontWeight: 700, color: avgChange >= 0 ? 'var(--green)' : 'var(--red)' }}>
                      {avgChange >= 0 ? '+' : ''}{(avgChange * 100).toFixed(1)}%
                    </div>
                    <div style={{ fontSize: 8, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.07em' }}>Valoriz. prevista</div>
                  </div>
                </div>
              )}
            </div>

            {/* Captain tip */}
            {lineup.length > 0 && !lineup.some(s => s.is_captain) && (
              <div style={{ background: 'rgba(255,200,50,.06)', border: '1px solid rgba(255,200,50,.15)', borderRadius: 7, padding: '7px 9px', marginBottom: 8, fontSize: 10, color: 'var(--yellow)', textAlign: 'center' }}>
                ⭐ Toque em "C" para definir capitão (2× pontos)
              </div>
            )}

            {saveError && <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 7, padding: '7px', marginBottom: 8, fontSize: 10, color: 'var(--red)' }}>{saveError}</div>}
            {saved && <div style={{ background: 'rgba(0,240,117,.08)', border: '1px solid rgba(0,240,117,.2)', borderRadius: 7, padding: '7px', marginBottom: 8, fontSize: 10, color: 'var(--green)', textAlign: 'center' }}>✓ Lineup salva!</div>}

            <button onClick={() => startTransition(save)} disabled={isPending || lineup.length === 0} className="btn-green" style={{ width: '100%', borderRadius: 9, padding: '11px', fontSize: 13, fontWeight: 900, fontFamily: 'inherit', border: 'none', letterSpacing: '.06em', textTransform: 'uppercase', cursor: lineup.length ? 'pointer' : 'not-allowed', opacity: lineup.length === 0 ? 0.4 : 1 }}>
              {isPending ? 'Salvando...' : lineup.length === MAX ? '✅ Confirmar Lineup' : `⚡ ${lineup.length}/${MAX} — Adicionar jogadores`}
            </button>
          </div>
        </div>

        {/* Community data */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px', marginTop: 10 }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 10 }}>👥 COMUNIDADE</div>
          {[
            { label: '🔥 Mais escalado',    nick: COMMUNITY.mostPicked.nick,   pct: COMMUNITY.mostPicked.pct,   color: 'var(--orange)' },
            { label: '📈 Em alta',          nick: COMMUNITY.trending.nick,     pct: COMMUNITY.trending.pct,    color: 'var(--green)' },
            { label: '💎 Diferencial',      nick: COMMUNITY.differential.nick, pct: COMMUNITY.differential.pct, color: 'var(--cyan)' },
            { label: '🎯 Contrarian',       nick: COMMUNITY.contrarian.nick,   pct: COMMUNITY.contrarian.pct,  color: 'var(--purple)' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 10, color: 'var(--text3)' }}>{item.label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span className="font-condensed" style={{ fontWeight: 800, fontSize: 12, color: 'var(--white)' }}>{item.nick}</span>
                <span className="font-tech" style={{ fontSize: 10, color: item.color, fontWeight: 700 }}>{item.pct}%</span>
              </div>
            </div>
          ))}
        </div>

        {/* Ranking CTA */}
        <Link href={`/fantasy/${championshipId}/ranking`} style={{ display: 'flex', justifyContent: 'center', marginTop: 8, padding: '8px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12, color: 'var(--text3)', textDecoration: 'none', fontWeight: 600 }}>
          🏆 Ver Ranking
        </Link>
      </div>
    </div>
  )
}
