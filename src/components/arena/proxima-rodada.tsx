'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

interface Props {
  championshipId: string
  championshipName: string
  roundName: string
  accentColor: string
  mercadoHref: string
}

function pad(n: number) { return String(n).padStart(2, '0') }

export function ProximaRodada({ championshipId, championshipName, roundName, accentColor, mercadoHref }: Props) {
  // Simula início em 2h14m a partir de agora
  const [target] = useState(() => Date.now() + 2 * 60 * 60 * 1000 + 14 * 60 * 1000)
  const [mercadoClose] = useState(() => Date.now() + 1 * 60 * 60 * 1000 + 58 * 60 * 1000)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  function countdown(end: number) {
    const diff = Math.max(0, end - now)
    const h = Math.floor(diff / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    const s = Math.floor((diff % 60000) / 1000)
    return { h, m, s }
  }

  const start = countdown(target)
  const close = countdown(mercadoClose)

  return (
    <div style={{
      background: 'var(--bg2)',
      border: `1px solid ${accentColor}30`,
      borderRadius: 14, overflow: 'hidden',
      boxShadow: `0 0 24px ${accentColor}10`,
    }}>
      <div style={{ height: 3, background: `linear-gradient(90deg, ${accentColor}, ${accentColor}88)` }} />
      <div style={{ padding: '16px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: `${accentColor}aa`, marginBottom: 2 }}>
              PRÓXIMA RODADA
            </div>
            <div className="font-condensed" style={{ fontWeight: 900, fontSize: 15, color: 'var(--white)' }}>
              {championshipName.replace('2026','').trim()} · {roundName}
            </div>
          </div>
          <span style={{ background: 'rgba(239,68,68,.12)', color: 'var(--red)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 20, padding: '3px 9px', fontSize: 9, fontWeight: 700, animation: 'blink .9s ease-in-out infinite' }}>
            AO VIVO EM BREVE
          </span>
        </div>

        {/* Countdowns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          {[
            { label: 'Rodada começa em', vals: start, color: accentColor },
            { label: 'Mercado fecha em', vals: close, color: 'var(--red)' },
          ].map(item => (
            <div key={item.label} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>{item.label}</div>
              <div className="font-tech" style={{ fontSize: 22, fontWeight: 700, color: item.color, letterSpacing: '.04em' }}>
                {pad(item.vals.h)}:{pad(item.vals.m)}:{pad(item.vals.s)}
              </div>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
          {[
            { label: 'Jogadores em ação', value: '160' },
            { label: 'Pontuação projetada', value: '~380 pts' },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px' }}>
              <span style={{ fontSize: 10, color: 'var(--text3)' }}>{s.label}</span>
              <span className="font-tech" style={{ fontSize: 12, fontWeight: 700, color: 'var(--white)' }}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link href={mercadoHref} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          width: '100%', padding: '11px',
          background: `linear-gradient(90deg, ${accentColor}, ${accentColor}cc)`,
          color: '#000', fontFamily: 'inherit', fontWeight: 900, fontSize: 13,
          letterSpacing: '.06em', textTransform: 'uppercase', textDecoration: 'none',
          borderRadius: 10, boxShadow: `0 0 16px ${accentColor}30`,
        }}>
          🔥 Editar Lineup antes que feche
        </Link>
      </div>
    </div>
  )
}
