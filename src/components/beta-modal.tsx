'use client'

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'myline_beta_seen_v1'

export function BetaModal() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const seen = localStorage.getItem(STORAGE_KEY)
    if (!seen) setVisible(true)
  }, [])

  function close() {
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      onClick={e => e.target === e.currentTarget && close()}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(2,1,10,.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
        animation: 'fadein .3s ease',
      }}
    >
      <div style={{
        width: '100%', maxWidth: 520,
        background: '#090e1a',
        border: '1px solid #1e2d42',
        borderRadius: 18,
        overflow: 'hidden',
        boxShadow: '0 0 60px rgba(0,240,117,.12), 0 24px 48px rgba(0,0,0,.6)',
        position: 'relative',
      }}>
        {/* Top accent */}
        <div style={{ height: 3, background: 'linear-gradient(90deg, #00f075, #00d4ff, #8b5cf6)' }} />

        {/* Close */}
        <button
          onClick={close}
          style={{
            position: 'absolute', top: 16, right: 16, zIndex: 1,
            width: 28, height: 28, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: 'rgba(255,255,255,.06)', color: '#5a6e90', fontSize: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'inherit', transition: 'all .15s',
          }}
        >✕</button>

        <div style={{ padding: '24px 28px 0' }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(245,158,11,.1)', border: '1px solid rgba(245,158,11,.25)', borderRadius: 20, padding: '4px 12px', marginBottom: 16 }}>
            <span style={{ fontSize: 12 }}>🚧</span>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: '#f59e0b' }}>BETA FECHADA</span>
          </div>

          <h2 className="font-condensed" style={{ fontWeight: 900, fontSize: 26, color: '#eef2ff', textTransform: 'uppercase', letterSpacing: '.04em', lineHeight: .95, marginBottom: 12 }}>
            Bem-vindo ao<br /><span style={{ background: 'linear-gradient(90deg,#00f075,#00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>MyLine CS2</span>
          </h2>

          <p style={{ fontSize: 13, color: '#5a6e90', lineHeight: 1.65, marginBottom: 20 }}>
            Você está acessando uma das primeiras versões públicas do MyLine. Nosso objetivo é criar a melhor experiência Fantasy de Counter-Strike do mundo.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            {/* Disponível */}
            <div style={{ background: '#05080f', border: '1px solid #172030', borderRadius: 10, padding: '14px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#00f075', marginBottom: 10 }}>✅ Disponível</div>
              {['Login Steam', 'Campeonatos Oficiais', 'Mercado de Jogadores', 'Sistema de Lineups', 'Confrontos da Rodada'].map(f => (
                <div key={f} style={{ fontSize: 12, color: '#c8d4e8', marginBottom: 5, display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ color: '#00f075', fontSize: 10 }}>✓</span> {f}
                </div>
              ))}
            </div>
            {/* Em dev */}
            <div style={{ background: '#05080f', border: '1px solid #172030', borderRadius: 10, padding: '14px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#f59e0b', marginBottom: 10 }}>🚀 Em breve</div>
              {['Ligas Privadas', 'Campeonatos Amadores', 'Rankings Avançados', 'Estatísticas Premium', 'Comunidade'].map(f => (
                <div key={f} style={{ fontSize: 12, color: '#5a6e90', marginBottom: 5, display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ color: '#f59e0b', fontSize: 10 }}>→</span> {f}
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'rgba(0,240,117,.04)', border: '1px solid rgba(0,240,117,.15)', borderRadius: 10, padding: '12px 14px', marginBottom: 24 }}>
            <p style={{ fontSize: 12, color: '#5a6e90', lineHeight: 1.65 }}>
              Durante o beta você pode encontrar funcionalidades em desenvolvimento, ajustes de pontuação e mudanças de interface. <strong style={{ color: '#c8d4e8' }}>Seu feedback é o que guia cada decisão.</strong>
            </p>
          </div>
        </div>

        <div style={{ padding: '0 28px 28px' }}>
          <button
            onClick={close}
            className="btn-green"
            style={{
              width: '100%', padding: '14px', borderRadius: 12, border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 15, fontWeight: 900, letterSpacing: '.08em', textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            🔥 Entrar na Beta
          </button>
          <p style={{ textAlign: 'center', fontSize: 11, color: '#38455e', marginTop: 10 }}>
            Nos vemos no topo do ranking. — Equipe MyLine
          </p>
        </div>
      </div>
    </div>
  )
}
