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

    return (
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border)',
        borderRadius: 12, overflow: 'hidden', transition: 'all .2s',
      }}
        className="hover-card hover-card-green"
      >
        {/* Banner */}
        <div style={{
          height: 110, position: 'relative', overflow: 'hidden',
          background: isBlast
            ? 'linear-gradient(135deg, #0a0500 0%, #1a0800 40%, #0d0400 100%)'
            : BANNERS[c.status] ?? BANNERS.finished,
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', padding: '0 18px',
        }}>
          {isBlast && (
            <>
              {/* Grid */}
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,107,0,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,107,0,.05) 1px,transparent 1px)', backgroundSize: '24px 24px' }} />
              {/* Glow */}
              <div style={{ position: 'absolute', top: -20, left: '30%', width: 200, height: 100, background: 'radial-gradient(ellipse, rgba(255,107,0,.15), transparent 70%)', pointerEvents: 'none' }} />
              {/* BLAST text */}
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div className="font-condensed" style={{ fontWeight: 900, fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(255,107,0,.7)', marginBottom: 2 }}>
                  BLAST PREMIER
                </div>
                <div className="font-condensed text-gradient-orange" style={{ fontWeight: 900, fontSize: 22, letterSpacing: '.04em', textTransform: 'uppercase', lineHeight: 1 }}>
                  Bounty 2026
                </div>
                <div className="font-condensed" style={{ fontWeight: 700, fontSize: 13, color: 'rgba(255,200,50,.8)', letterSpacing: '.1em', marginTop: 2 }}>
                  SEASON 2 · MALTA
                </div>
              </div>
              {/* Trophy */}
              <div style={{ position: 'absolute', right: 50, top: '50%', transform: 'translateY(-50%)', fontSize: 52, opacity: .15, filter: 'blur(1px)' }}>🏆</div>
            </>
          )}
          {!isBlast && (
            <div style={{ fontSize: 40, margin: '0 auto' }}>🏆</div>
          )}
          <span style={{
            position: 'absolute', top: 10, right: 10,
            fontSize: 10, fontWeight: 700, letterSpacing: '.07em',
            padding: '3px 9px', borderRadius: 20,
          }}
            className={s.cls}
          >
            {s.dot && <span style={{ display:'inline-block', width:6, height:6, borderRadius:'50%', background:'currentColor', marginRight:5, animation:'blink .9s ease-in-out infinite', verticalAlign:'middle' }} />}
            {s.label}
          </span>
        </div>

        {/* Body */}
        <div style={{ padding: '14px 16px' }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 4 }}>
            BLAST Premier
          </p>
          <h3 className="font-condensed" style={{ fontWeight: 900, fontSize: 19, color: 'var(--white)', letterSpacing: '.03em', marginBottom: 10 }}>
            {c.name}
          </h3>

          <div style={{ display: 'flex', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 2 }}>Orçamento</div>
              <div className="font-tech" style={{ fontSize: 14, fontWeight: 700, color: 'var(--white)' }}>
                {c.initial_lc.toLocaleString('pt-BR')} LC
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 2 }}>Jogadores</div>
              <div className="font-tech" style={{ fontSize: 14, fontWeight: 700, color: 'var(--white)' }}>5 por lineup</div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="font-tech" style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold)' }}>
              32 times · 160 jogadores
            </span>
            <Link
              href={`/fantasy/${c.id}/mercado`}
              className="btn-green"
              style={{ borderRadius: 7, padding: '6px 14px', fontSize: 12, fontWeight: 700, textDecoration: 'none', fontFamily: 'inherit', letterSpacing: '.04em' }}
            >
              {c.status === 'finished' ? 'Ver resultado' : 'Montar lineup'}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AppLayout>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 20px' }} className="page-animate">

        <div style={{ marginBottom: 24 }}>
          <h1 className="font-condensed" style={{ fontWeight: 900, fontSize: 26, color: 'var(--white)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 3 }}>
            Fantasy Oficial
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
