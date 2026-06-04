'use client'

import { useState, useEffect, useTransition } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

const BUDGET = 100_000
const MAX_PLAYERS = 5

type Team = { id: string; name: string }

type PlayerWithPrice = {
  player_id: string
  price: number
  price_change: number
  nickname: string
  role: string | null
  team: Team | null
}

type LineupSlot = { player: PlayerWithPrice; is_captain: boolean }

function formatLC(v: number) {
  return v.toLocaleString('pt-BR')
}

const ROLE_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  awper:   { bg: 'rgba(245,158,11,.1)',  color: 'var(--yellow)', label: 'AWP' },
  igl:     { bg: 'rgba(139,92,246,.1)',  color: 'var(--purple)', label: 'IGL' },
  entry:   { bg: 'rgba(239,68,68,.1)',   color: 'var(--red)',    label: 'ENT' },
  support: { bg: 'rgba(30,127,255,.1)',  color: 'var(--blue)',   label: 'SUP' },
  rifler:  { bg: 'rgba(255,255,255,.06)', color: 'var(--text2)', label: 'RIF' },
}

function RoleBadge({ role }: { role: string | null }) {
  if (!role) return null
  const r = ROLE_COLORS[role] ?? ROLE_COLORS.rifler
  return (
    <span style={{
      background: r.bg, color: r.color, border: `1px solid ${r.color}40`,
      borderRadius: 4, padding: '1px 6px', fontSize: 9, fontWeight: 700, letterSpacing: '.06em',
    }}>
      {r.label}
    </span>
  )
}

function PriceChange({ pct }: { pct: number }) {
  if (pct === 0) return <span style={{ color: 'var(--text3)', fontSize: 10 }}>—</span>
  const pos = pct > 0
  return (
    <span style={{ color: pos ? 'var(--green)' : 'var(--red)', fontSize: 10, fontWeight: 700 }}>
      {pos ? '▲' : '▼'} {Math.abs(pct * 100).toFixed(1)}%
    </span>
  )
}

