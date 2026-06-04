'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

interface Props {
  championshipId: string
  roundId: string
  mercadoHref: string
}

type Slot = {
  nickname: string
  role: string | null
  price_lc: number
  is_captain: boolean
}

export function MinhaLineup({ championshipId, roundId, mercadoHref }: Props) {
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data: lineup } = await supabase
        .from('lineups')
        .select('id')
        .eq('user_id', user.id)
        .eq('round_id', roundId)
        .single()

      if (!lineup) { setLoading(false); return }

      const { data: lps } = await supabase
        .from('lineup_players')
        .select('player_id, is_captain')
        .eq('lineup_id', lineup.id)

      if (!lps?.length) { setLoading(false); return }

      const { data: players } = await supabase
        .from('players')
        .select('id, nickname, role, price_lc')
        .in('id', lps.map(l => l.player_id))

      const combined: Slot[] = (players ?? []).map(p => ({
        nickname: p.nickname,
        role: p.role,
        price_lc: p.price_lc ?? 0,
        is_captain: lps.find(l => l.player_id === p.id)?.is_captain ?? false,
      })).sort((a, b) => (b.is_captain ? 1 : 0) - (a.is_captain ? 1 : 0))

      setSlots(combined)
      setLoading(false)
    }
    load()
  }, [roundId])

  const totalValue = slots.reduce((s, p) => s + p.price_lc, 0)
  const budget = 100_000
  const remaining = budget - totalValue

  const ROLE_COLOR: Record<string, string> = { awper: '#f59e0b', igl: '#8b5cf6', entry: '#ef4444', support: '#1e7fff', rifler: '#5a6e90' }

  if (loading) {
    return (
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text3)', fontSize: 12 }}>Carregando lineup...</p>
      </div>
    )
  }

  if (slots.length === 0) {
    return (
      <div style={{ background: 'var(--bg2)', border: '1px solid rgba(0,240,117,.15)', borderRadius: 14, padding: '20px', textAlign: 'center' }}>
        <div style={{ height: 3, background: 'linear-gradient(90deg,var(--green),var(--cyan))', margin: '-20px -20px 16px', borderRadius: '14px 14px 0 0' }} />
        <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
        <p className="font-condensed" style={{ fontWeight: 900, fontSize: 16, color: 'var(--white)', textTransform: 'uppercase', marginBottom: 6 }}>Minha Lineup</p>
        <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16 }}>Você ainda não montou sua lineup para esta rodada.</p>
        <Link href={mercadoHref} className="btn-green" style={{ display: 'inline-flex', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 900, textDecoration: 'none', fontFamily: 'inherit', letterSpacing: '.06em', textTransform: 'uppercase' }}>
          🔥 Montar agora
        </Link>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid rgba(0,240,117,.2)', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ height: 3, background: 'linear-gradient(90deg,var(--green),var(--cyan))' }} />
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <p className="font-condensed" style={{ fontWeight: 900, fontSize: 15, color: 'var(--white)', textTransform: 'uppercase' }}>⭐ Minha Lineup</p>
          <Link href={mercadoHref} style={{ fontSize: 11, color: 'var(--green)', textDecoration: 'none', fontWeight: 700 }}>Editar →</Link>
        </div>

        {/* Players */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
          {slots.map(p => {
            const color = ROLE_COLOR[p.role ?? ''] ?? '#5a6e90'
            return (
              <div key={p.nickname} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: p.is_captain ? 'rgba(255,200,50,.06)' : 'var(--bg3)', border: `1px solid ${p.is_captain ? 'rgba(255,200,50,.2)' : 'var(--border)'}`, borderRadius: 8 }}>
                {p.is_captain && <span style={{ fontSize: 12 }}>⭐</span>}
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: color, flexShrink: 0 }} />
                <span className="font-condensed" style={{ flex: 1, fontWeight: 800, fontSize: 14, color: p.is_captain ? 'var(--gold)' : 'var(--white)', letterSpacing: '.03em' }}>
                  {p.nickname}
                  {p.is_captain && <span style={{ fontSize: 9, marginLeft: 6, color: 'var(--gold)', fontWeight: 600 }}>CAPITÃO</span>}
                </span>
                <span style={{ background: `${color}15`, color, border: `1px solid ${color}30`, borderRadius: 4, padding: '1px 5px', fontSize: 8, fontWeight: 700, letterSpacing: '.06em' }}>
                  {(p.role ?? 'RIF').toUpperCase().slice(0, 3)}
                </span>
                <span className="font-tech" style={{ fontSize: 11, color: 'var(--text3)' }}>{p.price_lc.toLocaleString('pt-BR')}</span>
              </div>
            )
          })}
        </div>

        {/* Budget bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 4 }}>
          <span style={{ color: 'var(--text3)' }}>Valor total</span>
          <span className="font-tech" style={{ color: 'var(--white)', fontWeight: 700 }}>{totalValue.toLocaleString('pt-BR')} LC</span>
        </div>
        <div style={{ background: 'var(--border)', borderRadius: 4, height: 4, overflow: 'hidden', marginBottom: 4 }}>
          <div style={{ height: '100%', borderRadius: 4, background: 'linear-gradient(90deg,var(--green),var(--cyan))', width: `${Math.min(100, (totalValue / budget) * 100)}%`, transition: 'width .5s' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
          <span style={{ color: 'var(--text3)' }}>Saldo: <span className="font-tech" style={{ color: 'var(--green)', fontWeight: 700 }}>{remaining.toLocaleString('pt-BR')} LC</span></span>
          <span style={{ color: 'var(--text3)' }}>{slots.length}/5 jogadores</span>
        </div>
      </div>
    </div>
  )
}
