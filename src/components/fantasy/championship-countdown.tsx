'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Props {
  championshipId: string
  championshipName: string
  startDate: string // 'YYYY-MM-DD'
  accentColor: string
  prize: string
  location: string
  flagEmoji: string
}

function pad(n: number) { return String(n).padStart(2, '0') }

export function ChampionshipCountdown({
  championshipId, championshipName, startDate,
  accentColor, prize, location, flagEmoji
}: Props) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const target = new Date(startDate + 'T14:00:00Z').getTime() // começa às 14h UTC
  const diff   = Math.max(0, target - now)

  const days  = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const mins  = Math.floor((diff % 3600000) / 60000)
  const secs  = Math.floor((diff % 60000) / 1000)

  const started = diff === 0

  return (
    <div style={{
      background: `linear-gradient(135deg, #02010a, #100300 60%, ${accentColor}15)`,
      border: `1px solid ${accentColor}30`,
      borderRadius: 16, overflow: 'hidden', marginBottom: 24,
      boxShadow: `0 0 40px ${accentColor}10`,
      position: 'relative',
    }}>
      {/* Grid background */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${accentColor}06 1px,transparent 1px),linear-gradient(90deg,${accentColor}06 1px,transparent 1px)`, backgroundSize: '32px 32px' }} />
      {/* Glow */}
      <div style={{ position: 'absolute', bottom: -20, left: '50%', transform: 'translateX(-50%)', width: '80%', height: 80, background: `radial-gradient(ellipse, ${accentColor}35, transparent 70%)` }} />

      <div style={{ position: 'relative', zIndex: 1, padding: '24px 28px', display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'center' }}>
        <div>
          {/* Label */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `${accentColor}15`, border: `1px solid ${accentColor}30`, borderRadius: 20, padding: '4px 12px', marginBottom: 12 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: accentColor, display: 'inline-block', animation: 'blink 1.2s ease-in-out infinite' }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: accentColor }}>
              {started ? 'AO VIVO AGORA' : 'PRÓXIMO CAMPEONATO'}
            </span>
          </div>

          <h2 className="font-condensed" style={{ fontWeight: 900, fontSize: 'clamp(20px,3vw,32px)', color: '#fff', textTransform: 'uppercase', letterSpacing: '.02em', marginBottom: 8, lineHeight: .95 }}>
            {championshipName}
          </h2>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            {[
              { icon: flagEmoji, text: location },
              { icon: '💰', text: prize },
              { icon: '📅', text: `Início: ${new Date(startDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}` },
            ].map(p => (
              <div key={p.text} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text2)', fontWeight: 600 }}>
                <span>{p.icon}</span>{p.text}
              </div>
            ))}
          </div>
        </div>

        {/* Countdown */}
        <div style={{ textAlign: 'center' }}>
          {started ? (
            <div>
              <div className="font-condensed" style={{ fontWeight: 900, fontSize: 28, color: accentColor, textTransform: 'uppercase' }}>AO VIVO!</div>
              <Link href={`/fantasy/${championshipId}/mercado`} className="btn-green" style={{ display: 'inline-flex', marginTop: 8, borderRadius: 9, padding: '10px 20px', fontSize: 13, fontWeight: 900, textDecoration: 'none', fontFamily: 'inherit', letterSpacing: '.06em', textTransform: 'uppercase' }}>
                ⚡ Entrar
              </Link>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 8 }}>
                Começa em
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                {[
                  { v: days,  l: 'dias' },
                  { v: hours, l: 'hrs' },
                  { v: mins,  l: 'min' },
                  { v: secs,  l: 'seg' },
                ].map(({ v, l }) => (
                  <div key={l} style={{ textAlign: 'center' }}>
                    <div style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}25`, borderRadius: 8, padding: '8px 10px', minWidth: 48 }}>
                      <div className="font-tech" style={{ fontSize: 26, fontWeight: 700, color: accentColor, lineHeight: 1 }}>{pad(v)}</div>
                    </div>
                    <div style={{ fontSize: 9, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', marginTop: 4 }}>{l}</div>
                  </div>
                ))}
              </div>
              <Link href={`/fantasy/${championshipId}`} style={{ display: 'inline-block', marginTop: 14, padding: '9px 20px', background: `linear-gradient(90deg,${accentColor},${accentColor}cc)`, color: '#000', fontFamily: 'inherit', fontWeight: 900, fontSize: 12, letterSpacing: '.06em', textTransform: 'uppercase', textDecoration: 'none', borderRadius: 9 }}>
                🔥 Montar Lineup
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
