import { AppLayout } from '@/components/layout/app-layout'
import { getSupabaseServerClient } from '@/lib/supabase/server'

const ROLE_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  awper:   { bg: 'rgba(245,158,11,.12)', color: '#f59e0b', label: 'AWP' },
  igl:     { bg: 'rgba(139,92,246,.12)', color: '#8b5cf6', label: 'IGL' },
  entry:   { bg: 'rgba(239,68,68,.12)',  color: '#ef4444', label: 'ENT' },
  support: { bg: 'rgba(30,127,255,.12)', color: '#1e7fff', label: 'SUP' },
  rifler:  { bg: 'rgba(255,255,255,.06)', color: '#5a6e90', label: 'RIF' },
}

export default async function JogadoresPage() {
  const supabase = getSupabaseServerClient()

  // Try to get stats; fallback to price ranking if no stats yet
  const { data: stats } = await supabase
    .from('player_round_stats')
    .select('player_id, points')

  const { data: players } = await supabase
    .from('players')
    .select('id, nickname, role, team_id, price_lc, hltv_id')
    .order('price_lc', { ascending: false })

  const { data: teams } = await supabase
    .from('teams')
    .select('id, name')

  const teamsById = Object.fromEntries((teams ?? []).map(t => [t.id, t]))

  // Aggregate total points per player
  const pointsMap: Record<string, number> = {}
  ;(stats ?? []).forEach(s => {
    pointsMap[s.player_id] = (pointsMap[s.player_id] ?? 0) + (s.points ?? 0)
  })

  const hasStats = Object.keys(pointsMap).length > 0

  const ranked = (players ?? [])
    .map(p => ({
      ...p,
      total_points: pointsMap[p.id] ?? 0,
      team: teamsById[p.team_id ?? ''] ?? null,
    }))
    .sort((a, b) => hasStats ? b.total_points - a.total_points : b.price_lc - a.price_lc)

  return (
    <AppLayout>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px' }} className="page-animate">
        <div style={{ marginBottom: 24 }}>
          <h1 className="font-condensed" style={{ fontWeight: 900, fontSize: 26, color: 'var(--white)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 3 }}>
            Ranking de Jogadores
          </h1>
          <p style={{ color: 'var(--text3)', fontSize: 13 }}>
            {hasStats ? 'Ordenado por pontuação total acumulada' : 'Ordenado por valor de mercado — pontuação disponível após a rodada 1'}
          </p>
        </div>

        {/* Stat cards */}
        {hasStats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, marginBottom: 20 }}>
            {ranked.slice(0, 3).map((p, i) => {
              const medals = ['🥇', '🥈', '🥉']
              const role = ROLE_COLORS[p.role ?? ''] ?? ROLE_COLORS.rifler
              return (
                <div key={p.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: role.color }} />
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{medals[i]}</div>
                  <div className="font-condensed" style={{ fontWeight: 900, fontSize: 18, color: 'var(--white)', marginBottom: 2 }}>{p.nickname}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{p.team?.name ?? '—'}</div>
                  <div className="font-tech" style={{ fontSize: 20, fontWeight: 700, color: role.color, marginTop: 8 }}>{p.total_points.toFixed(1)} pts</div>
                </div>
              )
            })}
          </div>
        )}

        {/* Full table */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 120px 80px 80px', gap: 8, padding: '8px 16px', borderBottom: '1px solid var(--border)' }}>
            {['#', 'Jogador', 'Time', hasStats ? 'Pontos' : 'Valor LC', 'Role'].map((h, i) => (
              <span key={i} style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text3)', textAlign: i >= 3 ? 'right' : 'left' }}>{h}</span>
            ))}
          </div>

          {ranked.map((p, i) => {
            const role = ROLE_COLORS[p.role ?? ''] ?? ROLE_COLORS.rifler
            const isTop3 = i < 3
            return (
              <div key={p.id} style={{
                display: 'grid', gridTemplateColumns: '40px 1fr 120px 80px 80px', gap: 8,
                padding: '10px 16px', alignItems: 'center',
                borderBottom: i < ranked.length - 1 ? '1px solid var(--border)' : 'none',
                background: isTop3 ? `${role.color}08` : 'transparent',
                borderLeft: isTop3 ? `2px solid ${role.color}60` : '2px solid transparent',
              }}>
                <span className="font-tech" style={{ fontSize: 13, color: i < 3 ? role.color : 'var(--text3)', fontWeight: i < 3 ? 700 : 400 }}>
                  {i < 3 ? ['🥇','🥈','🥉'][i] : i + 1}
                </span>
                <span className="font-condensed" style={{ fontWeight: 800, fontSize: 15, color: 'var(--white)', letterSpacing: '.03em' }}>{p.nickname}</span>
                <span style={{ fontSize: 12, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.team?.name ?? '—'}</span>
                <span className="font-tech" style={{ fontSize: 13, fontWeight: 700, color: hasStats ? role.color : 'var(--white)', textAlign: 'right' }}>
                  {hasStats ? `${p.total_points.toFixed(1)}` : `${p.price_lc.toLocaleString('pt-BR')}`}
                </span>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <span style={{ background: role.bg, color: role.color, border: `1px solid ${role.color}40`, borderRadius: 4, padding: '2px 6px', fontSize: 9, fontWeight: 700, letterSpacing: '.06em' }}>{role.label}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </AppLayout>
  )
}
