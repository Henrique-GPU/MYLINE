'use client'

import { useState, useEffect, useTransition } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

const BUDGET = 100_000
const MAX_PLAYERS = 5

type Team = { id: string; name: string; abbreviation: string }

type PlayerWithPrice = {
  player_id: string
  price: number
  price_change: number
  nickname: string
  name: string
  role: string | null
  team: Team | null
}

type LineupSlot = { player: PlayerWithPrice; is_captain: boolean }

function formatLC(value: number) {
  return value.toLocaleString('pt-BR') + ' LC'
}

function PriceChange({ pct }: { pct: number }) {
  if (pct === 0) return <span className="text-foreground/30 text-xs">—</span>
  const positive = pct > 0
  return (
    <span className={`text-xs font-medium ${positive ? 'text-primary' : 'text-red-400'}`}>
      {positive ? '+' : ''}{(pct * 100).toFixed(1)}%
    </span>
  )
}

function RoleBadge({ role }: { role: string | null }) {
  if (!role) return null
  const colors: Record<string, string> = {
    awper: 'bg-yellow-400/10 text-yellow-400',
    igl: 'bg-purple-400/10 text-purple-400',
    entry: 'bg-red-400/10 text-red-400',
    support: 'bg-blue-400/10 text-blue-400',
    rifler: 'bg-foreground/10 text-foreground/50',
  }
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium uppercase ${colors[role] ?? 'bg-foreground/10 text-foreground/50'}`}>
      {role}
    </span>
  )
}

export function LineupBuilder({
  championshipId,
  roundId,
  roundName,
}: {
  championshipId: string
  roundId: string
  roundName: string
}) {
  const [players, setPlayers] = useState<PlayerWithPrice[]>([])
  const [lineup, setLineup] = useState<LineupSlot[]>([])
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [loadingPlayers, setLoadingPlayers] = useState(true)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const spent = lineup.reduce((sum, s) => sum + s.player.price, 0)
  const remaining = BUDGET - spent

  // Load players + existing lineup
  useEffect(() => {
    const supabase = getSupabaseBrowserClient()

    async function load() {
      setLoadingPlayers(true)
      // 1. player prices for this round
      const { data: prices } = await supabase
        .from('player_prices')
        .select('player_id, price, price_change')
        .eq('round_id', roundId)
        .order('price', { ascending: false })

      if (!prices?.length) {
        setLoadingPlayers(false)
        return
      }

      const playerIds = prices.map((p) => p.player_id)

      // 2. player details
      const { data: playerRows } = await supabase
        .from('players')
        .select('id, nickname, name, role, team_id')
        .in('id', playerIds)

      // 3. teams
      const teamIds = [...new Set(playerRows?.map((p) => p.team_id).filter(Boolean))]
      const { data: teamRows } = teamIds.length
        ? await supabase.from('teams').select('id, name, abbreviation').in('id', teamIds as string[])
        : { data: [] }

      const teamsById = Object.fromEntries((teamRows ?? []).map((t) => [t.id, t]))
      const playersById = Object.fromEntries((playerRows ?? []).map((p) => [p.id, p]))

      const merged: PlayerWithPrice[] = prices.map((pp) => {
        const p = playersById[pp.player_id]
        return {
          player_id: pp.player_id,
          price: pp.price,
          price_change: pp.price_change,
          nickname: p?.nickname ?? '???',
          name: p?.name ?? '',
          role: p?.role ?? null,
          team: p?.team_id ? (teamsById[p.team_id] ?? null) : null,
        }
      })
      setPlayers(merged)

      // 4. existing lineup for this user+round
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoadingPlayers(false); return }

      const { data: existingLineup } = await supabase
        .from('lineups')
        .select('id')
        .eq('user_id', user.id)
        .eq('round_id', roundId)
        .single()

      if (existingLineup) {
        const { data: existingSlots } = await supabase
          .from('lineup_players')
          .select('player_id, is_captain')
          .eq('lineup_id', existingLineup.id)

        const initialSlots: LineupSlot[] = (existingSlots ?? [])
          .map((s) => {
            const player = merged.find((p) => p.player_id === s.player_id)
            return player ? { player, is_captain: s.is_captain } : null
          })
          .filter(Boolean) as LineupSlot[]

        setLineup(initialSlots)
      }
      setLoadingPlayers(false)
    }

    load()
  }, [roundId])

  function addPlayer(player: PlayerWithPrice) {
    if (lineup.length >= MAX_PLAYERS) return
    if (lineup.some((s) => s.player.player_id === player.player_id)) return
    if (remaining < player.price) return
    setLineup((prev) => [...prev, { player, is_captain: false }])
  }

  function removePlayer(playerId: string) {
    setLineup((prev) => prev.filter((s) => s.player.player_id !== playerId))
  }

  function setCaptain(playerId: string) {
    setLineup((prev) =>
      prev.map((s) => ({ ...s, is_captain: s.player.player_id === playerId }))
    )
  }

  async function saveLineup() {
    setSaveError(null)
    setSaved(false)
    const supabase = getSupabaseBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaveError('Você precisa estar logado.'); return }
    if (lineup.length === 0) { setSaveError('Adicione pelo menos 1 jogador.'); return }

    // Upsert lineup
    let lineupId: string

    const { data: existing } = await supabase
      .from('lineups')
      .select('id')
      .eq('user_id', user.id)
      .eq('round_id', roundId)
      .single()

    if (existing) {
      lineupId = existing.id
      // Delete old slots
      await supabase.from('lineup_players').delete().eq('lineup_id', lineupId)
    } else {
      const { data: created, error } = await supabase
        .from('lineups')
        .insert({ user_id: user.id, championship_id: championshipId, round_id: roundId })
        .select('id')
        .single()
      if (error || !created) { setSaveError(error?.message ?? 'Erro ao criar lineup.'); return }
      lineupId = created.id
    }

    // Insert new slots
    const slots = lineup.map((s) => ({
      lineup_id: lineupId,
      player_id: s.player.player_id,
      is_captain: s.is_captain,
    }))

    const { error: slotError } = await supabase.from('lineup_players').insert(slots)
    if (slotError) { setSaveError(slotError.message); return }

    setSaved(true)
  }

  const roles = ['all', 'awper', 'igl', 'entry', 'support', 'rifler']

  const filtered = players.filter((p) => {
    const matchSearch = p.nickname.toLowerCase().includes(search.toLowerCase()) ||
      p.team?.abbreviation.toLowerCase().includes(search.toLowerCase())
    const matchRole = filterRole === 'all' || p.role === filterRole
    return matchSearch && matchRole
  })

  const inLineup = (id: string) => lineup.some((s) => s.player.player_id === id)

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left: Player market */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-4">
          <input
            type="text"
            placeholder="Buscar jogador ou time..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        <div className="flex gap-1.5 mb-4 flex-wrap">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              className={`px-2.5 py-1 text-xs rounded-lg capitalize transition-colors ${
                filterRole === r
                  ? 'bg-primary text-black font-semibold'
                  : 'bg-surface border border-border text-foreground/50 hover:border-primary/30'
              }`}
            >
              {r === 'all' ? 'Todos' : r}
            </button>
          ))}
        </div>

        {loadingPlayers ? (
          <div className="py-12 text-center text-foreground/30 text-sm">Carregando jogadores...</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center bg-surface border border-border rounded-xl">
            <p className="text-foreground/40 text-sm">
              {players.length === 0
                ? 'Nenhum jogador disponível nesta rodada ainda.'
                : 'Nenhum jogador encontrado.'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((p) => {
              const added = inLineup(p.player_id)
              const canAdd = !added && lineup.length < MAX_PLAYERS && remaining >= p.price
              return (
                <div
                  key={p.player_id}
                  className={`flex items-center gap-3 px-4 py-3 bg-surface border rounded-xl transition-colors ${
                    added ? 'border-primary/40 bg-primary/5' : 'border-border hover:border-border/80'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm truncate">{p.nickname}</span>
                      <RoleBadge role={p.role} />
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs text-foreground/40">{p.team?.abbreviation ?? '—'}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-mono font-semibold">{formatLC(p.price)}</div>
                    <PriceChange pct={p.price_change} />
                  </div>

                  <button
                    onClick={() => added ? removePlayer(p.player_id) : addPlayer(p)}
                    disabled={!added && !canAdd}
                    className={`w-8 h-8 rounded-lg text-sm font-bold flex items-center justify-center shrink-0 transition-colors ${
                      added
                        ? 'bg-red-400/10 text-red-400 hover:bg-red-400/20'
                        : canAdd
                        ? 'bg-primary/20 text-primary hover:bg-primary/30'
                        : 'bg-surface-2 text-foreground/20 cursor-not-allowed'
                    }`}
                  >
                    {added ? '−' : '+'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Right: My lineup */}
      <div className="lg:w-72 shrink-0">
        <div className="bg-surface border border-border rounded-xl p-4 sticky top-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Minha Lineup</h3>
            <span className="text-xs text-foreground/40">{roundName}</span>
          </div>

          {/* Slots */}
          <div className="flex flex-col gap-2 mb-4">
            {Array.from({ length: MAX_PLAYERS }).map((_, i) => {
              const slot = lineup[i]
              return (
                <div
                  key={i}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                    slot ? 'bg-surface-2 border-border' : 'border-dashed border-border/40'
                  }`}
                >
                  {slot ? (
                    <>
                      <button
                        onClick={() => setCaptain(slot.player.player_id)}
                        title="Definir como capitão"
                        className={`w-5 h-5 rounded text-xs flex items-center justify-center shrink-0 transition-colors ${
                          slot.is_captain
                            ? 'bg-accent text-black font-bold'
                            : 'bg-surface border border-border text-foreground/30 hover:border-accent/40'
                        }`}
                      >
                        C
                      </button>
                      <span className="flex-1 font-medium truncate">{slot.player.nickname}</span>
                      <span className="text-xs font-mono text-foreground/40 shrink-0">
                        {formatLC(slot.player.price)}
                      </span>
                      <button
                        onClick={() => removePlayer(slot.player.player_id)}
                        className="text-foreground/20 hover:text-red-400 transition-colors text-xs ml-1"
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <span className="text-foreground/20 text-xs">Slot {i + 1} — vazio</span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Budget */}
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-foreground/50">Orçamento restante</span>
              <span className={`font-mono font-semibold ${remaining < 0 ? 'text-red-400' : 'text-primary'}`}>
                {formatLC(remaining)}
              </span>
            </div>
            <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${remaining < 0 ? 'bg-red-400' : 'bg-primary'}`}
                style={{ width: `${Math.max(0, Math.min(100, (remaining / BUDGET) * 100))}%` }}
              />
            </div>
          </div>

          {saveError && (
            <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 mb-3">
              {saveError}
            </p>
          )}
          {saved && (
            <p className="text-primary text-xs bg-primary/10 border border-primary/20 rounded-lg px-3 py-2 mb-3">
              Lineup salva com sucesso!
            </p>
          )}

          <button
            onClick={() => startTransition(saveLineup)}
            disabled={isPending || lineup.length === 0}
            className="w-full py-2.5 bg-primary text-black font-semibold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
          >
            {isPending ? 'Salvando...' : 'Salvar lineup'}
          </button>

          {lineup.length > 0 && !lineup.some((s) => s.is_captain) && (
            <p className="text-xs text-foreground/30 text-center mt-2">
              Toque no "C" para definir seu capitão
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
