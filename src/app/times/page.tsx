import { AppLayout } from '@/components/layout/app-layout'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { TeamLogo } from '@/components/teams/team-logo'

// Logos confirmados via Liquipedia (proxy server-side)
const TEAM_LOGOS: Record<string, string> = {
  'Vitality':          '/api/img/lp/thumb/e/e4/Team_Vitality_2023_lightmode.png/120px-Team_Vitality_2023_lightmode.png',
  'MOUZ':              '/api/img/lp/thumb/a/a5/MOUZ_2021_full_allmode.png/120px-MOUZ_2021_full_allmode.png',
  'Spirit':            '/api/img/lp/thumb/6/66/Team_Spirit_2022_lightmode.png/120px-Team_Spirit_2022_lightmode.png',
  'FaZe':              '/api/img/lp/thumb/f/f9/FaZe_Esports_2026_lightmode.png/120px-FaZe_Esports_2026_lightmode.png',
  'FURIA':             '/api/img/lp/thumb/a/aa/FURIA_Esports_allmode.png/120px-FURIA_Esports_allmode.png',
  'Natus Vincere':     '/api/img/lp/thumb/3/3f/Natus_Vincere_2021_lightmode.png/120px-Natus_Vincere_2021_lightmode.png',
  'Astralis':          '/api/img/lp/thumb/b/b5/Astralis_2020_full_allmode.png/120px-Astralis_2020_full_allmode.png',
  'G2':                '/api/img/lp/thumb/2/27/G2_Esports_2020_full_lightmode.png/120px-G2_Esports_2020_full_lightmode.png',
  'Team Liquid':       '/api/img/lp/thumb/f/f5/Team_Liquid_2024_full_lightmode.png/120px-Team_Liquid_2024_full_lightmode.png',
  'HEROIC':            '/api/img/lp/thumb/0/0d/HEROIC_2024_allmode.png/120px-HEROIC_2024_allmode.png',
  'Ninjas in Pyjamas': '/api/img/lp/thumb/4/42/Ninjas_in_Pyjamas_2021_full_lightmode.png/120px-Ninjas_in_Pyjamas_2021_full_lightmode.png',
  'Virtus.pro':        '/api/img/lp/thumb/7/74/Virtus.pro_2022_lightmode.png/120px-Virtus.pro_2022_lightmode.png',
}

// Cores oficiais dos times (fallback)
const TEAM_COLORS: Record<string, { bg: string; color: string; abbr?: string }> = {
  'Vitality':          { bg: '#ffd700', color: '#000000', abbr: 'VIT' },
  'MOUZ':              { bg: '#e63946', color: '#ffffff', abbr: 'MOUZ' },
  'The MongolZ':       { bg: '#1a6fc4', color: '#ffffff', abbr: 'MON' },
  'Spirit':            { bg: '#4a0072', color: '#ffffff', abbr: 'SPR' },
  'Aurora':            { bg: '#00bfff', color: '#000000', abbr: 'AUR' },
  'FaZe':              { bg: '#c8102e', color: '#ffffff', abbr: 'FAZE' },
  'FURIA':             { bg: '#ffffff', color: '#000000', abbr: 'FUR' },
  'Natus Vincere':     { bg: '#f5a623', color: '#000000', abbr: 'NAVI' },
  'paiN':              { bg: '#0066cc', color: '#ffffff', abbr: 'PNG' },
  'Astralis':          { bg: '#aa0000', color: '#ffffff', abbr: 'AST' },
  'G2':                { bg: '#ff6b00', color: '#ffffff', abbr: 'G2' },
  'Legacy':            { bg: '#00a651', color: '#ffffff', abbr: 'LEG' },
  'Virtus.pro':        { bg: '#d4af37', color: '#000000', abbr: 'VP' },
  'Team Liquid':       { bg: '#1a9eff', color: '#ffffff', abbr: 'LIQ' },
  'HEROIC':            { bg: '#c8102e', color: '#ffffff', abbr: 'HER' },
  'Ninjas in Pyjamas': { bg: '#000000', color: '#ffffff', abbr: 'NiP' },
  'MIBR':              { bg: '#007a3d', color: '#ffffff', abbr: 'MIBR' },
  'Complexity':        { bg: '#005eb8', color: '#ffffff', abbr: 'COL' },
  'B8':                { bg: '#1a1a2e', color: '#00d4ff', abbr: 'B8' },
  'BetBoom':           { bg: '#7b2ff7', color: '#ffffff', abbr: 'BB' },
  'Nemiga':            { bg: '#ff0000', color: '#ffffff', abbr: 'NEM' },
  'BIG':               { bg: '#ff6600', color: '#ffffff', abbr: 'BIG' },
  'FlyQuest':          { bg: '#27ae60', color: '#ffffff', abbr: 'FLY' },
  'TNL':               { bg: '#2c3e50', color: '#ffffff', abbr: 'TNL' },
  'Passion UA':        { bg: '#0057b7', color: '#ffd700', abbr: 'PUA' },
  'OG':                { bg: '#1a1a1a', color: '#00d4ff', abbr: 'OG' },
  'ECSTATIC':          { bg: '#ff1493', color: '#ffffff', abbr: 'ECS' },
  'fnatic':            { bg: '#ff5500', color: '#ffffff', abbr: 'FNC' },
  'NRG':               { bg: '#00c8ff', color: '#000000', abbr: 'NRG' },
  'FUT':               { bg: '#e63946', color: '#ffffff', abbr: 'FUT' },
  'Rare Atom':         { bg: '#c0392b', color: '#ffffff', abbr: 'RA' },
  'ENCE':              { bg: '#005eb8', color: '#ffffff', abbr: 'ENCE' },
}

