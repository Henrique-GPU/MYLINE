import Link from 'next/link'
import { AppLayout } from '@/components/layout/app-layout'
import { MercadoCenter } from '@/components/fantasy/mercado-center'
import { MarketNotifier } from '@/components/arena/market-notifier'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getEventMeta } from '@/lib/events'

export default async function MercadoPage({
  params,
}: {
  params: Promise<{ championshipId: string }>
}) {
  const { championshipId } = await params
  const supabase = getSupabaseServerClient()

  const { data: championship } = await supabase
    .from('championships')
    .select('id, name, initial_lc, status')
    .eq('id', championshipId)
    .single()

  const { data: round } = await supabase
    .from('rounds')
    .select('id, round_name, status, round_order')
    .eq('championship_id', championshipId)
    .order('round_order', { ascending: true })
    .limit(1)
    .single()

  if (!championship) {
    return (
      <AppLayout>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text3)' }}>Campeonato não encontrado.</p>
        </div>
      </AppLayout>
    )
  }

  const meta = getEventMeta(championship.name)

  return (
    <AppLayout>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 20px 40px' }} className="page-animate">

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: '14px 18px', background: 'var(--bg2)', border: `1px solid ${meta.accentColor}20`, borderRadius: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <Link href="/fantasy" style={{ fontSize: 11, color: 'var(--text3)', textDecoration: 'none' }}>Campeonatos</Link>
              <span style={{ color: 'var(--text3)', fontSize: 11 }}>›</span>
              <Link href={`/fantasy/${championshipId}`} style={{ fontSize: 11, color: 'var(--text2)', textDecoration: 'none' }}>{championship.name}</Link>
              <span style={{ color: 'var(--text3)', fontSize: 11 }}>›</span>
              <span style={{ fontSize: 11, color: 'var(--white)' }}>Mercado</span>
            </div>
            <h1 className="font-condensed" style={{ fontWeight: 900, fontSize: 20, color: 'var(--white)', textTransform: 'uppercase', letterSpacing: '.04em' }}>
              {championship.name.replace('2026','').replace('Season','S').trim()} — Mercado de Jogadores
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            {[
              { icon: meta.flagEmoji, text: meta.location },
              { icon: '💰', text: meta.prize },
              { icon: '🛡️', text: `${meta.teams} times` },
              { icon: '👥', text: '5.482 participantes' },
            ].map(pill => (
              <div key={pill.text} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 20, padding: '4px 10px' }}>
                <span style={{ fontSize: 11 }}>{pill.icon}</span>
                <span style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 600 }}>{pill.text}</span>
              </div>
            ))}
          </div>
        </div>

        {!round ? (
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '40px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text3)' }}>Nenhuma rodada disponível no momento.</p>
          </div>
        ) : (
          <>
          <MarketNotifier
            marketCloseTime={Date.now() + 2 * 60 * 60 * 1000}
            championshipName={championship.name}
          />
          <MercadoCenter
            championshipId={championshipId}
            roundId={round.id}
            roundName={round.round_name}
            initialLc={championship.initial_lc ?? 100000}
          />
          </>
        )}
      </div>
    </AppLayout>
  )
}
