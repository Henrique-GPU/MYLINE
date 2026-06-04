import Link from 'next/link'
import { AppLayout } from '@/components/layout/app-layout'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getEventMeta, getBannerUrl } from '@/lib/events'
import { MinhaLineup } from '@/components/arena/minha-lineup'
import { ProximaRodada } from '@/components/arena/proxima-rodada'

const NOTICIAS = [
  { icon: '🏆', title: 'donk é eleito MVP do BLAST Bounty S1', time: '2h atrás', hot: true },
  { icon: '🔥', title: 'Vitality vence Spirit em thriller BO3', time: '4h atrás', hot: true },
  { icon: '📊', title: 'ZywOo mantém sequência de 8 MVPs consecutivos', time: '6h atrás', hot: false },
  { icon: '🎯', title: 'FURIA contrata YEKINDAR para o BLAST S2', time: '8h atrás', hot: false },
  { icon: '⚡', title: 'ESL Pro League confirma Katowice para outubro', time: '1d atrás', hot: false },
]

// ── Mock performance data (substituir por dados reais quando disponível) ──
const TOP_PICKS = [
  { nickname: 'ZywOo',    team: 'Vitality', price: 45000, role: 'awper',   form: [82,77,91,88,75], ownership: 48, trend: 'up',   change: '+3%',  hltv_id: 11893 },
  { nickname: 'donk',     team: 'Spirit',   price: 44000, role: 'rifler',  form: [95,88,91,79,90], ownership: 52, trend: 'up',   change: '+8%',  hltv_id: 21167 },
  { nickname: 'sh1ro',    team: 'Spirit',   price: 42000, role: 'awper',   form: [78,85,88,92,81], ownership: 39, trend: 'up',   change: '+5%',  hltv_id: 18987 },
  { nickname: 'device',   team: 'Astralis', price: 40000, role: 'awper',   form: [85,79,88,72,84], ownership: 35, trend: 'neutral', change: '0%', hltv_id: 7592 },
  { nickname: 'karrigan', team: 'FaZe',     price: 30000, role: 'igl',     form: [71,68,74,77,70], ownership: 28, trend: 'down', change: '-2%', hltv_id: 429 },
  { nickname: 'broky',    team: 'FaZe',     price: 27000, role: 'awper',   form: [79,83,88,85,77], ownership: 31, trend: 'up',   change: '+4%',  hltv_id: 18053 },
]

const MARKET_MOVES = [
  { nickname: 'donk',     change: +8,  price: 44000, team: 'Spirit' },
  { nickname: 'ZywOo',    change: +3,  price: 45000, team: 'Vitality' },
  { nickname: 'KSCERATO', change: +5,  price: 28000, team: 'FURIA' },
  { nickname: 'sh1ro',    change: +5,  price: 42000, team: 'Spirit' },
  { nickname: 'rain',     change: -2,  price: 25000, team: 'FaZe' },
  { nickname: 'frozen',   change: -4,  price: 22000, team: 'FaZe' },
  { nickname: 'torzsi',   change: -3,  price: 36000, team: 'MOUZ' },
]

const TEAMS_IN_FORM = [
  { name: 'Spirit',   rank: 1, logo: '/api/img/lp/thumb/6/66/Team_Spirit_2022_lightmode.png/60px-Team_Spirit_2022_lightmode.png',   wins: 8, losses: 2, form: ['W','W','W','W','L'], next: 'vs FaZe · Jul 22' },
  { name: 'Vitality', rank: 2, logo: '/api/img/lp/thumb/e/e4/Team_Vitality_2023_lightmode.png/60px-Team_Vitality_2023_lightmode.png', wins: 7, losses: 3, form: ['W','W','L','W','W'], next: 'vs MOUZ · Jul 22' },
  { name: 'FaZe',     rank: 3, logo: '/api/img/lp/thumb/f/f9/FaZe_Esports_2026_lightmode.png/60px-FaZe_Esports_2026_lightmode.png',  wins: 6, losses: 3, form: ['W','L','W','W','W'], next: 'vs Spirit · Jul 22' },
  { name: 'MOUZ',     rank: 4, logo: '/api/img/lp/thumb/a/a5/MOUZ_2021_full_allmode.png/60px-MOUZ_2021_full_allmode.png',            wins: 6, losses: 4, form: ['L','W','W','W','L'], next: 'vs Vitality · Jul 22' },
]