const ROLE_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  awper:   { bg: 'rgba(245,158,11,.12)', color: '#f59e0b', label: 'AWP' },
  igl:     { bg: 'rgba(139,92,246,.12)', color: '#8b5cf6', label: 'IGL' },
  entry:   { bg: 'rgba(239,68,68,.12)',  color: '#ef4444', label: 'ENT' },
  support: { bg: 'rgba(30,127,255,.12)', color: '#1e7fff', label: 'SUP' },
  rifler:  { bg: 'rgba(255,255,255,.06)', color: '#5a6e90', label: 'RIF' },
}

export default async function TimesPage() {
  const supabase = getSupabaseServerClient()

  const { data: teams } = await supabase
    .from('teams')
    .select('*')
    .order('name', { ascending: true })

  const { data: players } = await supabase
    .from('players')
    .select('*')
    .order('price_lc', { ascending: false })

  type Player = NonNullable<typeof players>[number]
  const playersByTeam = (players ?? []).reduce((acc, p) => {
    if (!p.team_id) return acc
    if (!acc[p.team_id]) acc[p.team_id] = []
    acc[p.team_id].push(p)
    return acc
  }, {} as Record<string, Player[]>)

  // Sort teams by their top player price
  const sortedTeams = [...(teams ?? [])].sort((a, b) => {
    const topA = Math.max(...(playersByTeam[a.id] ?? []).map(p => p.price_lc ?? 0), 0)
    const topB = Math.max(...(playersByTeam[b.id] ?? []).map(p => p.price_lc ?? 0), 0)
    return topB - topA
  })

  return (
    <AppLayout>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 20px' }} className="page-animate">
        <div style={{ marginBottom: 24 }}>
          <h1 className="font-condensed" style={{ fontWeight: 900, fontSize: 26, color: 'var(--white)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 3 }}>
            Times Oficiais
          </h1>
          <p style={{ color: 'var(--text3)', fontSize: 13 }}>
            {teams?.length ?? 0} times participando do BLAST Bounty 2026 Season 2
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
          {sortedTeams.map(team => {
            const roster = playersByTeam[team.id] ?? []
            const brand = TEAM_COLORS[team.name] ?? { bg: '#1a1a2e', color: '#00d4ff', abbr: team.name.slice(0, 3).toUpperCase() }
            const abbr = brand.abbr ?? team.name.slice(0, 3).toUpperCase()
            const topPrice = Math.max(...roster.map(p => p.price_lc ?? 0), 0)
            const logoUrl = TEAM_LOGOS[team.name] ?? null

            return (
              <div key={team.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                {/* Header with team brand */}
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, background: `${brand.bg}10`, borderTop: `3px solid ${brand.bg}` }}>
                  {/* Logo */}
                  <div style={{ width: 44, height: 44, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: logoUrl ? 'rgba(255,255,255,.05)' : brand.bg, boxShadow: `0 0 12px ${brand.bg}40`, border: `1px solid ${brand.bg}30`, padding: logoUrl ? 4 : 0 }}>
                    <TeamLogo logoUrl={logoUrl} teamName={team.name} abbr={abbr} brandColor={brand.color} size={44} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <span className="font-condensed" style={{ fontWeight: 900, fontSize: 16, color: 'var(--white)', letterSpacing: '.04em' }}>{team.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                      <span style={{ fontSize: 10, color: 'var(--text3)' }}>{team.country}</span>
                      <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--text3)', display: 'inline-block' }} />
                      <span style={{ fontSize: 10, color: 'var(--text3)' }}>{roster.length} jogadores</span>
                    </div>
                  </div>
                  {topPrice > 0 && (
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Top</div>
                      <div className="font-tech" style={{ fontSize: 12, fontWeight: 700, color: brand.bg }}>{topPrice.toLocaleString('pt-BR')}</div>
                    </div>
                  )}
                </div>

                {/* Roster */}
                {roster.length === 0 ? (
                  <div style={{ padding: '16px', textAlign: 'center', fontSize: 12, color: 'var(--text3)' }}>Sem jogadores cadastrados</div>
                ) : (
                  roster.map((p, i) => {
                    const role = ROLE_COLORS[p.role ?? ''] ?? ROLE_COLORS.rifler
                    return (
                      <div key={p.id} style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px',
                        borderBottom: i < roster.length - 1 ? '1px solid var(--border)' : 'none',
                        transition: 'background .1s',
                      }}
                        className="hover-card"
                      >
                        {/* Role color dot */}
                        <div style={{ width: 4, height: 28, borderRadius: 2, background: role.color, flexShrink: 0, opacity: .7 }} />
                        {/* Avatar */}
                        <div style={{ width: 30, height: 30, borderRadius: 6, flexShrink: 0, background: `${role.color}18`, border: `1px solid ${role.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, color: role.color, fontFamily: 'var(--font-condensed)' }}>
                          {p.nickname.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-condensed" style={{ flex: 1, fontWeight: 800, fontSize: 14, color: 'var(--white)', letterSpacing: '.03em' }}>{p.nickname}</span>
                        <span style={{ background: role.bg, color: role.color, border: `1px solid ${role.color}40`, borderRadius: 4, padding: '1px 6px', fontSize: 9, fontWeight: 700, letterSpacing: '.06em' }}>{role.label}</span>
                        <span className="font-tech" style={{ fontSize: 12, color: 'var(--text3)', flexShrink: 0, minWidth: 70, textAlign: 'right' }}>
                          {(p.price_lc ?? 0).toLocaleString('pt-BR')} <span style={{ fontSize: 9, color: 'var(--text3)' }}>LC</span>
                        </span>
                      </div>
                    )
                  })
                )}
              </div>
            )
          })}
        </div>
      </div>
    </AppLayout>
  )
}
