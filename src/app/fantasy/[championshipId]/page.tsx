import Link from 'next/link'
import { AppLayout } from '@/components/layout/app-layout'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getEventMeta, getBannerUrl } from '@/lib/events'

const TEAM_LOGOS: Record<string, string> = {
  'Spirit':        '/api/img/lp/thumb/6/66/Team_Spirit_2022_lightmode.png/60px-Team_Spirit_2022_lightmode.png',
  'Vitality':      '/api/img/lp/thumb/e/e4/Team_Vitality_2023_lightmode.png/60px-Team_Vitality_2023_lightmode.png',
  'MOUZ':          '/api/img/lp/thumb/a/a5/MOUZ_2021_full_allmode.png/60px-MOUZ_2021_full_allmode.png',
  'FaZe':          '/api/img/lp/thumb/f/f9/FaZe_Esports_2026_lightmode.png/60px-FaZe_Esports_2026_lightmode.png',
  'FURIA':         '/api/img/lp/thumb/a/aa/FURIA_Esports_allmode.png/60px-FURIA_Esports_allmode.png',
  'Natus Vincere': '/api/img/lp/thumb/3/3f/Natus_Vincere_2021_lightmode.png/60px-Natus_Vincere_2021_lightmode.png',
  'Astralis':      '/api/img/lp/thumb/b/b5/Astralis_2020_full_allmode.png/60px-Astralis_2020_full_allmode.png',
  'G2':            '/api/img/lp/thumb/2/27/G2_Esports_2020_full_lightmode.png/60px-G2_Esports_2020_full_lightmode.png',
  'Team Liquid':   '/api/img/lp/thumb/f/f5/Team_Liquid_2024_full_lightmode.png/60px-Team_Liquid_2024_full_lightmode.png',
  'HEROIC':        '/api/img/lp/thumb/0/0d/HEROIC_2024_allmode.png/60px-HEROIC_2024_allmode.png',
  'The MongolZ':   '/api/img/lp/thumb/2/2b/The_MongolZ_2024_03_allmode.png/60px-The_MongolZ_2024_03_allmode.png',
  'Rare Atom':     '/api/img/lp/thumb/5/5d/Rare_Atom_full_allmode.png/60px-Rare_Atom_full_allmode.png',
}

