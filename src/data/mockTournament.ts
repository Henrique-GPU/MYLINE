// ============================================================
// TESTE - Bounty 2026 Season 2 — Simulação Completa
// ============================================================

export type Role = 'awp' | 'igl' | 'entry' | 'support' | 'rifler'

export interface Player {
  id: string
  nickname: string
  teamId: string
  role: Role
  priceLc: number
  avgPts: number
  ownership: number
  projection: number
}

export interface Team {
  id: string
  name: string
  country: string
  players: Player[]
}

export interface PlayerMatchStats {
  playerId: string
  kills: number
  deaths: number
  assists: number
  adr: number
  rating: number
  entryKills: number
  clutches: number
  isMvp: boolean
  won: boolean
}

export interface Match {
  id: string
  roundOrder: number
  roundName: string
  teamAId: string
  teamBId: string
  format: 'BO3'
  scoreA: number
  scoreB: number
  winnerId: string
  status: 'finished'
  stats: PlayerMatchStats[]
}

export interface UserLineup {
  userId: string
  username: string
  players: string[]  // player IDs
  captainId: string
}

// ── TIMES ──────────────────────────────────────────────────
export const TEAMS: Team[] = [
  {
    id: 'spirit', name: 'Spirit', country: 'Russia',
    players: [
      { id: 'donk',    nickname: 'donk',    teamId: 'spirit',   role: 'rifler', priceLc: 44000, avgPts: 88, ownership: 52, projection: 91 },
      { id: 'sh1ro',   nickname: 'sh1ro',   teamId: 'spirit',   role: 'awp',    priceLc: 42000, avgPts: 82, ownership: 39, projection: 85 },
      { id: 'chopper', nickname: 'chopper', teamId: 'spirit',   role: 'igl',    priceLc: 18000, avgPts: 62, ownership: 18, projection: 65 },
      { id: 'zont1x',  nickname: 'zont1x',  teamId: 'spirit',   role: 'entry',  priceLc: 16000, avgPts: 68, ownership: 22, projection: 70 },
      { id: 'zweih',   nickname: 'zweih',   teamId: 'spirit',   role: 'support',priceLc: 12000, avgPts: 55, ownership: 12, projection: 58 },
    ],
  },
  {
    id: 'vitality', name: 'Vitality', country: 'France',
    players: [
      { id: 'zywoo',   nickname: 'ZywOo',   teamId: 'vitality', role: 'awp',    priceLc: 45000, avgPts: 90, ownership: 48, projection: 93 },
      { id: 'apex',    nickname: 'apEX',    teamId: 'vitality', role: 'igl',    priceLc: 17000, avgPts: 60, ownership: 20, projection: 62 },
      { id: 'ropz',    nickname: 'ropz',    teamId: 'vitality', role: 'rifler', priceLc: 22000, avgPts: 72, ownership: 31, projection: 74 },
      { id: 'mezii',   nickname: 'mezii',   teamId: 'vitality', role: 'support',priceLc: 14000, avgPts: 58, ownership: 15, projection: 60 },
      { id: 'flamez',  nickname: 'flameZ',  teamId: 'vitality', role: 'entry',  priceLc: 16000, avgPts: 65, ownership: 24, projection: 67 },
    ],
  },
  {
    id: 'furia', name: 'FURIA', country: 'Brazil',
    players: [
      { id: 'fallen',  nickname: 'FalleN',  teamId: 'furia',    role: 'igl',    priceLc: 28000, avgPts: 74, ownership: 35, projection: 76 },
      { id: 'yuurih',  nickname: 'yuurih',  teamId: 'furia',    role: 'rifler', priceLc: 26000, avgPts: 73, ownership: 33, projection: 75 },
      { id: 'kscerato',nickname: 'KSCERATO',teamId: 'furia',    role: 'rifler', priceLc: 28000, avgPts: 76, ownership: 38, projection: 78 },
      { id: 'yekindar',nickname: 'YEKINDAR',teamId: 'furia',    role: 'entry',  priceLc: 26000, avgPts: 72, ownership: 30, projection: 74 },
      { id: 'molodoy', nickname: 'molodoy', teamId: 'furia',    role: 'rifler', priceLc: 12000, avgPts: 56, ownership: 11, projection: 58 },
    ],
  },
  {
    id: 'faze', name: 'FaZe', country: 'International',
    players: [
      { id: 'karrigan',nickname: 'karrigan',teamId: 'faze',     role: 'igl',    priceLc: 30000, avgPts: 66, ownership: 28, projection: 68 },
      { id: 'rain',    nickname: 'rain',    teamId: 'faze',     role: 'rifler', priceLc: 25000, avgPts: 71, ownership: 29, projection: 73 },
      { id: 'broky',   nickname: 'broky',   teamId: 'faze',     role: 'awp',    priceLc: 27000, avgPts: 75, ownership: 31, projection: 77 },
      { id: 'frozen',  nickname: 'frozen',  teamId: 'faze',     role: 'rifler', priceLc: 22000, avgPts: 70, ownership: 26, projection: 72 },
      { id: 'elige',   nickname: 'EliGE',   teamId: 'faze',     role: 'entry',  priceLc: 20000, avgPts: 68, ownership: 23, projection: 70 },
    ],
  },
  {
    id: 'navi', name: 'Natus Vincere', country: 'Ukraine',
    players: [
      { id: 'aleksib', nickname: 'Aleksib', teamId: 'navi',     role: 'igl',    priceLc: 18000, avgPts: 63, ownership: 19, projection: 65 },
      { id: 'im',      nickname: 'iM',      teamId: 'navi',     role: 'rifler', priceLc: 14000, avgPts: 62, ownership: 16, projection: 64 },
      { id: 'b1t',     nickname: 'b1t',     teamId: 'navi',     role: 'entry',  priceLc: 18000, avgPts: 67, ownership: 21, projection: 69 },
      { id: 'wonderful',nickname:'w0nderful',teamId: 'navi',    role: 'awp',    priceLc: 36000, avgPts: 80, ownership: 35, projection: 83 },
      { id: 'makazze', nickname: 'makazze', teamId: 'navi',     role: 'support',priceLc: 12000, avgPts: 55, ownership: 10, projection: 57 },
    ],
  },
  {
    id: 'mouz', name: 'MOUZ', country: 'Germany',
    players: [
      { id: 'brollan', nickname: 'Brollan', teamId: 'mouz',     role: 'rifler', priceLc: 20000, avgPts: 70, ownership: 25, projection: 72 },
      { id: 'torzsi',  nickname: 'torzsi',  teamId: 'mouz',     role: 'awp',    priceLc: 36000, avgPts: 79, ownership: 33, projection: 82 },
      { id: 'spinx',   nickname: 'Spinx',   teamId: 'mouz',     role: 'rifler', priceLc: 14000, avgPts: 64, ownership: 18, projection: 66 },
      { id: 'jimpphat',nickname: 'Jimpphat',teamId: 'mouz',     role: 'rifler', priceLc: 14000, avgPts: 63, ownership: 16, projection: 65 },
      { id: 'xertion', nickname: 'xertioN', teamId: 'mouz',     role: 'rifler', priceLc: 12000, avgPts: 61, ownership: 14, projection: 63 },
    ],
  },
  {
    id: 'astralis', name: 'Astralis', country: 'Denmark',
    players: [
      { id: 'device',  nickname: 'device',  teamId: 'astralis', role: 'awp',    priceLc: 40000, avgPts: 83, ownership: 36, projection: 86 },
      { id: 'hooxi',   nickname: 'HooXi',   teamId: 'astralis', role: 'igl',    priceLc: 14000, avgPts: 59, ownership: 17, projection: 61 },
      { id: 'stavn',   nickname: 'stavn',   teamId: 'astralis', role: 'rifler', priceLc: 22000, avgPts: 71, ownership: 27, projection: 73 },
      { id: 'jabbi',   nickname: 'jabbi',   teamId: 'astralis', role: 'rifler', priceLc: 18000, avgPts: 67, ownership: 22, projection: 69 },
      { id: 'staehr',  nickname: 'Staehr',  teamId: 'astralis', role: 'rifler', priceLc: 14000, avgPts: 62, ownership: 16, projection: 64 },
    ],
  },
  {
    id: 'g2', name: 'G2', country: 'International',
    players: [
      { id: 'hunter',  nickname: 'huNter-', teamId: 'g2',       role: 'rifler', priceLc: 16000, avgPts: 66, ownership: 20, projection: 68 },
      { id: 'malbs',   nickname: 'malbsMd', teamId: 'g2',       role: 'rifler', priceLc: 14000, avgPts: 63, ownership: 17, projection: 65 },
      { id: 'sunpayus',nickname: 'SunPayus',teamId: 'g2',       role: 'awp',    priceLc: 16000, avgPts: 67, ownership: 20, projection: 69 },
      { id: 'heavygod',nickname: 'HeavyGod',teamId: 'g2',       role: 'rifler', priceLc: 12000, avgPts: 61, ownership: 14, projection: 63 },
      { id: 'matys',   nickname: 'MATYS',   teamId: 'g2',       role: 'rifler', priceLc: 12000, avgPts: 60, ownership: 13, projection: 62 },
    ],
  },
]

