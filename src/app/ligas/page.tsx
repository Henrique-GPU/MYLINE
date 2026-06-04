'use client'

import Link from 'next/link'
import { AppLayout } from '@/components/layout/app-layout'

const MINHAS_LIGAS = [
  { id: '1', name: 'Amigos do CS',   position: 3,  participants: 18, premium: false, pts: 1240 },
  { id: '2', name: 'Empresa XPTO',   position: 1,  participants: 27, premium: true,  pts: 1890 },
  { id: '3', name: 'Arena dos Pratas', position: 5, participants: 41, premium: true,  pts: 980 },
]

const LIGAS_PUBLICAS = [
  { id: '4', name: 'Liga Brasil CS2',  participants: 342, open: true,  premio: 'R$ 500', premium: true },
  { id: '5', name: 'Top Rifles BR',    participants: 89,  open: true,  premio: 'Skins',  premium: false },
  { id: '6', name: 'Invitational S1',  participants: 16,  open: false, premio: 'R$ 200', premium: false },
]

export default function LigasPage() {
  return (
    <AppLayout>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '28px 20px' }} className="page-animate">

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <h1 className="font-condensed" style={{ fontWeight: 900, fontSize: 26, color: 'var(--white)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 3 }}>
              Suas Ligas
            </h1>
            <p style={{ color: 'var(--text3)', fontSize: 13 }}>Dispute com amigos, colegas e a comunidade</p>
          </div>
          <Link href="/ligas/criar" className="btn-green" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 900, textDecoration: 'none', fontFamily: 'inherit', letterSpacing: '.06em', textTransform: 'uppercase' }}>
            ➕ Criar Liga
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

          {/* ── MINHAS LIGAS ── */}
          <div>
            <p className="font-condensed" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              MINHAS LIGAS <span style={{ flex: 1, height: 1, background: 'var(--border)', display: 'block' }} />
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {MINHAS_LIGAS.map(liga => (
                <div key={liga.id} style={{
                  background: 'var(--bg2)', border: `1px solid ${liga.premium ? 'rgba(255,200,50,.2)' : 'var(--border)'}`,
                  borderRadius: 12, overflow: 'hidden', transition: 'all .2s',
                }} className="hover-card hover-card-green">
                  {liga.premium && <div style={{ height: 2, background: 'linear-gradient(90deg,var(--gold),var(--yellow))' }} />}
                  <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                      background: liga.position === 1 ? 'rgba(255,200,50,.15)' : 'var(--bg3)',
                      border: `1px solid ${liga.position === 1 ? 'rgba(255,200,50,.3)' : 'var(--border)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: liga.position === 1 ? 20 : 16,
                    }}>
                      {liga.position === 1 ? '🏆' : liga.position <= 3 ? '🥈' : '🎮'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                        <span className="font-condensed" style={{ fontWeight: 900, fontSize: 15, color: 'var(--white)', letterSpacing: '.03em' }}>{liga.name}</span>
                        {liga.premium && <span style={{ fontSize: 8, fontWeight: 700, color: 'var(--gold)', background: 'rgba(255,200,50,.1)', border: '1px solid rgba(255,200,50,.25)', borderRadius: 4, padding: '1px 5px', letterSpacing: '.06em' }}>PREMIUM</span>}
                      </div>
                      <div style={{ display: 'flex', gap: 10, fontSize: 11, color: 'var(--text3)' }}>
                        <span>👥 {liga.participants} participantes</span>
                        <span className="font-tech" style={{ color: 'var(--white)' }}>{liga.pts.toLocaleString('pt-BR')} pts</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="font-condensed" style={{ fontWeight: 900, fontSize: 22, color: liga.position === 1 ? 'var(--gold)' : liga.position <= 3 ? 'var(--green)' : 'var(--text2)' }}>
                        #{liga.position}
                      </div>
                      <div style={{ fontSize: 9, color: 'var(--text3)' }}>posição</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Ligas públicas */}
            <p className="font-condensed" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text3)', margin: '20px 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
              LIGAS PÚBLICAS <span style={{ flex: 1, height: 1, background: 'var(--border)', display: 'block' }} />
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {LIGAS_PUBLICAS.map(liga => (
                <div key={liga.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10 }}
                  className="hover-card hover-card-green">
                  <span style={{ fontSize: 16 }}>🏆</span>
                  <div style={{ flex: 1 }}>
                    <div className="font-condensed" style={{ fontWeight: 800, fontSize: 14, color: 'var(--white)' }}>{liga.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text3)' }}>👥 {liga.participants} · 🏆 {liga.premio}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {liga.premium && <span style={{ fontSize: 8, color: 'var(--gold)', background: 'rgba(255,200,50,.1)', border: '1px solid rgba(255,200,50,.25)', borderRadius: 4, padding: '1px 5px' }}>PREMIUM</span>}
                    <span style={{
                      fontSize: 9, fontWeight: 700, borderRadius: 20, padding: '3px 8px',
                      background: liga.open ? 'rgba(0,240,117,.1)' : 'rgba(255,255,255,.04)',
                      color: liga.open ? 'var(--green)' : 'var(--text3)',
                      border: `1px solid ${liga.open ? 'rgba(0,240,117,.25)' : 'var(--border)'}`,
                    }}>{liga.open ? 'ABERTA' : 'FECHADA'}</span>
                    {liga.open && (
                      <button style={{ padding: '5px 10px', background: 'linear-gradient(90deg,var(--green),var(--cyan))', color: '#000', border: 'none', borderRadius: 6, fontSize: 10, fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit' }}>
                        Entrar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── PLANOS ── */}
          <div>
            <p className="font-condensed" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              PLANOS <span style={{ flex: 1, height: 1, background: 'var(--border)', display: 'block' }} />
            </p>

            {/* Free */}
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px', marginBottom: 12 }}>
              <div className="font-condensed" style={{ fontWeight: 900, fontSize: 18, color: 'var(--white)', textTransform: 'uppercase', marginBottom: 4 }}>Gratuito</div>
              <div className="font-tech" style={{ fontSize: 28, fontWeight: 700, color: 'var(--white)', marginBottom: 12 }}>R$ 0</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                {['Até 10 participantes por liga', 'Ranking simples', 'Campeonatos oficiais', '1 liga ativa'].map(f => (
                  <div key={f} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: 'var(--text2)' }}>
                    <span style={{ color: 'var(--green)', fontWeight: 700 }}>✓</span> {f}
                  </div>
                ))}
              </div>
              <div style={{ padding: '8px', background: 'var(--bg3)', borderRadius: 8, textAlign: 'center', fontSize: 12, color: 'var(--text3)', fontWeight: 600 }}>
                Plano atual
              </div>
            </div>

            {/* Premium */}
            <div style={{ background: 'var(--bg2)', border: '2px solid rgba(255,200,50,.35)', borderRadius: 14, padding: '20px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ height: 3, background: 'linear-gradient(90deg,var(--gold),var(--yellow))', margin: '-20px -20px 16px', borderRadius: '14px 14px 0 0' }} />
              {/* Popular badge */}
              <div style={{ position: 'absolute', top: 20, right: 16, background: 'linear-gradient(90deg,var(--gold),var(--yellow))', color: '#000', fontSize: 9, fontWeight: 900, borderRadius: 20, padding: '3px 10px', letterSpacing: '.08em', textTransform: 'uppercase' }}>
                MAIS POPULAR
              </div>
              <div className="font-condensed" style={{ fontWeight: 900, fontSize: 18, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 4 }}>⭐ Premium</div>
              <div style={{ marginBottom: 12 }}>
                <span className="font-tech" style={{ fontSize: 28, fontWeight: 700, color: 'var(--white)' }}>R$ 9,90</span>
                <span style={{ fontSize: 12, color: 'var(--text3)' }}>/mês</span>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>ou R$ 49,90 por temporada — <span style={{ color: 'var(--green)' }}>economize 58%</span></div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                {[
                  'Até 100 participantes', 'Logo e banner personalizado', 'Histórico completo',
                  'Mata-mata e grupos', 'Premiações reais', 'Estatísticas avançadas',
                  'Chat exclusivo da liga', 'Ligas ilimitadas',
                ].map(f => (
                  <div key={f} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: 'var(--text2)' }}>
                    <span style={{ color: 'var(--gold)', fontWeight: 700 }}>★</span> {f}
                  </div>
                ))}
              </div>
              <button className="btn-orange" style={{
                width: '100%', padding: '12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 13, fontWeight: 900, letterSpacing: '.06em', textTransform: 'uppercase',
              }}>
                🚀 Assinar Premium
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
