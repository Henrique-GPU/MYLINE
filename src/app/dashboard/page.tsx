import Link from 'next/link'
import { AppLayout } from '@/components/layout/app-layout'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getEventMeta } from '@/lib/events'

export default async function DashboardPage() {
  const supabase = getSupabaseServerClient()

  const [
    { data: championships },
    { data: topPlayers },
    { count: teamsCount },
    { count: playersCount },
  ] = await Promise.all([
    supabase.from('championships').select('id, name, status, initial_lc').order('created_at', { ascending: false }).limit(3),
    supabase.from('players').select('id, nickname, role, price_lc, team_id').order('price_lc', { ascending: false }).limit(5),
    supabase.from('teams').select('*', { count: 'exact', head: true }),
    supabase.from('players').select('*', { count: 'exact', head: true }),
  ])

  const { data: teamRows } = await supabase.from('teams').select('id, name')
  const teamsById = Object.fromEntries((teamRows ?? []).map(t => [t.id, t]))

  const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
    active:   { label: 'AO VIVO',  cls: 's-live' },
    upcoming: { label: 'EM BREVE', cls: 's-soon' },
    finished: { label: 'ENCERRADO', cls: 's-done' },
  }

  const ROLE_COLORS: Record<string, string> = { awper: '#f59e0b', igl: '#8b5cf6', entry: '#ef4444', support: '#1e7fff', rifler: '#5a6e90' }

  return (
    <AppLayout>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 20px' }} className="page-animate">

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 className="font-condensed" style={{ fontWeight: 900, fontSize: 26, color: 'var(--white)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 3 }}>
            Arena
          </h1>
          <p style={{ color: 'var(--text3)', fontSize: 13 }}>Bem-vindo ao MyLine CS2 — central de operações</p>
        </div>

        {/* Quick stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, marginBottom: 24 }}>
          {[
            { label: 'Times', value: `${teamsCount ?? 32}`, sub: 'no BLAST S2', color: 'linear-gradient(90deg,var(--green),var(--cyan))', icon: '🛡️' },
            { label: 'Jogadores', value: `${playersCount ?? 160}`, sub: 'disponíveis', color: 'var(--cyan)', icon: '👤' },
            { label: 'Orçamento', value: '100K', sub: 'Line Coins', color: 'var(--yellow)', icon: '💰' },
            { label: 'Campeonatos', value: `${championships?.length ?? 0}`, sub: 'ativos', color: 'var(--orange)', icon: '🏆' },
          ].map(card => (
            <div key={card.label} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: card.color }} />
              <div style={{ fontSize: 18, marginBottom: 4 }}>{card.icon}</div>
              <div className="font-condensed font-tech" style={{ fontWeight: 900, fontSize: 24, color: 'var(--white)', marginBottom: 2 }}>{card.value}</div>
              <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.08em' }}>{card.label}</div>
              <div style={{ fontSize: 10, color: 'var(--text3)' }}>{card.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>

          {/* Championships */}
          <div>
            <p className="font-condensed" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              CAMPEONATOS <span style={{ flex: 1, height: 1, background: 'var(--border)', display: 'block' }} />
              <Link href="/fantasy" style={{ fontSize: 10, color: 'var(--green)', textDecoration: 'none', fontWeight: 700 }}>Ver todos →</Link>
            </p>

            {(championships ?? []).length === 0 ? (
              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '32px', textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>🏆</div>
                <p style={{ fontSize: 13, color: 'var(--text3)' }}>Nenhum campeonato disponível.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(championships ?? []).map(c => {
                  const s = STATUS_LABEL[c.status] ?? STATUS_LABEL.finished
                  const meta = getEventMeta(c.name)
                  const accent = meta.accentColor
                  const isBlast = c.name.toLowerCase().includes('blast')
                  return (
                    <div key={c.id} style={{ background: 'var(--bg2)', border: `1px solid ${accent}20`, borderRadius: 12, overflow: 'hidden', transition: 'all .2s' }}
                      className="hover-card">
                      {/* Top accent line */}
                      <div style={{ height: 2, background: `linear-gradient(90deg, ${accent}, ${accent}44)` }} />
                      {/* Banner */}
                      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, position: 'relative', overflow: 'hidden' }}>
                        {/* Background glow */}
                        <div style={{ position: 'absolute', right: -20, top: '50%', transform: 'translateY(-50%)', width: 120, height: 80, background: `radial-gradient(ellipse, ${accent}18, transparent 70%)`, pointerEvents: 'none' }} />
                        {/* MyLine logo mark */}
                        <div style={{ width: 40, height: 40, borderRadius: 8, background: `${accent}15`, border: `1px solid ${accent}35`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {isBlast ? (
                            <span style={{ fontSize: 18 }}>🏆</span>
                          ) : (
                            <>
                              <span className="font-condensed text-gradient-green" style={{ fontWeight: 900, fontSize: 10, letterSpacing: '.04em', lineHeight: 1 }}>ML</span>
                              <span style={{ fontSize: 7, color: 'var(--text3)', letterSpacing: '.1em' }}>CS2</span>
                            </>
                          )}
                        </div>
                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="font-condensed" style={{ fontWeight: 900, fontSize: 14, color: 'var(--white)', letterSpacing: '.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 10, color: 'var(--text3)' }}>{meta.flagEmoji} {meta.location} · {meta.dates}</span>
                            <span className="font-tech" style={{ fontSize: 10, color: meta.prize !== '—' ? 'var(--gold)' : 'var(--text3)', fontWeight: 700 }}>{meta.prize}</span>
                          </div>
                        </div>
                        <span className={s.cls} style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.07em', padding: '3px 8px', borderRadius: 20, flexShrink: 0 }}>
                          {s.label}
                        </span>
                      </div>
                      {/* Actions */}
                      <div style={{ padding: '0 12px 12px', display: 'flex', gap: 8 }}>
                        <Link href={`/fantasy/${c.id}/mercado`} style={{
                          flex: 1, textAlign: 'center', padding: '8px',
                          background: `linear-gradient(90deg, ${accent}, ${accent}aa)`,
                          color: '#000', fontWeight: 900, fontSize: 11, borderRadius: 7,
                          textDecoration: 'none', fontFamily: 'inherit', letterSpacing: '.06em', textTransform: 'uppercase',
                        }}>
                          ⚡ Montar Lineup
                        </Link>
                        <Link href={`/fantasy/${c.id}/ranking`} style={{
                          padding: '8px 14px', background: 'var(--bg3)', color: 'var(--text2)',
                          fontWeight: 600, fontSize: 11, borderRadius: 7, textDecoration: 'none',
                          fontFamily: 'inherit', border: '1px solid var(--border)', whiteSpace: 'nowrap',
                        }}>
                          Ranking
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Community */}
            <div style={{ marginTop: 16 }}>
              <p className="font-condensed" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                COMUNIDADE <span style={{ flex: 1, height: 1, background: 'var(--border)', display: 'block' }} />
              </p>
              <div className="hover-card hover-card-orange" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ height: 3, background: 'linear-gradient(90deg,var(--orange),var(--gold))' }} />
                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <span style={{ fontSize: 28 }}>🎮</span>
                    <div>
                      <div className="font-condensed" style={{ fontWeight: 900, fontSize: 16, color: 'var(--white)', textTransform: 'uppercase' }}>Campeonatos Amadores</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>Crie ou participe de torneios da comunidade</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link href="/comunidade/criar" style={{ flex: 1, textAlign: 'center', padding: '8px', background: 'linear-gradient(90deg,var(--orange),var(--gold))', color: '#000', fontWeight: 900, fontSize: 12, borderRadius: 7, textDecoration: 'none', fontFamily: 'inherit', letterSpacing: '.04em', textTransform: 'uppercase' }}>
                      Criar torneio
                    </Link>
                    <Link href="/comunidade" style={{ flex: 1, textAlign: 'center', padding: '8px', background: 'var(--bg3)', color: 'var(--text2)', fontWeight: 600, fontSize: 12, borderRadius: 7, textDecoration: 'none', fontFamily: 'inherit', border: '1px solid var(--border)' }}>
                      Ver torneios
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar: Top Players */}
          <div>
            <p className="font-condensed" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              TOP PICKS <span style={{ flex: 1, height: 1, background: 'var(--border)', display: 'block' }} />
            </p>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
              {(topPlayers ?? []).map((p, i) => {
                const team = teamsById[p.team_id ?? '']
                const color = ROLE_COLORS[p.role ?? ''] ?? '#5a6e90'
                const ROLE_LABEL: Record<string, string> = { awper: 'AWP', igl: 'IGL', entry: 'ENT', support: 'SUP', rifler: 'RIF' }
                return (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderBottom: i < (topPlayers?.length ?? 0) - 1 ? '1px solid var(--border)' : 'none' }}>
                    <span className="font-tech" style={{ fontSize: 11, color: 'var(--text3)', width: 18, textAlign: 'center', flexShrink: 0 }}>{i + 1}</span>
                    <div style={{ width: 30, height: 30, borderRadius: 6, flexShrink: 0, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, color, fontFamily: 'var(--font-condensed)' }}>
                      {p.nickname.slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="font-condensed" style={{ fontWeight: 800, fontSize: 14, color: 'var(--white)', letterSpacing: '.03em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.nickname}</div>
                      <div style={{ fontSize: 10, color: 'var(--text3)' }}>{team?.name ?? '—'}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
                      <span className="font-tech" style={{ fontSize: 12, fontWeight: 700, color }}>{(p.price_lc ?? 0).toLocaleString('pt-BR')}</span>
                      <span style={{ background: `${color}15`, color, border: `1px solid ${color}30`, borderRadius: 4, padding: '1px 5px', fontSize: 8, fontWeight: 700, letterSpacing: '.06em' }}>
                        {ROLE_LABEL[p.role ?? ''] ?? 'RIF'}
                      </span>
                    </div>
                  </div>
                )
              })}
              <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)' }}>
                <Link href="/jogadores" style={{ fontSize: 12, color: 'var(--green)', textDecoration: 'none', fontWeight: 700, display: 'flex', justifyContent: 'center' }}>
                  Ver ranking completo →
                </Link>
              </div>
            </div>

            {/* Quick links */}
            <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { href: '/times', icon: '🛡️', label: 'Times' },
                { href: '/jogadores', icon: '👤', label: 'Jogadores' },
                { href: '/perfil', icon: '⭐', label: 'Perfil' },
                { href: '/comunidade', icon: '🎮', label: 'Comunidade' },
              ].map(link => (
                <Link key={link.href} href={link.href} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px', textAlign: 'center', textDecoration: 'none', color: 'var(--text2)', fontSize: 12, fontWeight: 600, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 18 }}>{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
