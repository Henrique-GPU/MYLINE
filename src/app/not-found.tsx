import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, flexDirection: 'column', gap: 16, textAlign: 'center' }}>
      <div className="font-condensed text-gradient-green" style={{ fontWeight: 900, fontSize: 80, letterSpacing: '.04em', lineHeight: 1 }}>404</div>
      <h2 className="font-condensed" style={{ fontWeight: 900, fontSize: 24, color: 'var(--white)', textTransform: 'uppercase' }}>
        Página não encontrada
      </h2>
      <p style={{ fontSize: 13, color: 'var(--text3)' }}>Esta página não existe ou foi movida.</p>
      <Link href="/dashboard" className="btn-green" style={{ padding: '10px 24px', borderRadius: 9, fontSize: 13, fontWeight: 700, textDecoration: 'none', fontFamily: 'inherit', letterSpacing: '.06em', textTransform: 'uppercase' }}>
        Voltar para Arena
      </Link>
    </div>
  )
}
