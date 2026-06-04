import Link from 'next/link'

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Topbar */}
      <header style={{
        height: 58,
        background: 'rgba(5,8,15,.97)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(14px)',
        display: 'flex', alignItems: 'center',
        padding: '0 20px', gap: 12,
        position: 'sticky', top: 0, zIndex: 300,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', marginRight: 'auto' }}>
          <span className="font-condensed text-gradient-green" style={{ fontWeight: 900, fontSize: 20, letterSpacing: '.06em', textTransform: 'uppercase', lineHeight: 1 }}>
            MyLine
          </span>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text3)' }}>CS2</span>
        </div>
        <Link href="/login" style={{ color: 'var(--text2)', fontSize: 13, fontWeight: 600, textDecoration: 'none', padding: '7px 12px' }}>
          Entrar
        </Link>
        <Link href="/signup" className="btn-orange" style={{
          display: 'inline-flex', alignItems: 'center', borderRadius: 8,
          padding: '7px 16px', fontSize: 12, fontWeight: 900, textDecoration: 'none',
          fontFamily: 'inherit', letterSpacing: '.06em', textTransform: 'uppercase',
        }}>
          Criar Conta
        </Link>
      </header>

      {/* Hero */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        padding: '72px 20px 64px',
        background: 'linear-gradient(180deg, #09060f 0%, var(--bg) 100%)',
        borderBottom: '1px solid var(--border)',
      }}>
        {/* Grid background */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(0,240,117,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,240,117,.04) 1px,transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse 100% 100% at 50% 0%, black 20%, transparent 80%)',
        }} />
        {/* Glow */}
        <div style={{
          position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 300,
          background: 'radial-gradient(ellipse, rgba(0,240,117,.08), transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: 'rgba(0,240,117,.08)', border: '1px solid rgba(0,240,117,.25)',
            borderRadius: 20, padding: '5px 16px', marginBottom: 20,
            fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--green)',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', animation: 'blink 1.2s ease-in-out infinite' }} />
            Temporada 2026 · BLAST Bounty S2
          </div>

          <h1 className="font-condensed" style={{
            fontWeight: 900,
            fontSize: 'clamp(42px,8vw,80px)',
            letterSpacing: '.02em', textTransform: 'uppercase',
            lineHeight: .9, marginBottom: 18, color: 'var(--white)',
          }}>
            O Fantasy do{' '}
            <span className="text-gradient-green">CS2</span>
            <br />Brasileiro
          </h1>

          <p style={{ fontSize: 16, color: 'var(--text2)', lineHeight: 1.65, maxWidth: 480, margin: '0 auto 32px', }}>
            Monte sua lineup com <strong style={{ color: 'var(--green)' }}>100.000 Line Coins</strong>, pontue com as stats reais do HLTV e dispute o ranking com a comunidade.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup" className="btn-green" style={{
              display: 'inline-flex', alignItems: 'center', borderRadius: 8,
              padding: '12px 28px', fontSize: 14, fontWeight: 900, textDecoration: 'none',
              fontFamily: 'inherit', letterSpacing: '.06em', textTransform: 'uppercase',
            }}>
              Começar grátis →
            </Link>
            <Link href="/login" style={{
              display: 'inline-flex', alignItems: 'center', borderRadius: 8,
              padding: '12px 24px', fontSize: 14, fontWeight: 600, textDecoration: 'none',
              fontFamily: 'inherit', color: 'var(--text2)',
              border: '1px solid var(--border2)', transition: 'all .15s',
            }}>
              Já tenho conta
            </Link>
          </div>
        </div>
      </section>

      {/* Modes */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 20px' }}>
        <p className="font-condensed" style={{
          textAlign: 'center', fontSize: 11, fontWeight: 700,
          letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 28,
        }}>
          Duas frentes — uma plataforma
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
          {/* Fantasy card */}
          <div style={{
            background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: 12, overflow: 'hidden', transition: 'all .2s',
          }}>
            <div style={{ height: 3, background: 'linear-gradient(90deg, var(--green), var(--cyan))' }} />
            <div style={{ padding: '20px 22px' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🏆</div>
              <h2 className="font-condensed" style={{ fontWeight: 900, fontSize: 22, color: 'var(--white)', letterSpacing: '.03em', marginBottom: 8, textTransform: 'uppercase' }}>
                Fantasy Oficial
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 16 }}>
                Cartola CS2 — monte lineups com Line Coins, acompanhe a valorização dos jogadores e suba no ranking a cada rodada.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {['Line Coins', '5 jogadores', 'Capitão', 'Ranking'].map(t => (
                  <span key={t} style={{
                    background: 'rgba(0,240,117,.08)', color: 'var(--green)',
                    border: '1px solid rgba(0,240,117,.2)', borderRadius: 4,
                    padding: '2px 8px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em',
                  }}>{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Community card */}
          <div style={{
            background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: 12, overflow: 'hidden', transition: 'all .2s',
          }}>
            <div style={{ height: 3, background: 'linear-gradient(90deg, var(--orange), var(--gold))' }} />
            <div style={{ padding: '20px 22px' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🎮</div>
              <h2 className="font-condensed" style={{ fontWeight: 900, fontSize: 22, color: 'var(--white)', letterSpacing: '.03em', marginBottom: 8, textTransform: 'uppercase' }}>
                Comunidade
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 16 }}>
                Crie ou entre em torneios amadores, registre resultados e acompanhe a tabela de classificação do seu campeonato.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {['Sem LC', 'BO1/BO3/BO5', 'Stats por mapa', 'Classificação'].map(t => (
                  <span key={t} style={{
                    background: 'rgba(249,115,22,.08)', color: 'var(--orange)',
                    border: '1px solid rgba(249,115,22,.2)', borderRadius: 4,
                    padding: '2px 8px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em',
                  }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scoring */}
      <section style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '40px 20px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p className="font-condensed" style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '.14em',
            textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10,
          }}>
            Sistema de Pontuação
            <span style={{ flex: 1, height: 1, background: 'var(--border)', display: 'block' }} />
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
            {[
              { label: 'Kill',          pts: '+1.0',  pos: true },
              { label: 'Assistência',   pts: '+0.5',  pos: true },
              { label: 'Morte',         pts: '−0.4',  pos: false },
              { label: 'K/D positivo',  pts: '+2.0',  pos: true },
              { label: 'K/D > 1.5',     pts: '+4.0',  pos: true },
              { label: 'Rating > 1.20', pts: '+5.0',  pos: true },
              { label: 'ADR > 85',      pts: '+3.0',  pos: true },
              { label: 'Clutch',        pts: '+4.0',  pos: true },
              { label: 'Ace',           pts: '+6.0',  pos: true },
              { label: 'MVP',           pts: '+5.0',  pos: true },
              { label: 'Vitória',       pts: '+3.0',  pos: true },
              { label: 'Eliminado',     pts: '−3.0',  pos: false },
            ].map(item => (
              <div key={item.label} style={{
                background: 'var(--bg3)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '8px 12px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontSize: 12, color: 'var(--text2)' }}>{item.label}</span>
                <span className="font-tech" style={{ fontSize: 13, fontWeight: 700, color: item.pos ? 'var(--green)' : 'var(--red)' }}>
                  {item.pts}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '20px', textAlign: 'center', fontSize: 12, color: 'var(--text3)', borderTop: '1px solid var(--border)' }}>
        MyLine CS2 © 2026 — Dados via HLTV
      </footer>
    </div>
  )
}
