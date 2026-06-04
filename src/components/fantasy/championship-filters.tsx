'use client'

import { useState } from 'react'

const FILTERS = [
  { key: 'all',       label: 'Todos' },
  { key: 'active',    label: '🔴 Ao Vivo' },
  { key: 'upcoming',  label: '🟡 Em Breve' },
  { key: 'finished',  label: '✅ Encerrados' },
  { key: 'mine',      label: '⭐ Minha Lineup' },
]

interface Props {
  onFilter: (key: string) => void
  counts: Record<string, number>
}

export function ChampionshipFilters({ onFilter, counts }: Props) {
  const [active, setActive] = useState('all')

  function select(key: string) {
    setActive(key)
    onFilter(key)
  }

  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
      {FILTERS.map(f => (
        <button
          key={f.key}
          onClick={() => select(f.key)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', borderRadius: 20, cursor: 'pointer', fontFamily: 'inherit',
            fontSize: 12, fontWeight: active === f.key ? 700 : 500, transition: 'all .15s',
            background: active === f.key ? 'rgba(0,240,117,.1)' : 'var(--bg2)',
            color: active === f.key ? 'var(--green)' : 'var(--text2)',
            border: active === f.key ? '1px solid rgba(0,240,117,.3)' : '1px solid var(--border)',
          }}
        >
          {f.label}
          {counts[f.key] !== undefined && (
            <span style={{
              fontSize: 10, fontWeight: 700, minWidth: 18, height: 18, borderRadius: 9,
              background: active === f.key ? 'rgba(0,240,117,.2)' : 'var(--bg3)',
              color: active === f.key ? 'var(--green)' : 'var(--text3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px',
            }}>
              {counts[f.key]}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