const ROLE_COLOR: Record<string, string> = { awper: '#f59e0b', igl: '#8b5cf6', entry: '#ef4444', support: '#1e7fff', rifler: '#5a6e90' }

function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values)
  const min = Math.min(...values)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 24 }}>
      {values.map((v, i) => {
        const pct = max === min ? 0.5 : (v - min) / (max - min)
        const h = Math.max(4, Math.round(pct * 20))
        const color = pct > .6 ? 'var(--green)' : pct > .3 ? 'var(--yellow)' : 'var(--red)'
        return <div key={i} style={{ width: 6, height: h, borderRadius: 2, background: color, opacity: i === values.length - 1 ? 1 : .6 }} />
      })}
    </div>
  )
}

export default async function ArenaPage() {
  const supabase = getSupabaseServerClient()

  const [
    { data: championships },
    { count: teamsCount },
    { count: playersCount },
    { count: lineupsCount },
    { count: champsOpen },
  ] = await Promise.all([
    supabase.from('championships').select('id, name, status, initial_lc').order('created_at', { ascending: true }).limit(5),
    supabase.from('teams').select('*', { count: 'exact', head: true }),
    supabase.from('players').select('*', { count: 'exact', head: true }),
    supabase.from('lineups').select('*', { count: 'exact', head: true }),
    supabase.from('championships').select('*', { count: 'exact', head: true }).eq('status', 'upcoming'),
  ])

  const prizeTotal = (championships ?? []).reduce((s, c) => {
    const meta = getEventMeta(c.name)
    const num = parseInt(meta.prize.replace(/[^0-9]/g, '')) || 0
    return s + num
  }, 0)

  const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
    active:   { label: 'AO VIVO',   cls: 's-live' },
    upcoming: { label: 'EM BREVE',  cls: 's-soon' },
    finished: { label: 'ENCERRADO', cls: 's-done' },
  }

  return (
    <AppLayout>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px 40px' }} className="page-animate">

        {/* ══════════════════════════════════════════
            HERO — PROPOSTA DE VALOR
        ══════════════════════════════════════════ */}
        <div style={{
          position: 'relative', overflow: 'hidden',
          margin: '0 -20px 28px',
          padding: '48px 40px',
          background: 'linear-gradient(135deg, #02010a 0%, #07040f 50%, #0a0318 100%)',
          borderBottom: '1px solid var(--border)',
        }}>
          {/* Grid bg */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,240,117,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,240,117,.03) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
          <div style={{ position: 'absolute', bottom: -40, left: '60%', width: 500, height: 300, background: 'radial-gradient(ellipse, rgba(0,240,117,.07), transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1fr auto', gap: 32, alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(0,240,117,.08)', border: '1px solid rgba(0,240,117,.2)', borderRadius: 20, padding: '4px 14px', marginBottom: 16, fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--green)' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', animation: 'blink 1.2s ease-in-out infinite' }} />
                BLAST Bounty 2026 · Ao vivo
              </div>
              <h1 className="font-condensed" style={{ fontWeight: 900, fontSize: 'clamp(32px,5vw,56px)', color: 'var(--white)', textTransform: 'uppercase', lineHeight: .9, letterSpacing: '.02em', marginBottom: 16 }}>
                Monte sua<br /><span className="text-gradient-green">Lineup de CS2</span>
              </h1>
              <p style={{ fontSize: 16, color: 'var(--text2)', lineHeight: 1.6, maxWidth: 460, marginBottom: 24 }}>
                Escale jogadores reais, pontue em campeonatos oficiais e dispute contra amigos e a comunidade.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {championships?.find(c => c.status === 'upcoming' || c.status === 'active') ? (
                  <Link href={`/fantasy/${championships.find(c => c.status === 'upcoming' || c.status === 'active')!.id}/mercado`}
                    className="btn-green" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: 10, padding: '13px 28px', fontSize: 15, fontWeight: 900, textDecoration: 'none', fontFamily: 'inherit', letterSpacing: '.06em', textTransform: 'uppercase' }}>
                    🔥 Montar Lineup
                  </Link>
                ) : (
                  <Link href="/fantasy" className="btn-green" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: 10, padding: '13px 28px', fontSize: 15, fontWeight: 900, textDecoration: 'none', fontFamily: 'inherit', letterSpacing: '.06em', textTransform: 'uppercase' }}>
                    🔥 Ver Campeonatos
                  </Link>
                )}
                <Link href="/perfil" style={{ display: 'inline-flex', alignItems: 'center', borderRadius: 10, padding: '13px 22px', fontSize: 14, fontWeight: 600, textDecoration: 'none', fontFamily: 'inherit', color: 'var(--text2)', border: '1px solid var(--border2)' }}>
                  Como funciona
                </Link>
              </div>
            </div>
            {/* Floating stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 160 }}>
              {[
                { v: `${teamsCount ?? 32}`, l: 'Times', color: 'var(--green)' },
                { v: `${(playersCount ?? 160)}`, l: 'Jogadores', color: 'var(--cyan)' },
                { v: `$${(prizeTotal / 1000).toFixed(0)}K`, l: 'Prize Pool', color: 'var(--gold)' },
              ].map(s => (
                <div key={s.l} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <span className="font-condensed font-tech" style={{ fontWeight: 900, fontSize: 22, color: s.color }}>{s.v}</span>
                  <span style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.08em' }}>{s.l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            STAT CARDS — com indicadores
        ══════════════════════════════════════════ */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 28 }}>
          {[
            { label: 'Times Disponíveis', value: `${teamsCount ?? 32}`, delta: '+4',  pct: '+14%', color: 'linear-gradient(90deg,var(--green),var(--cyan))', icon: '🛡️' },
            { label: 'Jogadores Ativos',  value: `${playersCount ?? 160}`, delta: '+12', pct: '+8%',  color: 'var(--cyan)', icon: '👤' },
            { label: 'Prize Pool Total',  value: `$${(prizeTotal / 1000).toFixed(0)}K`, delta: '+2 eventos', pct: '+21%', color: 'var(--gold)', icon: '💰' },
            { label: 'Lineups Criadas',   value: `${(lineupsCount ?? 0) + 1247}`, delta: `+${lineupsCount ?? 0} novas`, pct: '+32%', color: 'var(--orange)', icon: '📋' },
          ].map(card => (
            <div key={card.label} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: card.color }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <span style={{ fontSize: 18 }}>{card.icon}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--green)', background: 'rgba(0,240,117,.1)', border: '1px solid rgba(0,240,117,.2)', borderRadius: 10, padding: '2px 7px' }}>{card.pct}</span>
              </div>
              <div className="font-condensed font-tech" style={{ fontWeight: 900, fontSize: 26, color: 'var(--white)', lineHeight: 1, marginBottom: 4 }}>{card.value}</div>
              <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 2 }}>{card.label}</div>
              <div style={{ fontSize: 10, color: 'var(--text2)' }}>{card.delta} esta semana</div>
            </div>
          ))}
        </div>

        {/* ══════════════════════════════════════════
            MINHA LINEUP + PRÓXIMA RODADA
        ══════════════════════════════════════════ */}
        {championships && championships.length > 0 && (() => {
          const activeChamp = championships.find(c => c.status === 'active') ?? championships.find(c => c.status === 'upcoming') ?? championships[0]
          const meta = getEventMeta(activeChamp.name)
          const mercadoHref = `/fantasy/${activeChamp.id}/mercado`
          const roundId = 'b0000000-0000-0000-0000-000000000001' // Fase Online
          return (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
              <MinhaLineup championshipId={activeChamp.id} roundId={roundId} mercadoHref={mercadoHref} />
              <ProximaRodada
                championshipId={activeChamp.id}
                championshipName={activeChamp.name}
                roundName="Fase Online"
                accentColor={meta.accentColor}
                mercadoHref={mercadoHref}
              />
            </div>
          )
        })()}

        {/* ══════════════════════════════════════════
            MAIN GRID: TOP PICKS | AGENDA | MERCADO
        ══════════════════════════════════════════ */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: 16, marginBottom: 24 }}>

          {/* ── TOP PICKS ── */}
          <div>
            <p className="font-condensed" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              🔥 TOP PICKS — BLAST BOUNTY S2 <span style={{ flex: 1, height: 1, background: 'var(--border)', display: 'block' }} />
              <Link href="/jogadores" style={{ fontSize: 10, color: 'var(--green)', textDecoration: 'none', fontWeight: 700 }}>Ver todos →</Link>
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {TOP_PICKS.map(p => {
                const color = ROLE_COLOR[p.role] ?? '#5a6e90'
                const avg = (p.form.reduce((a, b) => a + b, 0) / p.form.length).toFixed(1)
                return (
                  <Link key={p.nickname} href="/jogadores" style={{ textDecoration: 'none' }}>
                    <div style={{ background: 'var(--bg2)', border: `1px solid ${color}25`, borderRadius: 12, padding: '14px', transition: 'all .2s', cursor: 'pointer', borderTop: `2px solid ${color}` }}
                      className="hover-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <div>
                          <div className="font-condensed" style={{ fontWeight: 900, fontSize: 17, color: 'var(--white)', letterSpacing: '.03em' }}>{p.nickname}</div>
                          <div style={{ fontSize: 10, color: 'var(--text3)' }}>{p.team}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div className="font-tech" style={{ fontSize: 14, fontWeight: 700, color }}>
                            {p.price.toLocaleString('pt-BR')}
                          </div>
                          <div style={{ fontSize: 9, color: 'var(--text3)' }}>LC</div>
                        </div>
                      </div>
                      {/* Sparkline */}
                      <div style={{ marginBottom: 8 }}>
                        <Sparkline values={p.form} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: 9, color: 'var(--text3)' }}>Média</div>
                          <div className="font-tech" style={{ fontSize: 13, fontWeight: 700, color: 'var(--white)' }}>{avg}</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 9, color: 'var(--text3)' }}>Ownership</div>
                          <div className="font-tech" style={{ fontSize: 13, fontWeight: 700, color }}>{p.ownership}%</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{
                            fontSize: 10, fontWeight: 700, borderRadius: 6, padding: '2px 7px',
                            background: p.trend === 'up' ? 'rgba(0,240,117,.1)' : p.trend === 'down' ? 'rgba(239,68,68,.1)' : 'rgba(255,255,255,.05)',
                            color: p.trend === 'up' ? 'var(--green)' : p.trend === 'down' ? 'var(--red)' : 'var(--text3)',
                            border: `1px solid ${p.trend === 'up' ? 'rgba(0,240,117,.2)' : p.trend === 'down' ? 'rgba(239,68,68,.2)' : 'var(--border)'}`,
                          }}>
                            {p.trend === 'up' ? '▲' : p.trend === 'down' ? '▼' : '—'} {p.change}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* ── AGENDA + MERCADO ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* AGENDA */}
            <div>
              <p className="font-condensed" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                📅 AGENDA <span style={{ flex: 1, height: 1, background: 'var(--border)', display: 'block' }} />
                <Link href="/fantasy" style={{ fontSize: 10, color: 'var(--green)', textDecoration: 'none', fontWeight: 700 }}>Todos →</Link>
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {(championships ?? []).slice(0, 4).map(c => {
                  const s = STATUS_LABEL[c.status] ?? STATUS_LABEL.finished
                  const meta = getEventMeta(c.name)
                  const accent = meta.accentColor
                  return (
                    <Link key={c.id} href={`/fantasy/${c.id}`} style={{ textDecoration: 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: 'var(--bg2)', border: `1px solid ${accent}18`, borderLeft: `3px solid ${accent}`, borderRadius: '0 8px 8px 0', transition: 'all .15s' }}
                        className="hover-card">
                        <div style={{ width: 36, height: 36, borderRadius: 6, background: `${accent}12`, border: `1px solid ${accent}25`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span className="font-condensed" style={{ fontWeight: 900, fontSize: 14, color: accent, lineHeight: 1 }}>
                            {meta.startDate.split('-')[2]}
                          </span>
                          <span style={{ fontSize: 7, color: 'var(--text3)', fontWeight: 600, letterSpacing: '.06em' }}>
                            {['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'][parseInt(meta.startDate.split('-')[1]) - 1]}
                          </span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="font-condensed" style={{ fontWeight: 800, fontSize: 13, color: 'var(--white)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {c.name.replace('2026','').replace('Season','S').trim()}
                          </div>
                          <div style={{ display: 'flex', gap: 6, marginTop: 1 }}>
                            <span style={{ fontSize: 9, color: 'var(--text3)' }}>{meta.flagEmoji} {meta.location}</span>
                            <span className="font-tech" style={{ fontSize: 9, color: 'var(--gold)', fontWeight: 700 }}>{meta.prize}</span>
                          </div>
                        </div>
                        <span className={s.cls} style={{ fontSize: 8, fontWeight: 700, padding: '2px 6px', borderRadius: 20, flexShrink: 0 }}>{s.label}</span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* MERCADO */}
            <div>
              <p className="font-condensed" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                📈 MERCADO <span style={{ flex: 1, height: 1, background: 'var(--border)', display: 'block' }} />
              </p>
              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                {MARKET_MOVES.map((m, i) => (
                  <div key={m.nickname} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderBottom: i < MARKET_MOVES.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: m.change > 0 ? 'var(--green)' : 'var(--red)', flexShrink: 0 }} />
                    <span className="font-condensed" style={{ flex: 1, fontWeight: 800, fontSize: 13, color: 'var(--white)' }}>{m.nickname}</span>
                    <span style={{ fontSize: 10, color: 'var(--text3)' }}>{m.team}</span>
                    <span className="font-tech" style={{
                      fontSize: 12, fontWeight: 700,
                      color: m.change > 0 ? 'var(--green)' : 'var(--red)',
                    }}>
                      {m.change > 0 ? '▲' : '▼'} {Math.abs(m.change)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            TIMES EM ALTA
        ══════════════════════════════════════════ */}
        <div style={{ marginBottom: 24 }}>
          <p className="font-condensed" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            🔝 TIMES EM ALTA <span style={{ flex: 1, height: 1, background: 'var(--border)', display: 'block' }} />
            <Link href="/times" style={{ fontSize: 10, color: 'var(--green)', textDecoration: 'none', fontWeight: 700 }}>Ver todos →</Link>
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
            {TEAMS_IN_FORM.map(team => (
              <div key={team.name} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px', transition: 'all .2s' }}
                className="hover-card hover-card-green">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 6, background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', overflow: 'hidden' }}>
                    <img src={team.logo} alt={team.name} width={28} height={28} style={{ objectFit: 'contain' }} />
                  </div>
                  <div>
                    <div className="font-condensed" style={{ fontWeight: 900, fontSize: 15, color: 'var(--white)', letterSpacing: '.03em' }}>{team.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text3)' }}>#{team.rank} HLTV</div>
                  </div>
                </div>
                {/* Win rate */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 9, color: 'var(--text3)' }}>Win Rate</div>
                    <div className="font-tech" style={{ fontSize: 14, fontWeight: 700, color: 'var(--green)' }}>
                      {Math.round(team.wins / (team.wins + team.losses) * 100)}%
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 9, color: 'var(--text3)' }}>Recorde</div>
                    <div className="font-tech" style={{ fontSize: 12, color: 'var(--white)' }}>{team.wins}W {team.losses}L</div>
                  </div>
                </div>
                {/* Form */}
                <div style={{ display: 'flex', gap: 3, marginBottom: 8 }}>
                  {team.form.map((r, i) => (
                    <div key={i} style={{ flex: 1, height: 18, borderRadius: 3, background: r === 'W' ? 'rgba(0,240,117,.2)' : 'rgba(239,68,68,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 900, color: r === 'W' ? 'var(--green)' : 'var(--red)' }}>
                      {r}
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 9, color: 'var(--text3)' }}>
                  <span style={{ color: 'var(--text2)' }}>Próx:</span> {team.next}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════
            SUAS LIGAS + MINHA FRANQUIA + NOTÍCIAS
        ══════════════════════════════════════════ */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>

          {/* SUAS LIGAS */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ height: 3, background: 'linear-gradient(90deg,var(--purple),var(--blue))' }} />
            <div style={{ padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span className="font-condensed" style={{ fontWeight: 900, fontSize: 14, color: 'var(--white)', textTransform: 'uppercase' }}>🏆 Suas Ligas</span>
                <Link href="/ligas" style={{ fontSize: 10, color: 'var(--purple)', textDecoration: 'none', fontWeight: 700 }}>Ver todas →</Link>
              </div>
              {[
                { name: 'Amigos do CS', pos: 3, n: 18 },
                { name: 'Empresa XPTO', pos: 1, n: 27 },
                { name: 'Arena dos Pratas', pos: 5, n: 41 },
              ].map(liga => (
                <Link key={liga.name} href="/ligas" style={{ textDecoration: 'none', display: 'block', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8 }}>
                    <span style={{ fontSize: 12 }}>{liga.pos === 1 ? '🥇' : liga.pos <= 3 ? '🥈' : '🏅'}</span>
                    <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: 'var(--white)' }}>{liga.name}</span>
                    <span style={{ fontSize: 10, color: 'var(--text3)' }}>#{liga.pos} · {liga.n}</span>
                  </div>
                </Link>
              ))}
              <Link href="/ligas/criar" style={{ display: 'block', textAlign: 'center', marginTop: 8, padding: '8px', background: 'rgba(139,92,246,.1)', border: '1px solid rgba(139,92,246,.25)', borderRadius: 8, fontSize: 12, fontWeight: 700, color: 'var(--purple)', textDecoration: 'none' }}>
                ➕ Criar Liga
              </Link>
            </div>
          </div>

          {/* MINHA FRANQUIA */}
          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,200,50,.2)', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ height: 3, background: 'linear-gradient(90deg,var(--gold),var(--yellow))' }} />
            <div style={{ padding: '14px 16px' }}>
              <div style={{ marginBottom: 14 }}>
                <span className="font-condensed" style={{ fontWeight: 900, fontSize: 14, color: 'var(--gold)', textTransform: 'uppercase' }}>💎 Minha Franquia</span>
              </div>
              {[
                { label: 'Line Coins',      value: '100.000',   color: 'var(--green)', icon: '💰' },
                { label: 'Valor da Equipe', value: '89.400',    color: 'var(--cyan)',  icon: '📊' },
                { label: 'Valorização',     value: '+8%',       color: 'var(--green)', icon: '📈' },
                { label: 'Patrimônio',      value: '189.400',   color: 'var(--gold)',  icon: '🏦' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>{item.icon} {item.label}</span>
                  <span className="font-tech" style={{ fontSize: 13, fontWeight: 700, color: item.color }}>{item.value}</span>
                </div>
              ))}
              <Link href="/perfil" style={{ display: 'block', textAlign: 'center', marginTop: 10, fontSize: 11, color: 'var(--gold)', textDecoration: 'none', fontWeight: 600 }}>
                Ver meu perfil completo →
              </Link>
            </div>
          </div>

          {/* NOTÍCIAS */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ height: 3, background: 'linear-gradient(90deg,var(--cyan),var(--blue))' }} />
            <div style={{ padding: '14px 16px' }}>
              <span className="font-condensed" style={{ fontWeight: 900, fontSize: 14, color: 'var(--white)', textTransform: 'uppercase', marginBottom: 12, display: 'block' }}>📰 Notícias CS2</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {NOTICIAS.map((n, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '8px 0', borderBottom: i < NOTICIAS.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{n.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: n.hot ? 'var(--white)' : 'var(--text2)', fontWeight: n.hot ? 600 : 400, lineHeight: 1.4 }}>{n.title}</div>
                      <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{n.time}</div>
                    </div>
                    {n.hot && <span style={{ fontSize: 7, fontWeight: 700, color: 'var(--red)', background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 4, padding: '1px 4px', flexShrink: 0, marginTop: 2 }}>HOT</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            PROVA SOCIAL
        ══════════════════════════════════════════ */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,240,117,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,240,117,.02) 1px,transparent 1px)', backgroundSize: '32px 32px' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p className="font-condensed" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              🌍 COMUNIDADE MYLINE <span style={{ flex: 1, height: 1, background: 'var(--border)', display: 'block' }} />
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
              {[
                { value: `${((lineupsCount ?? 0) + 2134).toLocaleString('pt-BR')}`, label: 'Lineups Criadas', icon: '📋', color: 'var(--green)' },
                { value: '327', label: 'Usuários Ativos', icon: '👥', color: 'var(--cyan)' },
                { value: `${champsOpen ?? 7}`, label: 'Campeonatos Abertos', icon: '🏆', color: 'var(--orange)' },
                { value: `$${(prizeTotal / 1000).toFixed(0)}K+`, label: 'Prize Pool Disponível', icon: '💰', color: 'var(--gold)' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{s.icon}</div>
                  <div className="font-condensed font-tech" style={{ fontWeight: 900, fontSize: 28, color: s.color, lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </AppLayout>
  )
}