export function LineupBuilder({ championshipId, roundId, roundName }: {
  championshipId: string
  roundId: string
  roundName: string
}) {
  const [players, setPlayers] = useState<PlayerWithPrice[]>([])
  const [lineup, setLineup] = useState<LineupSlot[]>([])
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const spent = lineup.reduce((s, slot) => s + slot.player.price, 0)
  const remaining = BUDGET - spent
  const budgetPct = Math.max(0, Math.min(100, (remaining / BUDGET) * 100))

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    async function load() {
      setLoading(true)
      const { data: prices } = await supabase
        .from('player_prices')
        .select('player_id, price, price_change')
        .eq('round_id', roundId)
        .order('price', { ascending: false })

      if (!prices?.length) { setLoading(false); return }

      const ids = prices.map(p => p.player_id)
      const { data: pRows } = await supabase.from('players').select('id, nickname, role, team_id').in('id', ids)
      const teamIds = [...new Set((pRows ?? []).map(p => p.team_id).filter(Boolean))]
      const { data: tRows } = teamIds.length
        ? await supabase.from('teams').select('id, name').in('id', teamIds as string[])
        : { data: [] }

      const tById = Object.fromEntries((tRows ?? []).map(t => [t.id, t]))
      const pById = Object.fromEntries((pRows ?? []).map(p => [p.id, p]))

      const merged: PlayerWithPrice[] = prices.map(pp => {
        const p = pById[pp.player_id]
        return {
          player_id: pp.player_id,
          price: pp.price,
          price_change: pp.price_change,
          nickname: p?.nickname ?? '???',
          role: p?.role ?? null,
          team: p?.team_id ? (tById[p.team_id] ?? null) : null,
        }
      })
      setPlayers(merged)

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: ex } = await supabase.from('lineups').select('id').eq('user_id', user.id).eq('round_id', roundId).single()
        if (ex) {
          const { data: slots } = await supabase.from('lineup_players').select('player_id, is_captain').eq('lineup_id', ex.id)
          setLineup((slots ?? []).map(s => {
            const pl = merged.find(p => p.player_id === s.player_id)
            return pl ? { player: pl, is_captain: s.is_captain } : null
          }).filter(Boolean) as LineupSlot[])
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

  async function save() {
    setSaveError(null); setSaved(false)
    const supabase = getSupabaseBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaveError('Faça login para salvar.'); return }
    if (!lineup.length) { setSaveError('Adicione pelo menos 1 jogador.'); return }

    let lineupId: string
    const { data: ex } = await supabase.from('lineups').select('id').eq('user_id', user.id).eq('round_id', roundId).single()
    if (ex) {
      lineupId = ex.id
      await supabase.from('lineup_players').delete().eq('lineup_id', lineupId)
    } else {
      const { data: cr, error } = await supabase.from('lineups').insert({ user_id: user.id, championship_id: championshipId, round_id: roundId }).select('id').single()
      if (error || !cr) { setSaveError(error?.message ?? 'Erro.'); return }
      lineupId = cr.id
    }
    const { error } = await supabase.from('lineup_players').insert(lineup.map(s => ({ lineup_id: lineupId, player_id: s.player.player_id, is_captain: s.is_captain })))
    if (error) { setSaveError(error.message); return }
    setSaved(true)
  }

  const roles = ['all', 'awper', 'igl', 'entry', 'support', 'rifler']
  const filtered = players.filter(p => {
    const q = search.toLowerCase()
    return (p.nickname.toLowerCase().includes(q) || (p.team?.name ?? '').toLowerCase().includes(q))
      && (filterRole === 'all' || p.role === filterRole)
  })
  const inLineup = (id: string) => lineup.some(s => s.player.player_id === id)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 16, alignItems: 'start' }}>

      {/* ── LEFT: Player Market ── */}
      <div>
        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Buscar jogador ou time..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1, minWidth: 160,
              background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8,
              padding: '8px 14px', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'inherit',
            }}
          />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {roles.map(r => (
              <button key={r} onClick={() => setFilterRole(r)} style={{
                background: filterRole === r ? 'rgba(0,240,117,.08)' : 'var(--bg2)',
                border: filterRole === r ? '1px solid rgba(0,240,117,.35)' : '1px solid var(--border)',
                color: filterRole === r ? 'var(--green)' : 'var(--text2)',
                borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize',
              }}>
                {r === 'all' ? 'Todos' : r}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>Carregando jogadores...</div>
        ) : (
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
            {/* Table header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 80px 80px 50px 36px',
              padding: '8px 14px', borderBottom: '1px solid var(--border)',
            }}>
              {['Jogador', 'Time', 'Preço', 'Var.', ''].map((h, i) => (
                <span key={i} style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text3)', textAlign: i >= 2 ? 'right' : 'left' }}>
                  {h}
                </span>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '28px 20px', color: 'var(--text3)', fontSize: 13 }}>
                {players.length === 0 ? 'Nenhum jogador nesta rodada.' : 'Nenhum resultado.'}
              </div>
            ) : (
              filtered.map((p, i) => {
                const added = inLineup(p.player_id)
                const canAdd = !added && lineup.length < MAX_PLAYERS && remaining >= p.price
                return (
                  <div key={p.player_id} style={{
                    display: 'grid', gridTemplateColumns: '1fr 80px 80px 50px 36px',
                    padding: '9px 14px', alignItems: 'center',
                    borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                    background: added ? 'rgba(0,240,117,.03)' : 'transparent',
                    borderLeft: added ? '2px solid var(--green)' : '2px solid transparent',
                    transition: 'background .1s',
                  }}>
                    {/* Nickname + role */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="font-condensed" style={{ fontWeight: 800, fontSize: 15, color: 'var(--white)', letterSpacing: '.04em' }}>{p.nickname}</span>
                      <RoleBadge role={p.role} />
                    </div>
                    {/* Team */}
                    <span style={{ fontSize: 12, color: 'var(--text3)' }}>{p.team?.name ?? '—'}</span>
                    {/* Price */}
                    <span className="font-tech" style={{ fontSize: 13, fontWeight: 700, color: 'var(--white)', textAlign: 'right' }}>
                      {formatLC(p.price)}
                    </span>
                    {/* Price change */}
                    <div style={{ textAlign: 'right' }}>
                      <PriceChange pct={p.price_change} />
                    </div>
                    {/* Add/remove button */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button onClick={() => added ? remove(p.player_id) : add(p)} disabled={!added && !canAdd} style={{
                        width: 28, height: 28, borderRadius: 6, cursor: added || canAdd ? 'pointer' : 'not-allowed',
                        background: added ? 'rgba(239,68,68,.08)' : canAdd ? 'rgba(0,240,117,.08)' : 'transparent',
                        border: added ? '1px solid rgba(239,68,68,.3)' : canAdd ? '1px solid rgba(0,240,117,.3)' : '1px solid var(--border)',
                        color: added ? 'var(--red)' : canAdd ? 'var(--green)' : 'var(--text3)',
                        fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all .15s', fontFamily: 'inherit',
                      }}>
                        {added ? '−' : '+'}
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>

      {/* ── RIGHT: Lineup Panel ── */}
      <div style={{ position: 'sticky', top: 74 }}>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text2)' }}>Minha Lineup</span>
            <span style={{ fontSize: 10, color: 'var(--text3)' }}>{roundName}</span>
          </div>

          {/* Slots */}
          <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {Array.from({ length: MAX_PLAYERS }).map((_, i) => {
              const slot = lineup[i]
              return (
                <div key={i} style={{
                  background: slot ? 'rgba(0,240,117,.03)' : 'var(--bg)',
                  border: slot ? '1px solid rgba(0,240,117,.2)' : '1px dashed var(--border2)',
                  borderRadius: 8, padding: '8px 10px',
                  display: 'flex', alignItems: 'center', gap: 7, minHeight: 44,
                }}>
                  {slot ? (
                    <>
                      <button onClick={() => setCap(slot.player.player_id)} style={{
                        width: 20, height: 20, borderRadius: 4, flexShrink: 0,
                        background: slot.is_captain ? 'var(--gold)' : 'var(--bg3)',
                        border: slot.is_captain ? 'none' : '1px solid var(--border2)',
                        color: slot.is_captain ? '#000' : 'var(--text3)',
                        fontSize: 9, fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit',
                      }} title="Capitão">C</button>
                      <span className="font-condensed" style={{ flex: 1, fontWeight: 800, fontSize: 14, color: 'var(--white)', letterSpacing: '.03em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {slot.player.nickname}
                      </span>
                      <span className="font-tech" style={{ fontSize: 11, color: 'var(--text3)', flexShrink: 0 }}>
                        {formatLC(slot.player.price)}
                      </span>
                      <button onClick={() => remove(slot.player.player_id)} style={{
                        background: 'transparent', border: 'none', color: 'var(--text3)',
                        cursor: 'pointer', fontSize: 12, padding: 0, flexShrink: 0,
                        lineHeight: 1,
                      }}>✕</button>
                    </>
                  ) : (
                    <span style={{ fontSize: 11, color: 'var(--text3)', fontStyle: 'italic' }}>Slot {i + 1} — vazio</span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Budget bar */}
          <div style={{ padding: '0 12px 10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 5 }}>
              <span style={{ color: 'var(--text3)', fontWeight: 600 }}>SALDO</span>
              <span className="font-tech" style={{ fontWeight: 700, color: remaining < 0 ? 'var(--red)' : 'var(--green)' }}>
                {formatLC(remaining)} LC
              </span>
            </div>
            <div style={{ background: 'var(--border)', borderRadius: 4, height: 5, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 4, transition: 'width .35s',
                width: `${budgetPct}%`,
                background: remaining < 20000
                  ? 'linear-gradient(90deg,var(--red),#c03050)'
                  : remaining < 50000
                  ? 'linear-gradient(90deg,var(--yellow),#e08800)'
                  : 'linear-gradient(90deg,var(--green),var(--cyan))',
              }} />
            </div>
          </div>

          {/* Feedback */}
          {saveError && (
            <div style={{ margin: '0 12px 8px', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 7, padding: '7px 10px', fontSize: 11, color: 'var(--red)' }}>
              {saveError}
            </div>
          )}
          {saved && (
            <div style={{ margin: '0 12px 8px', background: 'rgba(0,240,117,.08)', border: '1px solid rgba(0,240,117,.25)', borderRadius: 7, padding: '7px 10px', fontSize: 11, color: 'var(--green)' }}>
              ✓ Lineup salva!
            </div>
          )}

          {/* Save button */}
          <div style={{ padding: '0 12px 12px' }}>
            <button
              onClick={() => startTransition(save)}
              disabled={isPending || lineup.length === 0}
              className="btn-green"
              style={{
                width: '100%', borderRadius: 8, padding: '10px', fontSize: 13,
                fontWeight: 900, fontFamily: 'inherit', border: 'none',
                letterSpacing: '.06em', textTransform: 'uppercase', cursor: lineup.length ? 'pointer' : 'not-allowed',
                opacity: lineup.length === 0 ? 0.4 : 1,
              }}
            >
              {isPending ? 'Salvando...' : '✓ Confirmar Lineup'}
            </button>
            {lineup.length > 0 && !lineup.some(s => s.is_captain) && (
              <p style={{ textAlign: 'center', fontSize: 10, color: 'var(--text3)', marginTop: 6 }}>
                Toque em "C" para definir seu capitão
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
