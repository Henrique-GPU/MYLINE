import Link from 'next/link'
import { AppLayout } from '@/components/layout/app-layout'
import { LineupBuilder } from '@/components/fantasy/lineup-builder'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export default async function MercadoPage({
  params,
}: {
  params: Promise<{ championshipId: string }>
}) {
  const { championshipId } = await params
  const supabase = getSupabaseServerClient()

  const { data: championship } = await supabase
    .from('championships')
    .select('*')
    .eq('id', championshipId)
    .single()

  const { data: round } = await supabase
    .from('rounds')
    .select('*')
    .eq('championship_id', championshipId)
    .eq('status', 'active')
    .order('number', { ascending: false })
    .limit(1)
    .single()

  if (!championship) {
    return (
      <AppLayout>
        <div className="max-w-5xl mx-auto px-6 py-10">
          <p className="text-foreground/40">Campeonato não encontrado.</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-foreground/40 mb-6">
          <Link href="/fantasy" className="hover:text-foreground/70 transition-colors">Fantasy</Link>
          <span>›</span>
          <span className="text-foreground/70">{championship.name}</span>
          <span>›</span>
          <span className="text-foreground">Mercado</span>
        </div>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{championship.name}</h1>
            <p className="text-foreground/50 text-sm mt-0.5">Temporada {championship.season}</p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/fantasy/${championshipId}/ranking`}
              className="px-4 py-2 text-sm bg-surface border border-border rounded-lg hover:border-primary/30 transition-colors"
            >
              Ver ranking
            </Link>
          </div>
        </div>

        {!round ? (
          <div className="bg-surface border border-border rounded-xl p-10 text-center">
            <p className="text-foreground/50">Nenhuma rodada ativa no momento.</p>
            <p className="text-foreground/30 text-sm mt-1">
              Aguarde o início da próxima rodada para montar sua lineup.
            </p>
          </div>
        ) : (
          <>
            <div className="bg-surface border border-border rounded-xl px-5 py-3 mb-6 flex items-center gap-4">
              <div>
                <span className="text-xs text-foreground/40 uppercase tracking-wider">Rodada</span>
                <p className="font-semibold">{round.name}</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div>
                <span className="text-xs text-foreground/40 uppercase tracking-wider">Orçamento</span>
                <p className="font-semibold font-mono text-primary">100.000 LC</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div>
                <span className="text-xs text-foreground/40 uppercase tracking-wider">Jogadores</span>
                <p className="font-semibold">5 por lineup</p>
              </div>
            </div>

            <LineupBuilder
              championshipId={championshipId}
              roundId={round.id}
              roundName={round.name}
            />
          </>
        )}
      </div>
    </AppLayout>
  )
}
