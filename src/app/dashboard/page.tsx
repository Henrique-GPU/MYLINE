import Link from 'next/link'
import { AppLayout } from '@/components/layout/app-layout'

export default function DashboardPage() {
  return (
    <AppLayout>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 20px' }} className="page-animate">

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10, marginBottom: 24 }}>
          {[
            { label: 'Line Coins', value: '100.000', sub: 'Saldo inicial', color: 'linear-gradient(90deg,var(--green),var(--cyan))' },
            { label: 'Posição', value: '—', sub: 'Sem campeonato ativo', color: 'var(--cyan)' },
            { label: 'Pontos', value: '0.0', sub: 'Total acumulado', color: 'var(--yellow)' },
            { label: 'Lineup', value: '0/5', sub: 'Jogadores escalados', color: 'var(--purple)' },
          ].map(card => (
            <div key={card.label} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: card.color }} />
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6 }}>
                {card.label}
              </div>
              <div className="font-condensed font-tech" style={{ fontWeight: 900, fontSize: 24, color: 'var(--white)' }}>
                {card.value}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{card.sub}</div>
            </div>
          ))}
        </div>

        {/* Main cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
          {/* Fantasy */}
          <Link href="/fantasy" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'var(--bg2)', border: '1px solid var(--border)',
              borderRadius: 12, overflow: 'hidden', transition: 'all .2s', cursor: 'pointer',
            }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border2)', e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)', e.currentTarget.style.transform = 'none')}
            >
              <div style={{ height: 3, background: 'linear-gradient(90deg, var(--green), var(--cyan))' }} />
              <div style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ fontSize: 32 }}>🏆</div>
                  <span style={{
                    background: 'rgba(0,240,117,.1)', color: 'var(--green)',
                    border: '1px solid rgba(0,240,117,.25)', borderRadius: 4,
                    padding: '2px 8px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                  }}>Em breve</span>
                </div>
                <h2 className="font-condensed" style={{ fontWeight: 900, fontSize: 20, color: 'var(--white)', textTransform: 'uppercase', letterSpacing: '.03em', marginBottom: 6 }}>
                  Fantasy Oficial
                </h2>
                <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.55, marginBottom: 14 }}>
                  Monte sua lineup com Line Coins e dispute o campeonato.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--green)', fontSize: 13, fontWeight: 700 }}>
                  Ver campeonatos →
                </div>
              </div>
            </div>
          </Link>

          {/* Comunidade */}
          <Link href="/comunidade" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'var(--bg2)', border: '1px solid var(--border)',
              borderRadius: 12, overflow: 'hidden', transition: 'all .2s', cursor: 'pointer',
            }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(249,115,22,.3)', e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)', e.currentTarget.style.transform = 'none')}
            >
              <div style={{ height: 3, background: 'linear-gradient(90deg, var(--orange), var(--gold))' }} />
              <div style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ fontSize: 32 }}>🎮</div>
                  <span style={{
                    background: 'rgba(249,115,22,.1)', color: 'var(--orange)',
                    border: '1px solid rgba(249,115,22,.25)', borderRadius: 4,
                    padding: '2px 8px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                  }}>Disponível</span>
                </div>
                <h2 className="font-condensed" style={{ fontWeight: 900, fontSize: 20, color: 'var(--white)', textTransform: 'uppercase', letterSpacing: '.03em', marginBottom: 6 }}>
                  Comunidade
                </h2>
                <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.55, marginBottom: 14 }}>
                  Crie ou entre em torneios amadores e registre seus resultados.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--orange)', fontSize: 13, fontWeight: 700 }}>
                  Ver torneios →
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </AppLayout>
  )
}
