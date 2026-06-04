import Link from 'next/link'
import { AppLayout } from '@/components/layout/app-layout'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export default async function TournamentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = getSupabaseServerClient()

  const { data: tournament } = await supabase
    .from('community_tournaments')
    .select('*')
    .eq('id', id)
    .single()

  if (!tournament) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto px-6 py-10">
          <p className="text-foreground/40">Torneio não encontrado.</p>
        </div>
      </AppLayout>
    )
  }

  // Teams
  const { data: teams } = await supabase
    .from('community_teams')
    .select('*')
    .eq('tournament_id', id)
    .order('created_at', { ascending: true })

  // Standings
  const { data: standings } = await supabase
    .from('community_standings')
    .select('*')
    .eq('tournament_id', id)
    .order('position', { ascending: true })

  // Recent matches
  const { data: matches } = await supabase
    .from('community_matches')
    .select('*')
    .eq('tournament_id', id)
    .order('scheduled_at', { ascending: false })
    .limit(10)

  const teamsById = Object.fromEntries((teams ?? []).map((t) => [t.id, t]))

  const statusMap = {
    upcoming: { label: 'Em breve', cls: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20' },
    active: { label: 'Ao vivo', cls: 'bg-accent/10 text-accent border-accent/20' },
    finished: { label: 'Encerrado', cls: 'bg-foreground/10 text-foreground/40 border-foreground/10' },
  } as const

  const { label: statusLabel, cls: statusCls } = statusMap[tournament.status]

  const startFmt = new Date(tournament.start_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
  const endFmt = new Date(tournament.end_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-foreground/40 mb-6">
          <Link href="/comunidade" className="hover:text-foreground/70 transition-colors">Comunidade</Link>
          <span>›</span>
          <span className="text-foreground">{tournament.name}</span>
        </div>

        {/* Header */}
        <div className="bg-surface border border-border rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h1 className="text-2xl font-bold">{tournament.name}</h1>
            <span className={`text-xs font-medium px-2 py-1 rounded-full border shrink-0 ${statusCls}`}>
              {statusLabel}
            </span>
          </div>

          {tournament.description && (
            <p className="text-foreground/60 text-sm mb-4">{tournament.description}</p>
          )}

          <div className="flex flex-wrap gap-4 text-sm">
            <div>
              <span className="text-foreground/40 text-xs uppercase tracking-wider block mb-0.5">Formato</span>
              <span className="font-medium">{tournament.format}</span>
            </div>
            <div>
              <span className="text-foreground/40 text-xs uppercase tracking-wider block mb-0.5">Início</span>
              <span className="font-medium">{startFmt}</span>
            </div>
            <div>
              <span className="text-foreground/40 text-xs uppercase tracking-wider block mb-0.5">Fim</span>
              <span className="font-medium">{endFmt}</span>
            </div>
            <div>
              <span className="text-foreground/40 text-xs uppercase tracking-wider block mb-0.5">Times</span>
              <span className="font-medium">{teams?.length ?? 0}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Standings */}
          <div>
            <h2 className="text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-3">
              Classificação
            </h2>
            {!standings?.length ? (
              <div className="bg-surface border border-border rounded-xl p-6 text-center">
                <p className="text-foreground/30 text-sm">Sem classificação ainda.</p>
              </div>
            ) : (
              <div className="bg-surface border border-border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="px-3 py-2.5 text-xs font-semibold text-foreground/40 w-8">#</th>
                      <th className="px-3 py-2.5 text-xs font-semibold text-foreground/40">Time</th>
                      <th className="px-3 py-2.5 text-xs font-semibold text-foreground/40 text-center">V</th>
                      <th className="px-3 py-2.5 text-xs font-semibold text-foreground/40 text-center">D</th>
                      <th className="px-3 py-2.5 text-xs font-semibold text-foreground/40 text-right">Pts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {standings.map((s) => {
                      const team = teamsById[s.team_id]
                      return (
                        <tr key={s.id} className="hover:bg-surface-2 transition-colors">
                          <td className="px-3 py-2.5 text-foreground/40">{s.position}</td>
                          <td className="px-3 py-2.5 font-medium">{team?.tag ?? '?'}</td>
                          <td className="px-3 py-2.5 text-center text-primary">{s.wins}</td>
                          <td className="px-3 py-2.5 text-center text-red-400">{s.losses}</td>
                          <td className="px-3 py-2.5 text-right font-mono font-semibold">{s.points}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Teams */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-foreground/40 uppercase tracking-wider">
                Times ({teams?.length ?? 0})
              </h2>
              {tournament.status === 'upcoming' && (
                <Link
                  href={`/comunidade/${id}/times/criar`}
                  className="text-xs text-accent hover:underline"
                >
                  + Inscrever time
                </Link>
              )}
            </div>
            {!teams?.length ? (
              <div className="bg-surface border border-border rounded-xl p-6 text-center">
                <p className="text-foreground/30 text-sm mb-3">Nenhum time inscrito.</p>
                {tournament.status === 'upcoming' && (
                  <Link
                    href={`/comunidade/${id}/times/criar`}
                    className="inline-block px-4 py-2 text-xs bg-accent text-black font-semibold rounded-lg"
                  >
                    Inscrever meu time
                  </Link>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {teams.map((team) => (
                  <div key={team.id} className="flex items-center gap-3 px-4 py-3 bg-surface border border-border rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-surface-2 border border-border flex items-center justify-center text-xs font-bold text-foreground/60">
                      {team.tag.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{team.name}</p>
                      <p className="text-foreground/40 text-xs">{team.tag}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Matches */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-foreground/40 uppercase tracking-wider">
              Últimas Partidas
            </h2>
            <Link
              href={`/comunidade/${id}/partidas`}
              className="text-xs text-foreground/40 hover:text-foreground/70 transition-colors"
            >
              Ver todas →
            </Link>
          </div>
          {!matches?.length ? (
            <div className="bg-surface border border-border rounded-xl p-6 text-center">
              <p className="text-foreground/30 text-sm">Nenhuma partida registrada.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {matches.map((m) => {
                const t1 = teamsById[m.team1_id]
                const t2 = teamsById[m.team2_id]
                const winner = m.winner_id ? teamsById[m.winner_id] : null
                const date = new Date(m.scheduled_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
                return (
                  <div key={m.id} className="flex items-center gap-3 px-4 py-3 bg-surface border border-border rounded-xl text-sm">
                    <span
                      className={`flex-1 text-right font-medium ${m.winner_id === m.team1_id ? 'text-primary' : m.winner_id === m.team2_id ? 'text-foreground/40' : ''}`}
                    >
                      {t1?.tag ?? '?'}
                    </span>
                    <span className="text-foreground/30 text-xs px-2">
                      {m.winner_id ? 'vs' : `${m.format} · ${date}`}
                    </span>
                    <span
                      className={`flex-1 font-medium ${m.winner_id === m.team2_id ? 'text-primary' : m.winner_id === m.team1_id ? 'text-foreground/40' : ''}`}
                    >
                      {t2?.tag ?? '?'}
                    </span>
                    {winner && (
                      <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded ml-1">
                        {winner.tag} venceu
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
