import Link from 'next/link'
import { AppLayout } from '@/components/layout/app-layout'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getEventMeta } from '@/lib/events'

type Championship = {
  id: string
  name: string
  status: string
  initial_lc: number
  banner_url: string | null
  created_at: string
}

const STATUS = {
  active:   { label: 'AO VIVO',   cls: 's-live', dot: true },
  upcoming: { label: 'EM BREVE',  cls: 's-soon', dot: false },
  finished: { label: 'ENCERRADO', cls: 's-done', dot: false },
} as const

export default async function FantasyPage() {
  const supabase = getSupabaseServerClient()
  const { data } = await supabase
    .from('championships')
    .select('id, name, status, initial_lc, banner_url, created_at')
    .order('created_at', { ascending: true })

  const list = (data ?? []) as Championship[]
  const active   = list.filter(c => c.status === 'active')
  const upcoming = list.filter(c => c.status === 'upcoming')
  const finished = list.filter(c => c.status === 'finished')

  function Card({ c }: { c: Championship }) {
    const s = STATUS[c.status as keyof typeof STATUS] ?? STATUS.finished
    const meta = getEventMeta(c.name)
    const isBlast = c.name.toLowerCase().includes('blast')
    const isEWC   = c.name.toLowerCase().includes('esports world cup')
    const isESL   = c.name.toLowerCase().includes('esl')
    const isFissure = c.name.toLowerCase().includes('fissure')
    const accent = meta.accentColor

    // Background gradient by organizer
    const bgGradient = isBlast
      ? 'linear-gradient(180deg,#01000a,#100300 60%,#1f0500)'
      : isEWC
      ? 'linear-gradient(180deg,#010a1f,#001a40 60%,#002060)'
      : isESL
      ? 'linear-gradient(180deg,#0a0800,#1a1200 60%,#2a1f00)'
      : isFissure
      ? 'linear-gradient(180deg,#07010a,#130520 60%,#1f0a30)'
      : `linear-gradient(180deg,#01080f,#001520 60%, #002030)`

    return (
      <div style={{
        background: 'var(--bg2)', border: `1px solid ${accent}25`,
        borderRadius: 16, overflow: 'hidden', transition: 'all .25s',
        boxShadow: `0 4px 24px ${accent}0d`,
      }}
        className="hover-card"
      >
        {/* ── BANNER ── */}
        <div style={{ height: 150, position: 'relative', overflow: 'hidden', background: bgGradient }}>
          {/* Background image for BLAST events */}
          {isBlast && (
            <img src="/api/img/blast" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%', opacity: .45 }} />
          )}
          {/* Color overlay */}
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, rgba(1,0,10,.2) 0%, transparent 40%, rgba(1,0,10,.88) 100%)` }} />
          {/* Bottom glow */}
          <div style={{ position: 'absolute', bottom: -10, left: '50%', transform: 'translateX(-50%)', width: '100%', height: 70, background: `radial-gradient(ellipse 70% 100% at 50% 100%, ${accent}55, transparent)`, animation: 'arena-glow 3s ease-in-out infinite' }} />
          {/* Grid lines */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${accent}08 1px,transparent 1px),linear-gradient(90deg,${accent}08 1px,transparent 1px)`, backgroundSize: '24px 24px' }} />

          {/* Status */}
          <span className={s.cls} style={{ position: 'absolute', top: 12, left: 14, fontSize: 10, fontWeight: 700, letterSpacing: '.08em', padding: '4px 10px', borderRadius: 20 }}>
            {s.dot && <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: 'currentColor', marginRight: 5, animation: 'blink .9s ease-in-out infinite', verticalAlign: 'middle' }} />}
            {s.label}
          </span>

          {/* Prize pool */}
          <div style={{ position: 'absolute', top: 12, right: 14, background: `${accent}18`, border: `1px solid ${accent}35`, borderRadius: 20, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: 10 }}>💰</span>
            <span className="font-tech" style={{ fontSize: 11, fontWeight: 700, color: meta.prize.includes('2,000') ? '#00d4ff' : meta.prize.includes('1,1') ? '#ff6b00' : 'var(--gold)' }}>{meta.prize}</span>
          </div>

          {/* Event title in banner */}
          <div style={{ position: 'absolute', bottom: 14, left: 16, right: 16, zIndex: 2 }}>
            <div className="font-condensed" style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.22em', textTransform: 'uppercase', color: `${accent}bb`, marginBottom: 3 }}>
              {meta.org.toUpperCase()}
            </div>
            <h3 className="font-condensed" style={{ fontWeight: 900, fontSize: 22, color: '#fff', letterSpacing: '.02em', textTransform: 'uppercase', lineHeight: .95, textShadow: '0 2px 8px rgba(0,0,0,.7)' }}>
              {c.name.replace('2026', '').replace('Season', 'S').trim()}
            </h3>
          </div>
        </div>

        {/* ── BODY ── */}
        <div style={{ padding: '14px 16px 16px' }}>
          {/* Info pills */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            {[
              { icon: meta.flagEmoji, text: `${meta.location} · ${meta.dates}` },
              { icon: '🛡️', text: `${meta.teams} times` },
              { icon: '💎', text: `${c.initial_lc.toLocaleString('pt-BR')} LC` },
            ].map(pill => (
              <div key={pill.text} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 20, padding: '4px 10px' }}>
                <span style={{ fontSize: 11 }}>{pill.icon}</span>
                <span style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 600 }}>{pill.text}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Link
            href={`/fantasy/${c.id}/mercado`}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', padding: '11px',
              background: c.status === 'finished' ? 'var(--bg3)' : `linear-gradient(90deg, ${accent}, ${isBlast ? '#ff9500' : accent}cc)`,
              color: c.status === 'finished' ? 'var(--text2)' : '#000',
              fontFamily: 'inherit', fontWeight: 900, fontSize: 13,
              letterSpacing: '.06em', textTransform: 'uppercase', textDecoration: 'none',
              borderRadius: 10, border: c.status === 'finished' ? '1px solid var(--border)' : 'none',
              boxShadow: c.status !== 'finished' ? `0 0 20px ${accent}35` : 'none',
            }}
          >
            {c.status !== 'finished' && <span style={{ fontSize: 14 }}>⚡</span>}
            {c.status === 'finished' ? 'Ver resultado' : c.status === 'active' ? 'Entrar agora' : 'Montar lineup'}
          </Link>
          {c.status !== 'finished' && (
            <Link href={`/fantasy/${c.id}/ranking`} style={{ display: 'block', textAlign: 'center', marginTop: 8, fontSize: 11, color: 'var(--text3)', textDecoration: 'none', fontWeight: 600 }}>
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

        <div style={{ marginBottom: 28 }}>
          <h1 className="font-condensed" style={{ fontWeight: 900, fontSize: 26, color: 'var(--white)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 3 }}>
            Campeonatos Oficiais
          </h1>
          <p style={{ color: 'var(--text3)', fontSize: 13 }}>
            Monte sua lineup com 100.000 LC e dispute o ranking nos maiores eventos do CS2
          </p>
        </div>

        {list.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text3)', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12 }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🏆</div>
            <p style={{ fontSize: 14, color: 'var(--text2)' }}>Nenhum campeonato disponível.</p>
          </div>
        )}

        {active.length > 0 && (
          <section style={{ marginBottom: 32 }}>
            <p className="font-condensed" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red)', display: 'inline-block', animation: 'blink .9s ease-in-out infinite' }} />
              AO VIVO <span style={{ flex: 1, height: 1, background: 'var(--border)', display: 'block' }} />
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: 14 }}>
              {active.map(c => <Card key={c.id} c={c} />)}
            </div>
          </section>
        )}

        {upcoming.length > 0 && (
          <section style={{ marginBottom: 32 }}>
            <p className="font-condensed" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
              PRÓXIMOS EVENTOS <span style={{ flex: 1, height: 1, background: 'var(--border)', display: 'block' }} />
              <span style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 400 }}>{upcoming.length} eventos</span>
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: 14 }}>
              {upcoming.map(c => <Card key={c.id} c={c} />)}
            </div>
          </section>
        )}

        {finished.length > 0 && (
          <section>
            <p className="font-condensed" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
              ENCERRADOS <span style={{ flex: 1, height: 1, background: 'var(--border)', display: 'block' }} />
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: 14 }}>
              {finished.map(c => <Card key={c.id} c={c} />)}
            </div>
          </section>
        )}
      </div>
    </AppLayout>
  )
}
