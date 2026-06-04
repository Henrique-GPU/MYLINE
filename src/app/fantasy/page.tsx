import Link from 'next/link'
import { AppLayout } from '@/components/layout/app-layout'
import { getSupabaseServerClient } from '@/lib/supabase/server'

type Championship = {
  id: string
  name: string
  status: string
  initial_lc: number
  banner_url: string | null
  created_at: string
}

const STATUS = {
  active:   { label: 'AO VIVO', cls: 's-live',  dot: true },
  upcoming: { label: 'EM BREVE', cls: 's-soon', dot: false },
  finished: { label: 'ENCERRADO', cls: 's-done', dot: false },
} as const

const BANNERS: Record<string, string> = {
  active:   'linear-gradient(135deg,#001a0a 0%,#002a12 100%)',
  upcoming: 'linear-gradient(135deg,#0a0800 0%,#1a1200 100%)',
  finished: 'linear-gradient(135deg,#080808 0%,#121212 100%)',
}

export default async function FantasyPage() {
  const supabase = getSupabaseServerClient()
  const { data } = await supabase
    .from('championships')
    .select('id, name, status, initial_lc, banner_url, created_at')
    .order('created_at', { ascending: false })

  const list = (data ?? []) as Championship[]
  const active   = list.filter(c => c.status === 'active')
  const upcoming = list.filter(c => c.status === 'upcoming')
  const finished = list.filter(c => c.status === 'finished')

  function Card({ c }: { c: Championship }) {
    const s = STATUS[c.status as keyof typeof STATUS] ?? STATUS.finished
    const isBlast = c.name.toLowerCase().includes('blast')
    const accentColor = isBlast ? '#ff6b00' : '#00f075'
    const cta = c.status === 'finished' ? 'Ver resultado final' : 'Montar sua lineup →'

    return (
      <div style={{
        background: 'var(--bg2)',
        border: `1px solid ${accentColor}30`,
        borderRadius: 16, overflow: 'hidden',
        transition: 'all .25s',
        boxShadow: `0 4px 24px ${accentColor}10`,
      }}
        className="hover-card hover-card-green"
      >
        {/* ── BANNER ── */}
        <div style={{ height: 160, position: 'relative', overflow: 'hidden', background: isBlast ? 'linear-gradient(180deg,#01000a,#100300 60%,#1f0500)' : 'linear-gradient(135deg,#001a0a,#002a12)' }}>
          {/* Image */}
          {isBlast && <img src="/api/img/blast" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%', opacity: .5 }} />}
          {/* Overlay gradients */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(1,0,10,.3) 0%, transparent 40%, rgba(1,0,10,.85) 100%)' }} />
          {isBlast && <div style={{ position: 'absolute', bottom: -10, left: '50%', transform: 'translateX(-50%)', width: '100%', height: 80, background: 'radial-gradient(ellipse 70% 100% at 50% 100%, rgba(255,80,0,.5), transparent)', animation: 'arena-glow 3s ease-in-out infinite' }} />}
          {/* Status badge */}
          <span className={s.cls} style={{ position: 'absolute', top: 12, left: 14, fontSize: 10, fontWeight: 700, letterSpacing: '.08em', padding: '4px 10px', borderRadius: 20 }}>
            {s.dot && <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: 'currentColor', marginRight: 5, animation: 'blink .9s ease-in-out infinite', verticalAlign: 'middle' }} />}
            {s.label}
          </span>
          {/* Prize pool badge */}
          {isBlast && (
            <div style={{ position: 'absolute', top: 12, right: 14, background: 'rgba(255,200,50,.12)', border: '1px solid rgba(255,200,50,.3)', borderRadius: 20, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 11 }}>🏆</span>
              <span className="font-tech" style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold)' }}>$250,000</span>
            </div>
          )}
          {/* Title in banner */}
          <div style={{ position: 'absolute', bottom: 14, left: 16, right: 16, zIndex: 2 }}>
            <div className="font-condensed" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: `${accentColor}cc`, marginBottom: 3 }}>
              {isBlast ? '◈ BLAST PREMIER ◈' : '▸ CAMPEONATO OFICIAL'}
            </div>
            <h3 className="font-condensed" style={{ fontWeight: 900, fontSize: isBlast ? 24 : 20, color: '#fff', letterSpacing: '.03em', textTransform: 'uppercase', lineHeight: 1, textShadow: '0 2px 8px rgba(0,0,0,.6)' }}>
              {isBlast ? 'Bounty 2026 · Season 2' : c.name}
            </h3>
          </div>
        </div>

        {/* ── BODY ── */}
        <div style={{ padding: '16px' }}>
          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 16 }}>
            {[
              { label: 'Orçamento', value: `${c.initial_lc.toLocaleString('pt-BR')} LC`, color: 'var(--green)' },
              { label: 'Times', value: '32', color: 'var(--cyan)' },
              { label: isBlast ? 'Local' : 'Jogadores', value: isBlast ? 'Malta 🇲🇹' : '5 p/ lineup', color: 'var(--yellow)' },
            ].map(stat => (
              <div key={stat.label} style={{ background: 'var(--bg3)', borderRadius: 8, padding: '8px 10px', textAlign: 'center', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 3 }}>{stat.label}</div>
                <div className="font-tech" style={{ fontSize: 13, fontWeight: 700, color: stat.color }}>{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Dates */}
          {isBlast && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14, padding: '7px 10px', background: 'rgba(255,107,0,.06)', border: '1px solid rgba(255,107,0,.15)', borderRadius: 8 }}>
              <span style={{ fontSize: 12 }}>📅</span>
              <span style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600 }}>21 Jul – 2 Ago 2026 · BLAST Studios Malta</span>
            </div>
          )}

          {/* CTA */}
          <Link
            href={`/fantasy/${c.id}/mercado`}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', padding: '12px',
              background: c.status === 'finished'
                ? 'var(--bg3)'
                : `linear-gradient(90deg, ${accentColor}, ${isBlast ? '#ff9500' : '#00d4ff'})`,
              color: c.status === 'finished' ? 'var(--text2)' : '#000',
              fontFamily: 'inherit', fontWeight: 900, fontSize: 14,
              letterSpacing: '.06em', textTransform: 'uppercase', textDecoration: 'none',
              borderRadius: 10, border: c.status === 'finished' ? '1px solid var(--border)' : 'none',
              boxShadow: c.status !== 'finished' ? `0 0 20px ${accentColor}40` : 'none',
              transition: 'all .2s',
            }}
          >
            {c.status !== 'finished' && <span style={{ fontSize: 16 }}>⚡</span>}
            {cta}
          </Link>
          {c.status !== 'finished' && (
            <Link href={`/fantasy/${c.id}/ranking`} style={{ display: 'block', textAlign: 'center', marginTop: 8, fontSize: 12, color: 'var(--text3)', textDecoration: 'none', fontWeight: 600 }}>
              Ver ranking →
            </Link>
          )}
        </div>
      </div>
    )
  }

  return (
    <AppLayout>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 20px' }} className="page-animate">

        <div style={{ marginBottom: 24 }}>
          <h1 className="font-condensed" style={{ fontWeight: 900, fontSize: 26, color: 'var(--white)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 3 }}>
            Campeonatos Oficiais
          </h1>
          <p style={{ color: 'var(--text3)', fontSize: 13 }}>Monte sua lineup com 100.000 LC e dispute o ranking a cada rodada.</p>
        </div>

        {list.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text3)', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12 }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🏆</div>
            <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 4 }}>Nenhum campeonato disponível no momento.</p>
          </div>
        )}

        {active.length > 0 && (
          <section style={{ marginBottom: 28 }}>
            <p className="section-title font-condensed" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
              AO VIVO <span style={{ flex:1, height:1, background:'var(--border)', display:'block' }} />
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: 12 }}>
              {active.map(c => <Card key={c.id} c={c} />)}
            </div>
          </section>
        )}

        {upcoming.length > 0 && (
          <section style={{ marginBottom: 28 }}>
            <p className="font-condensed" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
              EM BREVE <span style={{ flex:1, height:1, background:'var(--border)', display:'block' }} />
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: 12 }}>
              {upcoming.map(c => <Card key={c.id} c={c} />)}
            </div>
          </section>
        )}

        {finished.length > 0 && (
          <section>
            <p className="font-condensed" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
              ENCERRADOS <span style={{ flex:1, height:1, background:'var(--border)', display:'block' }} />
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: 12 }}>
              {finished.map(c => <Card key={c.id} c={c} />)}
            </div>
          </section>
        )}

        {/* How it works */}
        <div style={{ marginTop: 32, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
          <p className="font-condensed" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            COMO FUNCIONA <span style={{ flex:1, height:1, background:'var(--border)', display:'block' }} />
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: 16 }}>
            {[
              { n:'1', t:'Escolha jogadores', d:'Monte sua lineup com até 5 jogadores dentro do orçamento de 100.000 LC.' },
              { n:'2', t:'Acompanhe rodada',  d:'Pontos são calculados automaticamente com base nas stats reais do HLTV.' },
              { n:'3', t:'Suba no ranking',   d:'Cada rodada atualiza seu ranking. Melhor desempenho = mais visibilidade.' },
            ].map(item => (
              <div key={item.n} style={{ display:'flex', gap:12 }}>
                <span style={{ width:28, height:28, borderRadius:'50%', background:'rgba(0,240,117,.12)', color:'var(--green)', fontSize:13, fontWeight:900, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {item.n}
                </span>
                <div>
                  <p style={{ fontWeight:700, color:'var(--white)', fontSize:13, marginBottom:3 }}>{item.t}</p>
                  <p style={{ fontSize:12, color:'var(--text3)', lineHeight:1.55 }}>{item.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
