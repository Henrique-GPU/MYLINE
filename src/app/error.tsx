'use client'

import Link from 'next/link'

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, flexDirection: 'column', gap: 16, textAlign: 'center' }}>
      <div style={{ fontSize: 48 }}>⚠️</div>
      <h2 className="font-condensed" style={{ fontWeight: 900, fontSize: 24, color: 'var(--white)', textTransform: 'uppercase' }}>
        Algo deu errado
      </h2>
      <p style={{ fontSize: 13, color: 'var(--text3)', maxWidth: 400 }}>
        Ocorreu um erro inesperado. Tente novamente ou volte para a Arena.
      </p>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={reset} className="btn-green" style={{ padding: '10px 20px', borderRadius: 9, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700 }}>
          Tentar novamente
        </button>
        <Link href="/dashboard" style={{ padding: '10px 20px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 9, color: 'var(--text2)', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
          Ir para Arena
        </Link>
      </div>
    </div>
  )
}
