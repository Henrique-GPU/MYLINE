import Link from 'next/link'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import Image from 'next/image'

export default async function Home() {
  const supabase = getSupabaseServerClient()

  const [
    { count: teamsCount },
    { count: playersCount },
    { data: championships },
    { data: topPlayers },
  ] = await Promise.all([
    supabase.from('teams').select('*', { count: 'exact', head: true }),
    supabase.from('players').select('*', { count: 'exact', head: true }),
    supabase.from('championships').select('id, name, status, initial_lc').order('created_at', { ascending: false }).limit(1),
    supabase.from('players').select('id, nickname, role, price_lc, team_id, hltv_id').order('price_lc', { ascending: false }).limit(6),
  ])

  const { data: teamRows } = await supabase.from('teams').select('id, name, hltv_id')
  const teamsById = Object.fromEntries((teamRows ?? []).map(t => [t.id, t]))

  const champ = championships?.[0]
  const ROLE_COLORS: Record<string, string> = { awper: '#f59e0b', igl: '#8b5cf6', entry: '#ef4444', support: '#1e7fff', rifler: '#5a6e90' }

  const SCORING = [
    ['Kill', '+1.0', true], ['Assistência', '+0.5', true], ['Morte', '−0.4', false],
    ['K/D positivo', '+2.0', true], ['K/D > 1.5', '+4.0', true], ['Rating > 1.20', '+5.0', true],
    ['ADR > 85', '+3.0', true], ['Clutch', '+4.0', true], ['Ace', '+6.0', true],
    ['MVP', '+5.0', true], ['Vitória', '+3.0', true], ['Eliminado', '−3.0', false],
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>

      {/* ── TOPBAR ── */}
      <header style={{ height: 58, background: 'rgba(5,8,15,.97)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(14px)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12, position: 'sticky', top: 0, zIndex: 300 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <span className="font-condensed text-gradient-green" style={{ fontWeight: 900, fontSize: 20, letterSpacing: '.06em', textTransform: 'uppercase', lineHeight: 1 }}>MyLine</span>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--text3)' }}>CS2 FANTASY</span>
        </div>
        <nav style={{ display: 'flex', gap: 4 }}>
          {[['Como funciona', '#como-funciona'], ['Times', '/times'], ['Jogadores', '/jogadores']].map(([label, href]) => (
            <Link key={href} href={href} style={{ color: 'var(--text2)', fontSize: 13, fontWeight: 600, textDecoration: 'none', padding: '7px 11px', borderRadius: 6 }}>
              {label}
            </Link>
          ))}
        </nav>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/login" style={{ color: 'var(--text2)', fontSize: 13, fontWeight: 600, textDecoration: 'none', padding: '7px 14px', borderRadius: 6, border: '1px solid var(--border2)' }}>
            Entrar
          </Link>
          <Link href="/signup" className="btn-orange" style={{ display: 'inline-flex', alignItems: 'center', borderRadius: 8, padding: '7px 16px', fontSize: 12, fontWeight: 900, textDecoration: 'none', fontFamily: 'inherit', letterSpacing: '.06em', textTransform: 'uppercase' }}>
            Criar conta
          </Link>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '80px 24px 70px', background: 'linear-gradient(180deg, #07040f 0%, var(--bg) 100%)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,240,117,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,240,117,.04) 1px,transparent 1px)', backgroundSize: '40px 40px', maskImage: 'radial-gradient(ellipse 100% 100% at 50% 0%, black 20%, transparent 80%)' }} />
        <div style={{ position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)', width: 700, height: 350, background: 'radial-gradient(ellipse, rgba(0,240,117,.07), transparent 70%)', pointerEvents: 'none' }} />

        <div className="hero-grid" style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto' }}>
          <div>
            {champ && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,107,0,.1)', border: '1px solid rgba(255,107,0,.3)', borderRadius: 20, padding: '5px 14px', marginBottom: 20, fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--orange)' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--orange)', display: 'inline-block', animation: 'blink 1.2s ease-in-out infinite' }} />
                {champ.name} · {champ.status === 'upcoming' ? 'Em breve' : champ.status === 'active' ? 'Ao vivo' : 'Encerrado'}
              </div>
            )}

            <h1 className="font-condensed" style={{ fontWeight: 900, fontSize: 'clamp(40px, 6vw, 72px)', letterSpacing: '.02em', textTransform: 'uppercase', lineHeight: .9, marginBottom: 20, color: 'var(--white)' }}>
              A Liga do<br />
              <span className="text-gradient-green">CS2</span><br />
              Brasileiro
            </h1>

            <p style={{ fontSize: 16, color: 'var(--text2)', lineHeight: 1.65, maxWidth: 420, marginBottom: 32 }}>
              Monte sua lineup com <strong style={{ color: 'var(--green)' }}>100.000 Line Coins</strong>, pontue com stats reais do HLTV e dispute o ranking com a comunidade.
            </p>

            <div className="hero-ctas" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/signup" className="btn-green" style={{ display: 'inline-flex', alignItems: 'center', borderRadius: 8, padding: '13px 30px', fontSize: 15, fontWeight: 900, textDecoration: 'none', fontFamily: 'inherit', letterSpacing: '.06em', textTransform: 'uppercase' }}>
                Jogar agora →
              </Link>
              <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', borderRadius: 8, padding: '13px 24px', fontSize: 14, fontWeight: 600, textDecoration: 'none', fontFamily: 'inherit', color: 'var(--text2)', border: '1px solid var(--border2)' }}>
                Já tenho conta
              </Link>
            </div>
          </div>

          {/* Stats card — esconde em mobile */}
          <div className="hero-stats-card" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ height: 3, background: 'linear-gradient(90deg, var(--green), var(--cyan))' }} />
            <div style={{ padding: '20px' }}>
              <p className="font-condensed" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                BLAST BOUNTY 2026 S2 <span style={{ flex: 1, height: 1, background: 'var(--border)', display: 'block' }} />
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                {[
                  { label: 'Times', value: `${teamsCount ?? 32}`, color: 'var(--green)', icon: '🛡️' },
                  { label: 'Jogadores', value: `${playersCount ?? 160}`, color: 'var(--cyan)', icon: '👤' },
                  { label: 'Orçamento', value: '100K LC', color: 'var(--yellow)', icon: '💰' },
                  { label: 'Rodadas', value: '2', color: 'var(--orange)', icon: '🗓️' },
                ].map(s => (
                  <div key={s.label} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
                    <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
                    <div className="font-condensed" style={{ fontWeight: 900, fontSize: 22, color: s.color, marginBottom: 2 }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <Link href="/signup" className="btn-green" style={{ display: 'block', textAlign: 'center', borderRadius: 8, padding: '11px', fontSize: 13, fontWeight: 900, textDecoration: 'none', fontFamily: 'inherit', letterSpacing: '.06em', textTransform: 'uppercase' }}>
                Participar do campeonato
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── TOP PLAYERS ── */}
      {(topPlayers?.length ?? 0) > 0 && (
        <section style={{ padding: '48px 24px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <p className="font-condensed" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 8 }}>
                TOP JOGADORES — BLAST BOUNTY S2 <span style={{ height: 1, width: 40, background: 'var(--border)', display: 'block' }} />
              </p>
              <Link href="/jogadores" style={{ fontSize: 12, color: 'var(--green)', textDecoration: 'none', fontWeight: 600 }}>Ver todos →</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
              {(topPlayers ?? []).map((p, i) => {
                const team = teamsById[p.team_id ?? '']
                const color = ROLE_COLORS[p.role ?? ''] ?? '#5a6e90'
                const logoUrl = null // HLTV CDN bloqueia hotlink — usar badge colorido
                return (
                  <div key={p.id} style={{ background: 'var(--bg2)', border: `1px solid ${color}30`, borderRadius: 12, overflow: 'hidden', textAlign: 'center', padding: '16px 12px' }}>
                    <div style={{ position: 'relative', marginBottom: 10 }}>
                      <div style={{ width: 52, height: 52, borderRadius: '50%', background: `${color}18`, border: `2px solid ${color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: 18, fontWeight: 900, color, fontFamily: 'var(--font-condensed)' }}>
                        {p.nickname.slice(0, 2).toUpperCase()}
                      </div>
                      {i < 3 && (
                        <div style={{ position: 'absolute', top: -4, right: 16, fontSize: 16 }}>
                          {['👑', '⭐', '🔥'][i]}
                        </div>
                      )}
                    </div>
                    <div className="font-condensed" style={{ fontWeight: 900, fontSize: 15, color: 'var(--white)', marginBottom: 3, letterSpacing: '.03em' }}>{p.nickname}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginBottom: 8 }}>
                      <span style={{ fontSize: 10, color: 'var(--text3)' }}>{team?.name ?? '—'}</span>
                    </div>
                    <div style={{ background: `${color}15`, border: `1px solid ${color}30`, borderRadius: 6, padding: '4px 8px', display: 'inline-block' }}>
                      <span className="font-tech" style={{ fontSize: 13, fontWeight: 700, color }}>{(p.price_lc ?? 0).toLocaleString('pt-BR')} LC</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── HOW IT WORKS ── */}
      <section id="como-funciona" style={{ padding: '56px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg2)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <p className="font-condensed" style={{ fontWeight: 900, fontSize: 32, color: 'var(--white)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 8 }}>Como funciona</p>
            <p style={{ fontSize: 14, color: 'var(--text3)', maxWidth: 500, margin: '0 auto' }}>Em 3 passos simples você está competindo na disputa mais hardcore do CS2 brasileiro</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {[
              { n: '01', icon: '💰', title: 'Monte sua lineup', desc: 'Escolha 5 jogadores com até 100.000 LC de orçamento. Cada jogador tem um preço baseado em desempenho. Defina seu capitão para multiplicar pontos.', color: 'var(--green)' },
              { n: '02', icon: '📊', title: 'Acompanhe ao vivo', desc: 'Stats reais do HLTV — kills, rating, ADR, clutches e aces geram pontos automaticamente a cada rodada da competição.', color: 'var(--cyan)' },
              { n: '03', icon: '🏆', title: 'Dispute o ranking', desc: 'Suba no ranking geral e por rodada. Os jogadores valorizam ou desvalorizam baseado na performance. Gerencie seu portfólio como um GM.', color: 'var(--yellow)' },
            ].map(step => (
              <div key={step.n} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 14, padding: '24px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: step.color }} />
                <div style={{ fontSize: 36, marginBottom: 12 }}>{step.icon}</div>
                <div className="font-condensed" style={{ fontWeight: 900, fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: step.color, marginBottom: 6 }}>
                  PASSO {step.n}
                </div>
                <h3 className="font-condensed" style={{ fontWeight: 900, fontSize: 20, color: 'var(--white)', textTransform: 'uppercase', letterSpacing: '.03em', marginBottom: 10 }}>{step.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.65 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SCORING ── */}
      <section style={{ padding: '56px 24px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'start' }}>
            <div>
              <p className="font-condensed" style={{ fontWeight: 900, fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                SISTEMA DE PONTUAÇÃO <span style={{ flex: 1, height: 1, background: 'var(--border)', display: 'block' }} />
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {SCORING.map(([label, pts, pos]) => (
                  <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6 }}>
                    <span style={{ fontSize: 13, color: 'var(--text2)' }}>{label as string}</span>
                    <span className="font-tech" style={{ fontSize: 13, fontWeight: 700, color: pos ? 'var(--green)' : 'var(--red)' }}>{pts as string}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="font-condensed" style={{ fontWeight: 900, fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                VALORIZAÇÃO DE LC <span style={{ flex: 1, height: 1, background: 'var(--border)', display: 'block' }} />
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1, marginBottom: 24 }}>
                {[
                  ['40+ pontos', '+8%', true, '#00f075'],
                  ['30–39 pontos', '+5%', true, '#00d4ff'],
                  ['20–29 pontos', '+2%', true, '#1e7fff'],
                  ['10–19 pontos', '0%', null, '#5a6e90'],
                  ['0–9.99 pontos', '−3%', false, '#f59e0b'],
                  ['Pontuação negativa', '−7%', false, '#ef4444'],
                  ['Eliminado', '−10%', false, '#ef4444'],
                ].map(([label, val, pos, color]) => (
                  <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg2)', border: `1px solid ${color as string}20`, borderRadius: 6 }}>
                    <span style={{ fontSize: 13, color: 'var(--text2)' }}>{label as string}</span>
                    <span className="font-tech" style={{ fontSize: 13, fontWeight: 700, color: pos === null ? 'var(--text3)' : pos ? 'var(--green)' : 'var(--red)' }}>{val as string}</span>
                  </div>
                ))}
              </div>

              <div style={{ background: 'var(--bg2)', border: '1px solid rgba(0,240,117,.2)', borderRadius: 12, padding: '18px' }}>
                <div style={{ fontSize: 24, marginBottom: 10 }}>🎯</div>
                <p className="font-condensed" style={{ fontWeight: 900, fontSize: 16, color: 'var(--white)', textTransform: 'uppercase', marginBottom: 8 }}>Dica pro</p>
                <p style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.6 }}>
                  Escale jogadores de times favoritos e defina o <strong style={{ color: 'var(--green)' }}>capitão</strong> como o AWPer ou o IGL com maior probabilidade de MVP. A pontuação do capitão é contada em dobro no ranking final.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ padding: '64px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,240,117,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,240,117,.03) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
        <div style={{ position: 'absolute', bottom: -40, left: '50%', transform: 'translateX(-50%)', width: 600, height: 300, background: 'radial-gradient(ellipse, rgba(0,240,117,.06), transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 500, margin: '0 auto' }}>
          <p className="font-condensed" style={{ fontWeight: 900, fontSize: 40, color: 'var(--white)', textTransform: 'uppercase', letterSpacing: '.04em', lineHeight: .95, marginBottom: 16 }}>
            Pronto para<br /><span className="text-gradient-green">Competir?</span>
          </p>
          <p style={{ fontSize: 14, color: 'var(--text3)', marginBottom: 28 }}>
            {teamsCount ?? 32} times · {playersCount ?? 160} jogadores · 100.000 LC para gastar
          </p>
          <Link href="/signup" className="btn-green" style={{ display: 'inline-flex', alignItems: 'center', borderRadius: 8, padding: '14px 36px', fontSize: 16, fontWeight: 900, textDecoration: 'none', fontFamily: 'inherit', letterSpacing: '.06em', textTransform: 'uppercase' }}>
            Criar conta grátis →
          </Link>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="font-condensed text-gradient-green" style={{ fontWeight: 900, fontSize: 16, letterSpacing: '.06em', textTransform: 'uppercase' }}>MyLine CS2</span>
          <span style={{ fontSize: 11, color: 'var(--text3)' }}>© 2026</span>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          {[['Times', '/times'], ['Jogadores', '/jogadores'], ['Campeonatos', '/fantasy']].map(([l, h]) => (
            <Link key={h} href={h} style={{ fontSize: 12, color: 'var(--text3)', textDecoration: 'none' }}>{l}</Link>
          ))}
        </div>
        <span style={{ fontSize: 11, color: 'var(--text3)' }}>Dados via HLTV · Não oficial</span>
      </footer>
    </div>
  )
}
