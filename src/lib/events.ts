export const EVENT_META: Record<string, {
  org: string
  prize: string
  location: string
  dates: string
  startDate: string  // YYYY-MM-DD
  endDate: string
  month: string
  teams: number
  accentColor: string
  flagEmoji: string
  bannerSlug: string | null
  format: string
  invitedTeams: string[]
}> = {
  'BLAST Bounty 2026 Season 2': {
    org: 'BLAST Premier', prize: '$250.000', location: 'Malta', dates: '21 Jul – 2 Ago',
    startDate: '2026-07-21', endDate: '2026-08-02', month: 'Julho 2026',
    teams: 32, accentColor: '#ff6b00', flagEmoji: '🇲🇹',
    bannerSlug: 'blast-bounty-s2',
    format: 'Online (BO3) → Finals LAN Malta',
    invitedTeams: ['Spirit','Vitality','MOUZ','FaZe','FURIA','Natus Vincere','Astralis','G2'],
  },
  'XSE Pro League 2026': {
    org: 'Xinsai Esports', prize: '$500.000', location: 'China', dates: '1–12 Jul',
    startDate: '2026-07-01', endDate: '2026-07-12', month: 'Julho 2026',
    teams: 16, accentColor: '#e63946', flagEmoji: '🇨🇳',
    bannerSlug: null,
    format: 'Swiss 16 times → Playoffs BO3',
    invitedTeams: ['Spirit','The MongolZ','Rare Atom','MOUZ','Vitality','FaZe','Natus Vincere','G2'],
  },
  'Esports World Cup 2026': {
    org: 'ESL FACEIT Group', prize: '$2.000.000', location: 'Paris', dates: '12–23 Ago',
    startDate: '2026-08-12', endDate: '2026-08-23', month: 'Agosto 2026',
    teams: 32, accentColor: '#00bfff', flagEmoji: '🇫🇷',
    bannerSlug: 'ewc-2026',
    format: 'GSL Groups → Bracket Playoffs BO3',
    invitedTeams: ['Spirit','Vitality','FaZe','MOUZ','G2','FURIA','Natus Vincere','Astralis'],
  },
  'BLAST Open Porto 2026': {
    org: 'BLAST Premier', prize: '$1.100.000', location: 'Porto', dates: '26 Ago – 6 Set',
    startDate: '2026-08-26', endDate: '2026-09-06', month: 'Agosto 2026',
    teams: 16, accentColor: '#ff6b00', flagEmoji: '🇵🇹',
    bannerSlug: 'blast-open-porto',
    format: 'Fase Online CPH → Finals BO3 Porto',
    invitedTeams: ['Spirit','Vitality','FaZe','MOUZ','Astralis','G2','Team Liquid','HEROIC'],
  },
  'FISSURE Playground 5': {
    org: 'FISSURE', prize: '$800.000', location: 'Online', dates: 'Set 2026',
    startDate: '2026-09-01', endDate: '2026-09-15', month: 'Setembro 2026',
    teams: 16, accentColor: '#8b5cf6', flagEmoji: '🌐',
    bannerSlug: null,
    format: 'Online Swiss → Playoffs BO3',
    invitedTeams: ['Spirit','MOUZ','Vitality','FaZe','Natus Vincere','G2','HEROIC','Team Liquid'],
  },
  'ESL Pro League Season 24': {
    org: 'ESL Gaming', prize: '$1.000.000', location: 'Katowice', dates: '3–11 Out',
    startDate: '2026-10-03', endDate: '2026-10-11', month: 'Outubro 2026',
    teams: 16, accentColor: '#f59e0b', flagEmoji: '🇵🇱',
    bannerSlug: 'esl-pro-league-s24',
    format: 'Swiss Groups → Bracket BO3 · Spodek Arena',
    invitedTeams: ['Spirit','Vitality','MOUZ','FaZe','G2','Astralis','Team Liquid','HEROIC'],
  },
  'BLAST Rivals 2026 Season 2': {
    org: 'BLAST Premier', prize: '$1.000.000', location: 'Hong Kong', dates: '9–15 Nov',
    startDate: '2026-11-09', endDate: '2026-11-15', month: 'Novembro 2026',
    teams: 8, accentColor: '#ff6b00', flagEmoji: '🇭🇰',
    bannerSlug: 'blast-rivals-s2',
    format: 'Round Robin → Semifinals/Final BO3',
    invitedTeams: ['Spirit','Vitality','FaZe','MOUZ','G2','Astralis','Natus Vincere','Team Liquid'],
  },
}

export function getEventMeta(name: string) {
  return EVENT_META[name] ?? {
    org: 'CS2 Esports', prize: '—', location: '—', dates: '2026',
    startDate: '2026-01-01', endDate: '2026-12-31', month: '2026',
    teams: 16, accentColor: '#00f075', flagEmoji: '🌐',
    bannerSlug: null,
    format: 'A definir',
    invitedTeams: [],
  }
}

export function getBannerUrl(name: string): string | null {
  const meta = getEventMeta(name)
  if (!meta.bannerSlug) return null
  return `/api/img/evt/${meta.bannerSlug}`
}
