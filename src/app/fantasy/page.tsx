import Link from 'next/link'
import { AppLayout } from '@/components/layout/app-layout'
import { getSupabaseServerClient } from '@/lib/supabase/server'

type Championship = {
  id: string
  name: string
  status: string
  initial_lc: number
  banner_url: string | null
  created_at: string
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    upcoming: { label: 'Em breve', cls: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20' },
    active:   { label: 'Ao vivo',  cls: 'bg-primary/10 text-primary border-primary/20' },
    finished: { label: 'Encerrado', cls: 'bg-foreground/10 text-foreground/40 border-foreground/10' },
  }
  const { label, cls } = map[status] ?? { label: status, cls: 'bg-foreground/10 text-foreground/40 border-foreground/10' }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${cls}`}>
      {label}
    </span>
  )
}

function ChampionshipCard({ c }: { c: Championship }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-6 flex flex-col gap-4 hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-base">{c.name}</h3>
        <StatusBadge status={c.status} />
      </div>

      <div className="text-xs text-foreground/40">
        Orçamento inicial: <span className="text-primary font-mono">{c.initial_lc.toLocaleString('pt-BR')} LC</span>
      </div>

      <div className="flex gap-2 pt-1">
        {c.status === 'active' && (
          <>
            <Link
              href={`/fantasy/${c.id}/mercado`}
              className="flex-1 text-center py-2 bg-primary text-black text-sm font-semibold rounded-lg hover:bg-primary-dark transition-colors"
            >
              Montar lineup
            </Link>
            <Link
              href={`/fantasy/${c.id}/ranking`}
              className="flex-1 text-center py-2 bg-surface-2 border border-border text-sm rounded-lg hover:border-primary/30 transition-colors"
            >
              Ranking
            </Link>
          </>
        )}
        {c.status === 'upcoming' && (
          <Link
            href={`/fantasy/${c.id}/mercado`}
            className="flex-1 text-center py-2 bg-primary text-black text-sm font-semibold rounded-lg hover:bg-primary-dark transition-colors"
          >
            Ver mercado
          </Link>
        )}
        {c.status === 'finished' && (
          <Link
            href={`/fantasy/${c.id}/ranking`}
            className="flex-1 text-center py-2 bg-surface-2 border border-border text-sm rounded-lg hover:border-foreground/20 transition-colors"
          >
            Ver resultado final
          </Link>
        )}
      </div>
    </div>
  )
}

export default async function FantasyPage() {
  const supabase = getSupabaseServerClient()
  const { data: championships } = await supabase
    .from('championships')
    .select('id, name, status, initial_lc, banner_url, created_at')
    .order('created_at', { ascending: false })

  const list = (championships ?? []) as Championship[]
  const active   = list.filter((c) => c.status === 'active')
  const upcoming = list.filter((c) => c.status === 'upcoming')
  const finished = list.filter((c) => c.status === 'finished')

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Fantasy Oficial</h1>
          <p className="text-foreground/50 text-sm">
            Monte sua lineup com 100.000 LC e dispute o ranking a cada rodada.
          </p>
        </div>

        {list.length === 0 && (
          <div className="bg-surface border border-border rounded-xl p-12 text-center">
            <p className="text-4xl mb-4">🏆</p>
            <p className="text-foreground/50">Nenhum campeonato disponível no momento.</p>
          </div>
        )}

        {active.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-4">Ao vivo</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {active.map((c) => <ChampionshipCard key={c.id} c={c} />)}
            </div>
          </section>
        )}

        {upcoming.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-4">Em breve</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcoming.map((c) => <ChampionshipCard key={c.id} c={c} />)}
            </div>
          </section>
        )}

        {finished.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-4">Encerrados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {finished.map((c) => <ChampionshipCard key={c.id} c={c} />)}
            </div>
          </section>
        )}

        <div className="mt-10 bg-surface border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground/40 uppercase tracking-wider mb-3">Como funciona</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            {[
              { n: '1', t: 'Escolha jogadores', d: 'Monte sua lineup com até 5 jogadores dentro do orçamento de 100.000 LC.' },
              { n: '2', t: 'Acompanhe rodada', d: 'Pontos são calculados automaticamente com base nas stats reais do HLTV.' },
              { n: '3', t: 'Suba no ranking', d: 'Cada rodada atualiza seu ranking. Melhor desempenho = mais visibilidade.' },
            ].map((item) => (
              <div key={item.n} className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {item.n}
                </span>
                <div>
                  <p className="font-medium text-foreground/80">{item.t}</p>
                  <p className="text-foreground/40 text-xs mt-0.5">{item.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
