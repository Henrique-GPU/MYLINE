import Link from 'next/link'
import { AppLayout } from '@/components/layout/app-layout'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getEventMeta, getBannerUrl } from '@/lib/events'
import { MinhaLineup } from '@/components/arena/minha-lineup'
import { ProximaRodada } from '@/components/arena/proxima-rodada'

// ── Notícias (Nível 3 — abaixo do fold) ──
const NOTICIAS = [
  { icon: '🏆', title: 'donk é eleito MVP do BLAST Bounty S1', time: '2h', hot: true },
  { icon: '🔥', title: 'Vitality vence Spirit em thriller BO3',  time: '4h', hot: true },
  { icon: '📊', title: 'ZywOo mantém 8 MVPs consecutivos',       time: '6h', hot: false },
  { icon: '🎯', title: 'FURIA confirma lineup para o BLAST S2',  time: '8h', hot: false },
]

export default async function ArenaPage() {
  const supabase = getSupabaseServerClient()

  const [
    { data: championships },
    { count: lineupsCount },
    { data: champsWithMarket },
  ] = await Promise.all([
    supabase.from('championships')
      .select('id, name, status, initial_lc')
      .order('created_at', { ascending: true })
      .limit(6),
    supabase.from('lineups').select('*', { count: 'exact', head: true }),
    // Campeonatos que têm mercado configurado (player_prices)
    supabase.from('player_prices')
      .select('championship_id')
      .limit(100),
  ])

  const champIdsWithMarket = new Set((champsWithMarket ?? []).map(p => p.championship_id))

  const activeChamp = (championships ?? []).find(c => c.status === 'active')
    ?? (championships ?? []).find(c => c.status === 'upcoming')
    ?? championships?.[0]

  const roundId = 'b0000000-0000-0000-0000-000000000001'
  const meta = activeChamp ? getEventMeta(activeChamp.name) : null
  const bannerUrl = activeChamp ? getBannerUrl(activeChamp.name) : null
  const accent = meta?.accentColor ?? '#00f075'

  const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
    active:   { label: 'AO VIVO',   cls: 's-live' },
    upcoming: { label: 'EM BREVE',  cls: 's-soon' },
    finished: { label: 'ENCERRADO', cls: 's-done' },
  }

  return (
    <AppLayout>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px 40px' }} className="page-animate">

        {/* ══════════════════════════════════════════
            NÍVEL 1 — MINHA LINEUP + MERCADO FECHA EM
            "Tenho um time." / "Preciso ajustar minha lineup."
        ══════════════════════════════════════════ */}
        {/* ── MINHAS LINEUPS — uma por campeonato ativo/em breve ── */}
        {(championships ?? []).filter(c => (c.status === 'active' || c.status === 'upcoming') && champIdsWithMarket.has(c.id)).length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <p className="font-condensed" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              ⭐ MINHAS LINEUPS
              <span style={{ flex: 1, height: 1, background: 'var(--border)', display: 'block' }} />
              <Link href="/fantasy" style={{ fontSize: 10, color: 'var(--green)', textDecoration: 'none', fontWeight: 700 }}>Ver campeonatos →</Link>
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: 14 }}>
              {(championships ?? [])
                .filter(c => (c.status === 'active' || c.status === 'upcoming') && champIdsWithMarket.has(c.id))
                .map(champ => {
                  const champMeta = getEventMeta(champ.name)
                  const roundMap: Record<string, string> = {
                    'a0000000-0000-0000-0000-000000000001': 'b0000000-0000-0000-0000-000000000001',
                    'a0000000-0000-0000-0000-000000000002': 'b0000002-0000-0000-0000-000000000001',
                    'a0000000-0000-0000-0000-000000000003': 'b0000003-0000-0000-0000-000000000001',
                    'a0000000-0000-0000-0000-000000000004': 'b0000004-0000-0000-0000-000000000001',
                    'a0000000-0000-0000-0000-000000000005': 'b0000005-0000-0000-0000-000000000001',
                    'a0000000-0000-0000-0000-000000000006': 'b0000006-0000-0000-0000-000000000001',
                    'a0000000-0000-0000-0000-000000000007': 'b0000007-0000-0000-0000-000000000001',
                  }
                  return (
                    <MinhaLineup
                      key={champ.id}
                      championshipId={champ.id}
                      roundId={roundMap[champ.id] ?? 'b0000000-0000-0000-0000-000000000001'}
                      mercadoHref={`/fantasy/${champ.id}/mercado`}
                      championshipName={champ.name}
                      accentColor={champMeta.accentColor}
                    />
                  )
                })}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            NÍVEL 1 — CAMPEONATO PRINCIPAL
            Hero card com banner real
        ══════════════════════════════════════════ */}
        {activeChamp && meta && (
          <div style={{
            background: 'var(--bg2)', border: `1px solid ${accent}25`,
            borderRadius: 16, overflow: 'hidden', marginBottom: 20,
            boxShadow: `0 4px 32px ${accent}10`,
          }}>
            {/* Banner */}
            <div style={{ height: 160, position: 'relative', overflow: 'hidden', background: `linear-gradient(180deg,#01000a,#100300 60%,${accent}20)` }}>
              {bannerUrl && <img src={bannerUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%', opacity: .5 }} />}
              <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, rgba(1,0,10,.1), transparent 40%, rgba(1,0,10,.9) 100%)` }} />
              <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', height: 80, background: `radial-gradient(ellipse 70% 100% at 50% 100%, ${accent}45, transparent)` }} />

              <div style={{ position: 'absolute', top: 14, left: 16, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 20, padding: '4px 12px' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--red)', display: 'inline-block', animation: 'blink .9s ease-in-out infinite' }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--red)', letterSpacing: '.1em', textTransform: 'uppercase' }}>🔥 EM DESTAQUE</span>
              </div>

              <div style={{ position: 'absolute', top: 14, right: 16, background: 'rgba(255,200,50,.1)', border: '1px solid rgba(255,200,50,.25)', borderRadius: 20, padding: '4px 12px', display: 'flex', gap: 5, alignItems: 'center' }}>
                <span style={{ fontSize: 12 }}>💰</span>
                <span className="font-tech" style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold)' }}>{meta.prize}</span>
              </div>

              <div style={{ position: 'absolute', bottom: 16, left: 20, right: 20, zIndex: 2 }}>
                <div className="font-condensed" style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: `${accent}bb`, marginBottom: 3 }}>{meta.org}</div>
                <h2 className="font-condensed" style={{ fontWeight: 900, fontSize: 28, color: '#fff', textTransform: 'uppercase', letterSpacing: '.02em', lineHeight: .9, textShadow: '0 2px 10px rgba(0,0,0,.8)' }}>
                  {activeChamp.name.replace('2026','').replace('Season','S').trim()}
                </h2>
              </div>
            </div>

            {/* Quick stats + CTA */}
            <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: 14, flex: 1, flexWrap: 'wrap' }}>
                {[
                  { icon: meta.flagEmoji, label: `${meta.location} · ${meta.dates}` },
                  { icon: '🛡️', label: `${meta.teams} times` },
                  { icon: '💎', label: `${(activeChamp.initial_lc ?? 100000).toLocaleString('pt-BR')} LC` },
                ].map(s => (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text2)', fontWeight: 600 }}>
                    <span>{s.icon}</span>{s.label}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <Link href={`/fantasy/${activeChamp.id}/mercado`} style={{
                  padding: '10px 20px', background: `linear-gradient(90deg,${accent},${accent}cc)`,
                  color: '#000', fontFamily: 'inherit', fontWeight: 900, fontSize: 13,
                  letterSpacing: '.06em', textTransform: 'uppercase', textDecoration: 'none',
                  borderRadius: 10, boxShadow: `0 0 18px ${accent}30`,
                }}>
                  ⚡ Montar Lineup
                </Link>
                <Link href={`/fantasy/${activeChamp.id}`} style={{
                  padding: '10px 16px', background: 'var(--bg3)', color: 'var(--text2)',
                  fontFamily: 'inherit', fontWeight: 600, fontSize: 12, textDecoration: 'none',
                  borderRadius: 10, border: '1px solid var(--border)',
                }}>
                  Ver evento
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            NÍVEL 2 — LIGAS + RANKING
            "Preciso passar meus amigos." / "Preciso subir no ranking."
        ══════════════════════════════════════════ */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>

          {/* Minhas Ligas */}
          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(139,92,246,.2)', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ height: 2, background: 'linear-gradient(90deg,var(--purple),var(--blue))' }} />
            <div style={{ padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span className="font-condensed" style={{ fontWeight: 900, fontSize: 14, color: 'var(--white)', textTransform: 'uppercase' }}>🏅 Minhas Ligas</span>
                <Link href="/ligas" style={{ fontSize: 10, color: 'var(--purple)', textDecoration: 'none', fontWeight: 700 }}>Ver todas →</Link>
              </div>
              {[
                { name: 'Amigos do CS',    pos: 3,  n: 18, delta: '▲1' },
                { name: 'Empresa XPTO',    pos: 1,  n: 27, delta: '—'  },
                { name: 'Arena dos Pratas', pos: 5,  n: 41, delta: '▼2' },
              ].map(liga => (
                <Link key={liga.name} href="/ligas" style={{ textDecoration: 'none', display: 'block', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: liga.pos === 1 ? 'rgba(255,200,50,.05)' : 'var(--bg3)', border: `1px solid ${liga.pos === 1 ? 'rgba(255,200,50,.2)' : 'var(--border)'}`, borderRadius: 9 }}>
                    <span style={{ fontSize: 16 }}>{liga.pos === 1 ? '🥇' : liga.pos <= 3 ? '🥈' : '🏅'}</span>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--white)' }}>{liga.name}</span>
                    <span style={{ fontSize: 10, color: liga.delta.startsWith('▲') ? 'var(--green)' : liga.delta.startsWith('▼') ? 'var(--red)' : 'var(--text3)', fontWeight: 700 }}>{liga.delta}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: liga.pos === 1 ? 'var(--gold)' : 'var(--text2)' }}>#{liga.pos}</span>
                    <span style={{ fontSize: 10, color: 'var(--text3)' }}>{liga.n}</span>
                  </div>
                </Link>
              ))}
              <Link href="/ligas/criar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8, padding: '9px', background: 'rgba(139,92,246,.08)', border: '1px solid rgba(139,92,246,.2)', borderRadius: 9, fontSize: 12, fontWeight: 700, color: 'var(--purple)', textDecoration: 'none' }}>
                ➕ Criar Liga
              </Link>
            </div>
          </div>

          {/* Ranking & Patrimônio */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Ranking posição */}
            {activeChamp && (
              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span className="font-condensed" style={{ fontWeight: 900, fontSize: 14, color: 'var(--white)', textTransform: 'uppercase' }}>📊 Meu Ranking</span>
                  <Link href={`/fantasy/${activeChamp.id}/ranking`} style={{ fontSize: 10, color: 'var(--cyan)', textDecoration: 'none', fontWeight: 700 }}>Ver completo →</Link>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  {[
                    { label: 'Posição',   value: '#—',    color: 'var(--text3)', icon: '🏆' },
                    { label: 'Pontos',    value: '0',     color: 'var(--cyan)',   icon: '⭐' },
                    { label: 'Projeção',  value: '~0',    color: 'var(--text2)',  icon: '📈' },
                  ].map(s => (
                    <div key={s.label} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px', textAlign: 'center' }}>
                      <div style={{ fontSize: 16, marginBottom: 4 }}>{s.icon}</div>
                      <div className="font-tech" style={{ fontSize: 18, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                      <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.07em', marginTop: 3 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 10, padding: '8px 10px', background: 'rgba(0,212,255,.05)', border: '1px solid rgba(0,212,255,.15)', borderRadius: 8, fontSize: 11, color: 'var(--text3)', textAlign: 'center' }}>
                  Monte sua lineup para aparecer no ranking
                </div>
              </div>
            )}

            {/* Patrimônio LC */}
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,200,50,.2)', borderRadius: 14, padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span className="font-condensed" style={{ fontWeight: 900, fontSize: 14, color: 'var(--gold)', textTransform: 'uppercase' }}>💎 Patrimônio</span>
                <Link href="/perfil" style={{ fontSize: 10, color: 'var(--gold)', textDecoration: 'none', fontWeight: 700 }}>Ver perfil →</Link>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                {[
                  { label: 'Line Coins', value: '100.000', color: 'var(--green)' },
                  { label: 'Val. Equipe', value: '~0', color: 'var(--cyan)' },
                ].map(s => (
                  <div key={s.label} style={{ flex: 1, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                    <div className="font-tech" style={{ fontSize: 15, fontWeight: 700, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.07em', marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            NÍVEL 2 — PRÓXIMOS CAMPEONATOS
            Agenda compacta — só o essencial
        ══════════════════════════════════════════ */}
        {(championships ?? []).length > 1 && (
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', marginBottom: 20 }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="font-condensed" style={{ fontWeight: 700, fontSize: 12, color: 'var(--text3)', letterSpacing: '.14em', textTransform: 'uppercase' }}>📅 Próximos Eventos</span>
              <Link href="/fantasy" style={{ fontSize: 10, color: 'var(--green)', textDecoration: 'none', fontWeight: 700 }}>Ver todos →</Link>
            </div>
            {(championships ?? []).slice(0, 4).map((c, i) => {
              const m = getEventMeta(c.name)
              const s = STATUS_LABEL[c.status] ?? STATUS_LABEL.finished
              return (
                <Link key={c.id} href={`/fantasy/${c.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: i < Math.min((championships ?? []).length, 4) - 1 ? '1px solid var(--border)' : 'none', borderLeft: `3px solid ${m.accentColor}` }}>
                    <div style={{ width: 36, flexShrink: 0, textAlign: 'center' }}>
                      <div className="font-condensed" style={{ fontWeight: 900, fontSize: 16, color: m.accentColor, lineHeight: 1 }}>{m.startDate.split('-')[2]}</div>
                      <div style={{ fontSize: 8, color: 'var(--text3)', fontWeight: 600, letterSpacing: '.06em' }}>
                        {['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'][parseInt(m.startDate.split('-')[1]) - 1]}
                      </div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="font-condensed" style={{ fontWeight: 800, fontSize: 14, color: 'var(--white)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.name.replace('2026','').replace('Season','S').trim()}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text3)' }}>{m.flagEmoji} {m.location} · <span className="font-tech" style={{ color: 'var(--gold)' }}>{m.prize}</span></div>
                    </div>
                    <span className={s.cls} style={{ fontSize: 8, fontWeight: 700, padding: '2px 7px', borderRadius: 20, flexShrink: 0 }}>{s.label}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* ══════════════════════════════════════════
            NÍVEL 3 — NOTÍCIAS (abaixo do fold)
            Mantém o usuário no app
        ══════════════════════════════════════════ */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {/* Notícias */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
              <span className="font-condensed" style={{ fontWeight: 700, fontSize: 12, color: 'var(--text3)', letterSpacing: '.14em', textTransform: 'uppercase' }}>📰 CS2 Ao Vivo</span>
            </div>
            {NOTICIAS.map((n, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 16px', borderBottom: i < NOTICIAS.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>{n.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: n.hot ? 'var(--white)' : 'var(--text2)', fontWeight: n.hot ? 600 : 400, lineHeight: 1.4 }}>{n.title}</div>
                  <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{n.time} atrás</div>
                </div>
                {n.hot && <span style={{ fontSize: 7, fontWeight: 700, color: 'var(--red)', background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 4, padding: '1px 4px', flexShrink: 0, marginTop: 2 }}>HOT</span>}
              </div>
            ))}
          </div>

          {/* Prova social */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div className="font-condensed" style={{ fontWeight: 900, fontSize: 14, color: 'var(--white)', textTransform: 'uppercase', marginBottom: 14 }}>🌍 Comunidade</div>
              {[
                { value: `${((lineupsCount ?? 0) + 2134).toLocaleString('pt-BR')}`, label: 'Lineups criadas',    color: 'var(--green)' },
                { value: '327',                                                       label: 'Usuários ativos',   color: 'var(--cyan)' },
                { value: '7',                                                         label: 'Campeonatos abertos', color: 'var(--orange)' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 12, color: 'var(--text2)' }}>{s.label}</span>
                  <span className="font-tech" style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
            <Link href="/ligas/criar" className="btn-orange" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              borderRadius: 10, padding: '10px', marginTop: 14, fontSize: 12, fontWeight: 900,
              textDecoration: 'none', fontFamily: 'inherit', letterSpacing: '.06em', textTransform: 'uppercase',
              border: 'none',
            }}>
              🚀 Criar Liga Premium
            </Link>
          </div>
        </div>

      </div>
    </AppLayout>
  )
}
