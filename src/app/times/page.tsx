import { AppLayout } from '@/components/layout/app-layout'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import Image from 'next/image'

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

  const ROLE_COLORS: Record<string, { bg: string; color: string; label: string }> = {
    awper:   { bg: 'rgba(245,158,11,.12)', color: '#f59e0b', label: 'AWP' },
    igl:     { bg: 'rgba(139,92,246,.12)', color: '#8b5cf6', label: 'IGL' },
    entry:   { bg: 'rgba(239,68,68,.12)',  color: '#ef4444', label: 'ENT' },
    support: { bg: 'rgba(30,127,255,.12)', color: '#1e7fff', label: 'SUP' },
    rifler:  { bg: 'rgba(255,255,255,.06)', color: '#5a6e90', label: 'RIF' },
  }

  return (
    <AppLayout>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 20px' }} className="page-animate">
        <div style={{ marginBottom: 24 }}>
          <h1 className="font-condensed" style={{ fontWeight: 900, fontSize: 26, color: 'var(--white)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 3 }}>
            Times Oficiais
          </h1>
          <p style={{ color: 'var(--text3)', fontSize: 13 }}>
            {teams?.length ?? 0} times · BLAST Bounty 2026 Season 2
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
          {(teams ?? []).map(team => {
            const roster = playersByTeam[team.id] ?? []
            const logoUrl = team.hltv_id ? `/api/img/team/${team.hltv_id}` : null

            return (
              <div key={team.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,.01)' }}>
                  <div style={{ width: 36, height: 36, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {logoUrl ? (
                      <Image src={logoUrl} alt={team.name} width={36} height={36} style={{ objectFit: 'contain' }} unoptimized />
                    ) : (
                      <div style={{ width: 36, height: 36, borderRadius: 6, background: 'var(--bg3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: 'var(--text3)' }}>
                        {team.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <span className="font-condensed" style={{ fontWeight: 900, fontSize: 16, color: 'var(--white)', letterSpacing: '.04em' }}>{team.name}</span>
                    <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 1 }}>{team.country}</div>
                  </div>
                  <span style={{ fontSize: 10, color: 'var(--text3)' }}>{roster.length} jogadores</span>
                </div>

                {/* Roster */}
                {roster.length === 0 ? (
                  <div style={{ padding: '16px', textAlign: 'center', fontSize: 12, color: 'var(--text3)' }}>Sem jogadores</div>
                ) : (
                  roster.map((p, i) => {
                    const role = ROLE_COLORS[p.role ?? ''] ?? ROLE_COLORS.rifler
                    return (
                      <div key={p.id} style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px',
                        borderBottom: i < roster.length - 1 ? '1px solid var(--border)' : 'none',
                      }}>
                        <div style={{ width: 28, height: 28, borderRadius: 5, flexShrink: 0, background: `${role.color}18`, border: `1px solid ${role.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, color: role.color }}>
                          {p.nickname.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-condensed" style={{ flex: 1, fontWeight: 800, fontSize: 14, color: 'var(--white)', letterSpacing: '.03em' }}>{p.nickname}</span>
                        <span style={{ background: role.bg, color: role.color, border: `1px solid ${role.color}40`, borderRadius: 4, padding: '1px 6px', fontSize: 9, fontWeight: 700, letterSpacing: '.06em' }}>{role.label}</span>
                        <span className="font-tech" style={{ fontSize: 12, color: 'var(--text3)', flexShrink: 0 }}>
                          {(p.price_lc ?? 0).toLocaleString('pt-BR')} LC
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
