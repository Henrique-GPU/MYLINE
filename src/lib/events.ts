// Metadados dos eventos CS2 2026
export const EVENT_META: Record<string, {
  org: string
  prize: string
  location: string
  dates: string
  teams: number
  accentColor: string
  flagEmoji: string
}> = {
  'BLAST Bounty 2026 Season 2': {
    org: 'BLAST Premier', prize: '$250,000', location: 'Malta', dates: '21 Jul – 2 Ago',
    teams: 32, accentColor: '#ff6b00', flagEmoji: '🇲🇹',
  },
  'XSE Pro League 2026': {
    org: 'Xinsai Esports', prize: '$500,000', location: 'China', dates: '1–12 Jul',
    teams: 16, accentColor: '#e63946', flagEmoji: '🇨🇳',
  },
  'Esports World Cup 2026': {
    org: 'ESL FACEIT Group', prize: '$2,000,000', location: 'Paris', dates: '12–23 Ago',
    teams: 32, accentColor: '#00bfff', flagEmoji: '🇫🇷',
  },
  'BLAST Open Porto 2026': {
    org: 'BLAST Premier', prize: '$1,100,000', location: 'Porto', dates: '26 Ago – 6 Set',
    teams: 16, accentColor: '#ff6b00', flagEmoji: '🇵🇹',
  },
  'FISSURE Playground 5': {
    org: 'FISSURE', prize: '$800,000', location: 'Online', dates: 'Set 2026',
    teams: 16, accentColor: '#8b5cf6', flagEmoji: '🌐',
  },
  'ESL Pro League Season 24': {
    org: 'ESL Gaming', prize: '$1,000,000', location: 'Katowice', dates: '3–11 Out',
    teams: 16, accentColor: '#f59e0b', flagEmoji: '🇵🇱',
  },
  'BLAST Rivals 2026 Season 2': {
    org: 'BLAST Premier', prize: '$1,000,000', location: 'Hong Kong', dates: '9–15 Nov',
    teams: 8, accentColor: '#ff6b00', flagEmoji: '🇭🇰',
  },
}

export function getEventMeta(name: string) {
  return EVENT_META[name] ?? {
    org: 'CS2 Esports', prize: '—', location: '—', dates: '2026',
    teams: 16, accentColor: '#00f075', flagEmoji: '🌐',
  }
}