export default async function ChampionshipDetailPage({
  params,
}: {
  params: Promise<{ championshipId: string }>
}) {
  const { championshipId } = await params
  const supabase = getSupabaseServerClient()

  const { data: championship } = await supabase
    .from('championships')
    .select('*')
    .eq('id', championshipId)
    .single()

  if (!championship) {
    return (
      <AppLayout>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text3)' }}>Campeonato não encontrado.</p>
        </div>
      </AppLayout>
    )
  }

  const meta = getEventMeta(championship.name)
  const bannerUrl = getBannerUrl(championship.name)
  const accent = meta.accentColor

  // Bracket structure by format
  const isSmall = meta.teams <= 8
  const isMedium = meta.teams === 16
  const isLarge = meta.teams >= 32

  return (
    <AppLayout>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 0 40px' }} className="page-animate">

        {/* ── HERO BANNER ── */}
        <div style={{ height: 220, position: 'relative', overflow: 'hidden', background: `linear-gradient(180deg,#01000a,#0d0300 60%,${accent}22)` }}>
          {bannerUrl && (
            <img src={bannerUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%', opacity: .5 }} />
          )}
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, rgba(1,0,10,.2), transparent 40%, rgba(1,0,10,.9) 100%)` }} />
          <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', height: 100, background: `radial-gradient(ellipse 60% 100% at 50% 100%, ${accent}45, transparent)` }} />

          {/* Breadcrumb */}
          <div style={{ position: 'absolute', top: 16, left: 20, display: 'flex', alignItems: 'center', gap: 6, zIndex: 2 }}>
            <Link href="/fantasy" style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', textDecoration: 'none' }}>Campeonatos</Link>
            <span style={{ color: 'rgba(255,255,255,.3)', fontSize: 11 }}>›</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,.8)' }}>{championship.name}</span>
          </div>

          {/* Content */}
          <div style={{ position: 'absolute', bottom: 24, left: 24, right: 24, zIndex: 2 }}>
            <div className="font-condensed" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: `${accent}cc`, marginBottom: 4 }}>
              {meta.org.toUpperCase()} · {meta.flagEmoji} {meta.location}
            </div>
            <h1 className="font-condensed" style={{ fontWeight: 900, fontSize: 'clamp(24px,4vw,42px)', color: '#fff', textTransform: 'uppercase', letterSpacing: '.02em', lineHeight: .95, textShadow: '0 2px 12px rgba(0,0,0,.7)', marginBottom: 10 }}>
              {championship.name}
            </h1>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[
                { icon: '📅', text: meta.dates },
                { icon: '💰', text: meta.prize },
                { icon: '🛡️', text: `${meta.teams} times` },
                { icon: '🎯', text: meta.format.split('·')[0].trim() },
              ].map(pill => (
                <div key={pill.text} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(0,0,0,.5)', border: `1px solid ${accent}30`, borderRadius: 20, padding: '4px 10px', backdropFilter: 'blur(8px)' }}>
                  <span style={{ fontSize: 11 }}>{pill.icon}</span>
                  <span style={{ fontSize: 11, color: '#eee', fontWeight: 600 }}>{pill.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '24px 24px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

          {/* ── TIMES CONVIDADOS ── */}
          <div>
            <p className="font-condensed" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              TIMES CONVIDADOS <span style={{ flex: 1, height: 1, background: 'var(--border)', display: 'block' }} />
            </p>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
              {meta.invitedTeams.map((team, i) => (
                <div key={team} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderBottom: i < meta.invitedTeams.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <span style={{ fontSize: 11, color: 'var(--text3)', width: 18, textAlign: 'center' }}>{i + 1}</span>
                  <div style={{ width: 28, height: 28, borderRadius: 5, background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                    {TEAM_LOGOS[team] ? (
                      <img src={TEAM_LOGOS[team]} alt={team} width={22} height={22} style={{ objectFit: 'contain' }} />
                    ) : (
                      <span style={{ fontSize: 8, fontWeight: 900, color: 'var(--text3)' }}>{team.slice(0,2).toUpperCase()}</span>
                    )}
                  </div>
                  <span className="font-condensed" style={{ fontWeight: 800, fontSize: 14, color: 'var(--white)', letterSpacing: '.03em' }}>{team}</span>
                  {i < 4 && <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 700, background: `${accent}15`, color: accent, border: `1px solid ${accent}30`, borderRadius: 4, padding: '1px 6px', letterSpacing: '.06em' }}>SEED {i + 1}</span>}
                </div>
              ))}
              {meta.teams > meta.invitedTeams.length && (
                <div style={{ padding: '10px 14px', textAlign: 'center', fontSize: 11, color: 'var(--text3)', borderTop: '1px solid var(--border)' }}>
                  + {meta.teams - meta.invitedTeams.length} times via qualificatória
                </div>
              )}
            </div>
          </div>

          {/* ── CHAVEAMENTO ── */}
          <div>
            <p className="font-condensed" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              FORMATO & CHAVEAMENTO <span style={{ flex: 1, height: 1, background: 'var(--border)', display: 'block' }} />
            </p>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px', marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 14 }}>
                <strong style={{ color: 'var(--white)' }}>Formato:</strong> {meta.format}
              </div>

              {/* Visual bracket */}
              {isSmall && (
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 10 }}>Chaveamento — {meta.teams} times</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {/* QF */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 5, padding: '5px 8px', fontSize: 10, color: 'var(--text3)' }}>
                          {meta.invitedTeams[i * 2] ?? 'TBD'} <span style={{ color: 'var(--text3)' }}>vs</span> {meta.invitedTeams[i * 2 + 1] ?? 'TBD'}
                        </div>
                      ))}
                      <div style={{ fontSize: 9, textAlign: 'center', color: 'var(--text3)', marginTop: 2 }}>Quartas</div>
                    </div>
                    <div style={{ color: 'var(--text3)', fontSize: 16 }}>›</div>
                    {/* SF */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center' }}>
                      {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} style={{ background: 'var(--bg3)', border: `1px solid ${accent}25`, borderRadius: 5, padding: '5px 8px', fontSize: 10, color: 'var(--text2)' }}>
                          TBD vs TBD
                        </div>
                      ))}
                      <div style={{ fontSize: 9, textAlign: 'center', color: 'var(--text3)' }}>Semis</div>
                    </div>
                    <div style={{ color: 'var(--text3)', fontSize: 16 }}>›</div>
                    {/* Final */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, justifyContent: 'center' }}>
                      <div style={{ background: `${accent}15`, border: `1px solid ${accent}40`, borderRadius: 5, padding: '8px', fontSize: 10, color: accent, textAlign: 'center', fontWeight: 700 }}>
                        🏆 FINAL
                      </div>
                      <div style={{ fontSize: 9, textAlign: 'center', color: 'var(--text3)' }}>Grand Final</div>
                    </div>
                  </div>
                </div>
              )}

              {(isMedium || isLarge) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 4 }}>Fases</div>
                  {[
                    { phase: isLarge ? `Fase 1 — Swiss Online (${meta.teams} times)` : `Fase de Grupos — Swiss (${meta.teams} times)`, desc: 'Todos jogam entre si · Best of 3', color: 'var(--text2)' },
                    { phase: 'Playoffs (Top 8)', desc: 'Bracket eliminatório · Best of 3', color: 'var(--cyan)' },
                    { phase: 'Grand Final', desc: 'Best of 5 · Ao vivo', color: accent },
                  ].map(p => (
                    <div key={p.phase} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'var(--bg3)', border: `1px solid var(--border)`, borderLeft: `3px solid ${p.color}`, borderRadius: '0 6px 6px 0' }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: p.color }}>{p.phase}</div>
                        <div style={{ fontSize: 10, color: 'var(--text3)' }}>{p.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: 10 }}>
              <Link href={`/fantasy/${championshipId}/mercado`} style={{
                flex: 1, textAlign: 'center', padding: '12px',
                background: `linear-gradient(90deg, ${accent}, ${accent}bb)`,
                color: '#000', fontFamily: 'inherit', fontWeight: 900, fontSize: 13,
                letterSpacing: '.06em', textTransform: 'uppercase', textDecoration: 'none',
                borderRadius: 10, boxShadow: `0 0 20px ${accent}30`,
              }}>
                ⚡ Montar Lineup
              </Link>
              <Link href={`/fantasy/${championshipId}/ranking`} style={{
                padding: '12px 20px', background: 'var(--bg3)', color: 'var(--text2)',
                fontFamily: 'inherit', fontWeight: 600, fontSize: 13, textDecoration: 'none',
                borderRadius: 10, border: '1px solid var(--border)',
              }}>
                Ranking
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