// ── PARTIDAS + STATS ────────────────────────────────────────
export const MATCHES: Match[] = [
  // ── QF1: Spirit 2-0 FURIA ──
  {
    id: 'qf1', roundOrder: 1, roundName: 'Quartas de Final', format: 'BO3',
    teamAId: 'spirit', teamBId: 'furia', scoreA: 2, scoreB: 0, winnerId: 'spirit', status: 'finished',
    stats: [
      { playerId: 'donk',    kills: 52, deaths: 28, assists: 10, adr: 98.4, rating: 1.62, entryKills: 8, clutches: 3, isMvp: true,  won: true  },
      { playerId: 'sh1ro',   kills: 44, deaths: 32, assists: 8,  adr: 84.2, rating: 1.31, entryKills: 2, clutches: 1, isMvp: false, won: true  },
      { playerId: 'chopper', kills: 28, deaths: 35, assists: 14, adr: 62.1, rating: 0.88, entryKills: 1, clutches: 0, isMvp: false, won: true  },
      { playerId: 'zont1x',  kills: 38, deaths: 30, assists: 6,  adr: 76.5, rating: 1.18, entryKills: 12, clutches:2, isMvp: false, won: true  },
      { playerId: 'zweih',   kills: 24, deaths: 36, assists: 16, adr: 58.3, rating: 0.82, entryKills: 0, clutches: 1, isMvp: false, won: true  },
      { playerId: 'fallen',  kills: 32, deaths: 40, assists: 10, adr: 70.1, rating: 0.94, entryKills: 3, clutches: 1, isMvp: false, won: false },
      { playerId: 'yuurih',  kills: 30, deaths: 42, assists: 8,  adr: 68.4, rating: 0.88, entryKills: 2, clutches: 0, isMvp: false, won: false },
      { playerId: 'kscerato',kills: 28, deaths: 40, assists: 12, adr: 65.2, rating: 0.86, entryKills: 1, clutches: 1, isMvp: false, won: false },
      { playerId: 'yekindar',kills: 34, deaths: 44, assists: 6,  adr: 72.8, rating: 0.91, entryKills: 9, clutches: 0, isMvp: false, won: false },
      { playerId: 'molodoy', kills: 20, deaths: 42, assists: 8,  adr: 52.1, rating: 0.72, entryKills: 1, clutches: 0, isMvp: false, won: false },
    ],
  },
  // ── QF2: Vitality 2-1 MOUZ ──
  {
    id: 'qf2', roundOrder: 1, roundName: 'Quartas de Final', format: 'BO3',
    teamAId: 'vitality', teamBId: 'mouz', scoreA: 2, scoreB: 1, winnerId: 'vitality', status: 'finished',
    stats: [
      { playerId: 'zywoo',   kills: 68, deaths: 36, assists: 8,  adr: 104.2, rating: 1.74, entryKills: 4, clutches: 4, isMvp: true,  won: true  },
      { playerId: 'apex',    kills: 34, deaths: 42, assists: 18, adr: 64.3,  rating: 0.92, entryKills: 2, clutches: 1, isMvp: false, won: true  },
      { playerId: 'ropz',    kills: 52, deaths: 38, assists: 10, adr: 86.1,  rating: 1.28, entryKills: 3, clutches: 2, isMvp: false, won: true  },
      { playerId: 'mezii',   kills: 28, deaths: 40, assists: 20, adr: 59.8,  rating: 0.84, entryKills: 1, clutches: 0, isMvp: false, won: true  },
      { playerId: 'flamez',  kills: 40, deaths: 38, assists: 8,  adr: 78.4,  rating: 1.05, entryKills: 10,clutches: 1, isMvp: false, won: true  },
      { playerId: 'torzsi',  kills: 58, deaths: 42, assists: 6,  adr: 92.1,  rating: 1.41, entryKills: 3, clutches: 3, isMvp: false, won: false },
      { playerId: 'brollan', kills: 44, deaths: 44, assists: 10, adr: 78.5,  rating: 1.00, entryKills: 2, clutches: 1, isMvp: false, won: false },
      { playerId: 'spinx',   kills: 36, deaths: 44, assists: 12, adr: 68.2,  rating: 0.92, entryKills: 1, clutches: 0, isMvp: false, won: false },
      { playerId: 'jimpphat',kills: 32, deaths: 46, assists: 8,  adr: 62.3,  rating: 0.84, entryKills: 1, clutches: 0, isMvp: false, won: false },
      { playerId: 'xertion', kills: 28, deaths: 44, assists: 14, adr: 58.1,  rating: 0.78, entryKills: 0, clutches: 1, isMvp: false, won: false },
    ],
  },
  // ── QF3: FaZe 2-0 G2 ──
  {
    id: 'qf3', roundOrder: 1, roundName: 'Quartas de Final', format: 'BO3',
    teamAId: 'faze', teamBId: 'g2', scoreA: 2, scoreB: 0, winnerId: 'faze', status: 'finished',
    stats: [
      { playerId: 'broky',   kills: 48, deaths: 26, assists: 8,  adr: 90.4, rating: 1.52, entryKills: 2, clutches: 3, isMvp: true,  won: true  },
      { playerId: 'karrigan',kills: 28, deaths: 32, assists: 16, adr: 60.2, rating: 0.94, entryKills: 1, clutches: 1, isMvp: false, won: true  },
      { playerId: 'rain',    kills: 44, deaths: 28, assists: 10, adr: 85.1, rating: 1.38, entryKills: 6, clutches: 2, isMvp: false, won: true  },
      { playerId: 'frozen',  kills: 36, deaths: 30, assists: 8,  adr: 74.3, rating: 1.14, entryKills: 2, clutches: 1, isMvp: false, won: true  },
      { playerId: 'elige',   kills: 38, deaths: 28, assists: 6,  adr: 78.6, rating: 1.22, entryKills: 10,clutches: 1, isMvp: false, won: true  },
      { playerId: 'sunpayus',kills: 32, deaths: 40, assists: 6,  adr: 68.2, rating: 0.92, entryKills: 2, clutches: 1, isMvp: false, won: false },
      { playerId: 'hunter',  kills: 28, deaths: 42, assists: 8,  adr: 62.1, rating: 0.84, entryKills: 1, clutches: 0, isMvp: false, won: false },
      { playerId: 'malbs',   kills: 24, deaths: 42, assists: 10, adr: 56.4, rating: 0.78, entryKills: 0, clutches: 0, isMvp: false, won: false },
      { playerId: 'heavygod',kills: 20, deaths: 40, assists: 8,  adr: 50.1, rating: 0.72, entryKills: 1, clutches: 0, isMvp: false, won: false },
      { playerId: 'matys',   kills: 18, deaths: 42, assists: 6,  adr: 46.3, rating: 0.68, entryKills: 0, clutches: 0, isMvp: false, won: false },
    ],
  },
  // ── QF4: NAVI 1-2 Astralis ──
  {
    id: 'qf4', roundOrder: 1, roundName: 'Quartas de Final', format: 'BO3',
    teamAId: 'navi', teamBId: 'astralis', scoreA: 1, scoreB: 2, winnerId: 'astralis', status: 'finished',
    stats: [
      { playerId: 'device',  kills: 62, deaths: 34, assists: 8,  adr: 96.8, rating: 1.58, entryKills: 2, clutches: 4, isMvp: true,  won: true  },
      { playerId: 'stavn',   kills: 46, deaths: 38, assists: 12, adr: 82.4, rating: 1.24, entryKills: 4, clutches: 2, isMvp: false, won: true  },
      { playerId: 'jabbi',   kills: 38, deaths: 38, assists: 10, adr: 74.1, rating: 1.08, entryKills: 3, clutches: 1, isMvp: false, won: true  },
      { playerId: 'hooxi',   kills: 26, deaths: 40, assists: 18, adr: 58.3, rating: 0.86, entryKills: 1, clutches: 0, isMvp: false, won: true  },
      { playerId: 'staehr',  kills: 32, deaths: 40, assists: 8,  adr: 66.2, rating: 0.94, entryKills: 2, clutches: 1, isMvp: false, won: true  },
      { playerId: 'wonderful',kills:54, deaths: 36, assists: 6,  adr: 90.2, rating: 1.44, entryKills: 2, clutches: 3, isMvp: false, won: false },
      { playerId: 'b1t',     kills: 40, deaths: 40, assists: 10, adr: 76.4, rating: 1.06, entryKills: 8, clutches: 1, isMvp: false, won: false },
      { playerId: 'aleksib', kills: 26, deaths: 42, assists: 18, adr: 56.1, rating: 0.82, entryKills: 1, clutches: 0, isMvp: false, won: false },
      { playerId: 'im',      kills: 30, deaths: 42, assists: 10, adr: 62.3, rating: 0.88, entryKills: 2, clutches: 0, isMvp: false, won: false },
      { playerId: 'makazze', kills: 22, deaths: 44, assists: 14, adr: 50.2, rating: 0.74, entryKills: 0, clutches: 0, isMvp: false, won: false },
    ],
  },
  // ── SF1: Spirit 2-1 Vitality ──
  {
    id: 'sf1', roundOrder: 2, roundName: 'Semifinal', format: 'BO3',
    teamAId: 'spirit', teamBId: 'vitality', scoreA: 2, scoreB: 1, winnerId: 'spirit', status: 'finished',
    stats: [
      { playerId: 'donk',    kills: 72, deaths: 38, assists: 12, adr: 106.4, rating: 1.78, entryKills: 10, clutches:4, isMvp: true,  won: true  },
      { playerId: 'sh1ro',   kills: 58, deaths: 44, assists: 10, adr: 88.6,  rating: 1.32, entryKills: 3, clutches: 2, isMvp: false, won: true  },
      { playerId: 'zont1x',  kills: 48, deaths: 42, assists: 8,  adr: 80.2,  rating: 1.14, entryKills: 14,clutches: 2, isMvp: false, won: true  },
      { playerId: 'chopper', kills: 32, deaths: 46, assists: 20, adr: 62.4,  rating: 0.88, entryKills: 2, clutches: 1, isMvp: false, won: true  },
      { playerId: 'zweih',   kills: 28, deaths: 48, assists: 18, adr: 56.1,  rating: 0.80, entryKills: 0, clutches: 1, isMvp: false, won: true  },
      { playerId: 'zywoo',   kills: 74, deaths: 42, assists: 8,  adr: 108.2, rating: 1.72, entryKills: 5, clutches: 5, isMvp: false, won: false },
      { playerId: 'ropz',    kills: 52, deaths: 48, assists: 12, adr: 82.4,  rating: 1.18, entryKills: 3, clutches: 2, isMvp: false, won: false },
      { playerId: 'flamez',  kills: 44, deaths: 48, assists: 10, adr: 74.6,  rating: 1.02, entryKills: 12,clutches: 1, isMvp: false, won: false },
      { playerId: 'apex',    kills: 30, deaths: 50, assists: 20, adr: 60.2,  rating: 0.82, entryKills: 2, clutches: 0, isMvp: false, won: false },
      { playerId: 'mezii',   kills: 26, deaths: 50, assists: 22, adr: 54.3,  rating: 0.76, entryKills: 1, clutches: 0, isMvp: false, won: false },
    ],
  },
  // ── SF2: FaZe 2-0 Astralis ──
  {
    id: 'sf2', roundOrder: 2, roundName: 'Semifinal', format: 'BO3',
    teamAId: 'faze', teamBId: 'astralis', scoreA: 2, scoreB: 0, winnerId: 'faze', status: 'finished',
    stats: [
      { playerId: 'rain',    kills: 54, deaths: 28, assists: 8,  adr: 96.2, rating: 1.58, entryKills: 8, clutches: 3, isMvp: true,  won: true  },
      { playerId: 'broky',   kills: 48, deaths: 30, assists: 10, adr: 88.4, rating: 1.42, entryKills: 2, clutches: 2, isMvp: false, won: true  },
      { playerId: 'frozen',  kills: 42, deaths: 32, assists: 10, adr: 80.1, rating: 1.24, entryKills: 3, clutches: 2, isMvp: false, won: true  },
      { playerId: 'elige',   kills: 40, deaths: 30, assists: 8,  adr: 78.3, rating: 1.22, entryKills: 12,clutches: 1, isMvp: false, won: true  },
      { playerId: 'karrigan',kills: 28, deaths: 34, assists: 18, adr: 58.4, rating: 0.90, entryKills: 1, clutches: 1, isMvp: false, won: true  },
      { playerId: 'device',  kills: 46, deaths: 40, assists: 8,  adr: 84.2, rating: 1.22, entryKills: 2, clutches: 2, isMvp: false, won: false },
      { playerId: 'stavn',   kills: 36, deaths: 40, assists: 10, adr: 70.4, rating: 0.98, entryKills: 3, clutches: 1, isMvp: false, won: false },
      { playerId: 'jabbi',   kills: 30, deaths: 40, assists: 8,  adr: 62.1, rating: 0.88, entryKills: 2, clutches: 0, isMvp: false, won: false },
      { playerId: 'staehr',  kills: 24, deaths: 40, assists: 10, adr: 54.3, rating: 0.80, entryKills: 1, clutches: 0, isMvp: false, won: false },
      { playerId: 'hooxi',   kills: 18, deaths: 40, assists: 16, adr: 46.2, rating: 0.72, entryKills: 0, clutches: 0, isMvp: false, won: false },
    ],
  },
  // ── FINAL: Spirit 2-1 FaZe ──
  {
    id: 'final', roundOrder: 3, roundName: 'Grande Final', format: 'BO3',
    teamAId: 'spirit', teamBId: 'faze', scoreA: 2, scoreB: 1, winnerId: 'spirit', status: 'finished',
    stats: [
      { playerId: 'donk',    kills: 68, deaths: 36, assists: 14, adr: 102.8, rating: 1.72, entryKills: 9, clutches: 4, isMvp: true,  won: true  },
      { playerId: 'sh1ro',   kills: 54, deaths: 38, assists: 10, adr: 90.2,  rating: 1.38, entryKills: 3, clutches: 3, isMvp: false, won: true  },
      { playerId: 'zont1x',  kills: 46, deaths: 40, assists: 10, adr: 78.4,  rating: 1.16, entryKills: 13,clutches: 2, isMvp: false, won: true  },
      { playerId: 'chopper', kills: 30, deaths: 44, assists: 22, adr: 60.1,  rating: 0.86, entryKills: 1, clutches: 1, isMvp: false, won: true  },
      { playerId: 'zweih',   kills: 26, deaths: 46, assists: 20, adr: 54.2,  rating: 0.78, entryKills: 0, clutches: 1, isMvp: false, won: true  },
      { playerId: 'broky',   kills: 58, deaths: 40, assists: 10, adr: 94.6,  rating: 1.44, entryKills: 3, clutches: 3, isMvp: false, won: false },
      { playerId: 'rain',    kills: 48, deaths: 42, assists: 10, adr: 82.3,  rating: 1.22, entryKills: 7, clutches: 2, isMvp: false, won: false },
      { playerId: 'frozen',  kills: 40, deaths: 42, assists: 10, adr: 74.8,  rating: 1.06, entryKills: 3, clutches: 1, isMvp: false, won: false },
      { playerId: 'elige',   kills: 36, deaths: 42, assists: 8,  adr: 70.2,  rating: 1.00, entryKills: 10,clutches: 1, isMvp: false, won: false },
      { playerId: 'karrigan',kills: 24, deaths: 44, assists: 20, adr: 52.1,  rating: 0.80, entryKills: 1, clutches: 0, isMvp: false, won: false },
    ],
  },
]

// ── LINEUPS DOS USUÁRIOS ─────────────────────────────────────
export const USER_LINEUPS: UserLineup[] = [
  { userId: '1', username: 'Henrique',   players: ['zywoo', 'donk',  'sh1ro',  'rain',     'karrigan'],  captainId: 'zywoo'   },
  { userId: '2', username: 'JoãoFPS',    players: ['donk',  'fallen','kscerato','device',   'yekindar'], captainId: 'donk'    },
  { userId: '3', username: 'DustMaster', players: ['zywoo', 'broky', 'stavn',  'kscerato',  'yuurih'],   captainId: 'zywoo'   },
  { userId: '4', username: 'Fallenzera', players: ['fallen','kscerato','yuurih','yekindar', 'device'],   captainId: 'fallen'  },
  { userId: '5', username: 'ClutchKing', players: ['donk',  'sh1ro', 'zont1x', 'chopper',  'karrigan'], captainId: 'donk'    },
]
