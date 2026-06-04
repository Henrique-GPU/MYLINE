import type { PlayerMatchStats, Match, UserLineup, Player, Team } from '@/data/mockTournament'

// ── SISTEMA DE PONTUAÇÃO ──────────────────────────────────────
export function calcFantasyPoints(stats: PlayerMatchStats): number {
  let pts = 0
  pts += stats.kills    * 2      // Kill: +2
  pts += stats.assists  * 1      // Assist: +1
  pts += stats.deaths   * -1     // Death: -1
  if (stats.adr   > 80)  pts += 5  // ADR > 80: +5
  if (stats.rating > 1.10) pts += 5 // Rating > 1.10: +5
  pts += stats.entryKills * 3    // Entry Kill: +3
  pts += stats.clutches   * 5    // Clutch: +5
  if (stats.isMvp) pts += 10     // MVP: +10
  if (stats.won)   pts += 5      // Vitória: +5
  return Math.round(pts * 10) / 10
}

// ── PONTUAÇÃO TOTAL DE UM JOGADOR EM TODOS OS MATCHES ────────
export function playerTotalPoints(playerId: string, matches: Match[]): number {
  return matches.reduce((total, match) => {
    const stat = match.stats.find(s => s.playerId === playerId)
    if (!stat) return total
    return total + calcFantasyPoints(stat)
  }, 0)
}

// ── PONTUAÇÃO DE UMA LINEUP ───────────────────────────────────
export interface LineupResult {
  userId: string
  username: string
  players: Array<{
    playerId: string
    nickname: string
    teamName: string
    role: string
    rawPoints: number
    isCaptain: boolean
    finalPoints: number
    stats: PlayerMatchStats[]
  }>
  totalPoints: number
  captainBonus: number
  budgetUsed: number
}

export function calcLineupResult(
  lineup: UserLineup,
  matches: Match[],
  allPlayers: Player[],
  teams: Team[]
): LineupResult {
  const teamsById = Object.fromEntries(teams.map(t => [t.id, t]))
  const playersById = Object.fromEntries(allPlayers.map(p => [p.id, p]))

  let totalRaw = 0
  let captainBonus = 0
  let budgetUsed = 0

  const players = lineup.players.map(pid => {
    const player = playersById[pid]
    const team   = player ? teamsById[player.teamId] : null

    const playerStats = matches
      .map(m => m.stats.find(s => s.playerId === pid))
      .filter((s): s is PlayerMatchStats => !!s)

    const rawPoints = playerStats.reduce((t, s) => t + calcFantasyPoints(s), 0)
    const isCaptain = pid === lineup.captainId
    const finalPoints = isCaptain ? rawPoints * 1.5 : rawPoints

    if (isCaptain) captainBonus = rawPoints * 0.5
    totalRaw += rawPoints
    budgetUsed += player?.priceLc ?? 0

    return {
      playerId: pid,
      nickname: player?.nickname ?? pid,
      teamName: team?.name ?? '—',
      role: player?.role ?? '—',
      rawPoints: Math.round(rawPoints * 10) / 10,
      isCaptain,
      finalPoints: Math.round(finalPoints * 10) / 10,
      stats: playerStats,
    }
  })

  const totalPoints = Math.round((totalRaw + captainBonus) * 10) / 10

  return {
    userId: lineup.userId,
    username: lineup.username,
    players,
    totalPoints,
    captainBonus: Math.round(captainBonus * 10) / 10,
    budgetUsed,
  }
}

// ── RANKING FINAL ─────────────────────────────────────────────
export interface RankingEntry {
  position: number
  previousPosition?: number
  userId: string
  username: string
  totalPoints: number
  budgetUsed: number
  captainId: string
  captainNick: string
}

export function buildRanking(results: LineupResult[], lineups: UserLineup[], players: Player[]): RankingEntry[] {
  const playersById = Object.fromEntries(players.map(p => [p.id, p]))

  return results
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((r, i) => {
      const lineup = lineups.find(l => l.userId === r.userId)!
      const captain = playersById[lineup.captainId]
      return {
        position: i + 1,
        userId: r.userId,
        username: r.username,
        totalPoints: r.totalPoints,
        budgetUsed: r.budgetUsed,
        captainId: lineup.captainId,
        captainNick: captain?.nickname ?? '—',
      }
    })
}
