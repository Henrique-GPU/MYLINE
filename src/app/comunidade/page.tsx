import Link from 'next/link'
import { AppLayout } from '@/components/layout/app-layout'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import type { Tables } from '@/types/database'

type Tournament = Tables<'community_tournaments'>

function StatusBadge({ status }: { status: Tournament['status'] }) {
  const map = {
    upcoming: { label: 'Em breve', cls: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20' },
    active: { label: 'Ao vivo', cls: 'bg-accent/10 text-accent border-accent/20' },
    finished: { label: 'Encerrado', cls: 'bg-foreground/10 text-foreground/40 border-foreground/10' },
  } as const
  const { label, cls } = map[status]
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${cls}`}>
      {label}
    </span>
  )
}

function TournamentCard({ t }: { t: Tournament }) {
  const start = new Date(t.start_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
  const end = new Date(t.end_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })

  return (
    <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-3 hover:border-accent/30 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base truncate">{t.name}</h3>
          {t.description && (
            <p className="text-foreground/40 text-sm mt-0.5 line-clamp-2">{t.description}</p>
          )}
        </div>
        <StatusBadge status={t.status} />
      </div>

      <div className="flex items-center gap-3 text-xs text-foreground/40">
        <span>{t.format}</span>
        <span>·</span>
        <span>{start} — {end}</span>
      </div>

      <div className="flex gap-2 pt-1">
        <Link
          href={`/comunidade/${t.id}`}
          className="flex-1 text-center py-2 bg-surface-2 border border-border text-sm rounded-lg hover:border-accent/40 transition-colors"
        >
          Ver torneio
        </Link>
        {t.status === 'active' && (
          <Link
            href={`/comunidade/${t.id}/partidas`}
            className="flex-1 text-center py-2 bg-accent text-black text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Partidas
          </Link>
        )}
      </div>
    </div>
  )
}

export default async function ComunidadePage() {
  const supabase = getSupabaseServerClient()
  const { data: tournaments } = await supabase
    .from('community_tournaments')
    .select('*')
    .order('created_at', { ascending: false })

  const active = tournaments?.filter((t) => t.status === 'active') ?? []
  const upcoming = tournaments?.filter((t) => t.status === 'upcoming') ?? []
  const finished = tournaments?.filter((t) => t.status === 'finished') ?? []

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1">Comunidade</h1>
            <p className="text-foreground/50 text-sm">
              Torneios amadores — crie, participe e registre seus resultados.
            </p>
          </div>
          <Link
            href="/comunidade/criar"
            className="px-4 py-2 bg-accent text-black text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity shrink-0"
          >
            + Criar torneio
          </Link>
        </div>

        {tournaments?.length === 0 && (
          <div className="bg-surface border border-border rounded-xl p-12 text-center">
            <p className="text-4xl mb-4">🎮</p>
            <p className="text-foreground/50">Nenhum torneio ainda.</p>
            <p className="text-foreground/30 text-sm mt-1">Seja o primeiro a criar um!</p>
            <Link
              href="/comunidade/criar"
              className="inline-block mt-4 px-5 py-2.5 bg-accent text-black text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Criar torneio
            </Link>
          </div>
        )}

        {active.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-4">Ao vivo</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {active.map((t) => <TournamentCard key={t.id} t={t} />)}
            </div>
          </section>
        )}

        {upcoming.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-4">Em breve</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcoming.map((t) => <TournamentCard key={t.id} t={t} />)}
            </div>
          </section>
        )}

        {finished.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-4">Encerrados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {finished.map((t) => <TournamentCard key={t.id} t={t} />)}
            </div>
          </section>
        )}
      </div>
    </AppLayout>
  )
}
