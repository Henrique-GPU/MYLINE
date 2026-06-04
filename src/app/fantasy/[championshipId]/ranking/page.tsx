import Link from 'next/link'
import { AppLayout } from '@/components/layout/app-layout'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export default async function RankingPage({
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

  // Get all rounds for this championship
  const { data: rounds } = await supabase
    .from('rounds')
    .select('id, round_name, round_order, status')
    .eq('championship_id', championshipId)
    .order('round_order', { ascending: false })

  // Active or last finished round for ranking display
  const activeRound = rounds?.find((r) => r.status === 'active') ?? rounds?.[0]

  // Rankings for this round
  const { data: rankings } = activeRound
    ? await supabase
        .from('rankings')
        .select('position, total_points, user_championship_id')
        .eq('round_id', activeRound.id)
        .order('position', { ascending: true })
        .limit(50)
    : { data: [] }

  // User championships to get user info
  const ucIds = rankings?.map((r) => r.user_championship_id) ?? []
  const { data: userChampionships } = ucIds.length
    ? await supabase
        .from('user_championships')
        .select('id, user_id, total_points')
        .in('id', ucIds)
    : { data: [] }

  // Users info from users table
  const userIds = [...new Set(userChampionships?.map((uc) => uc.user_id) ?? [])]
  const { data: userRows } = userIds.length
    ? await supabase
        .from('users')
        .select('id, username')
        .in('id', userIds)
    : { data: [] }

  const usersById = Object.fromEntries((userRows ?? []).map((u) => [u.id, u]))
  const ucById = Object.fromEntries((userChampionships ?? []).map((uc) => [uc.id, uc]))

  type RankingRow = {
    position: number
    total_points: number
    username: string
    total_championship_points: number
  }

  const rows: RankingRow[] = (rankings ?? []).map((r) => {
    const uc = ucById[r.user_championship_id]
    const user = uc ? usersById[uc.user_id] : null
    return {
      position: r.position,
      total_points: r.total_points,
      username: user?.username ?? 'Anônimo',
      total_championship_points: uc?.total_points ?? 0,
    }
  })

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-foreground/40 mb-6">
          <Link href="/fantasy" className="hover:text-foreground/70 transition-colors">Fantasy</Link>
          <span>›</span>
          <span className="text-foreground/70">{championship?.name ?? '...'}</span>
          <span>›</span>
          <span className="text-foreground">Ranking</span>
        </div>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Ranking</h1>
            {activeRound && (
              <p className="text-foreground/50 text-sm mt-0.5">{activeRound.round_name}</p>
            )}
          </div>
          {championship && (
            <Link
              href={`/fantasy/${championshipId}/mercado`}
              className="px-4 py-2 text-sm bg-primary text-black font-semibold rounded-lg hover:bg-primary-dark transition-colors"
            >
              Minha lineup
            </Link>
          )}
        </div>

        {/* Round selector */}
        {(rounds?.length ?? 0) > 1 && (
          <div className="flex gap-2 mb-6 flex-wrap">
            {rounds?.map((r) => (
              <span
                key={r.id}
                className={`px-3 py-1 text-xs rounded-lg border ${
                  r.id === activeRound?.id
                    ? 'bg-primary/10 text-primary border-primary/30 font-medium'
                    : 'bg-surface border-border text-foreground/40'
                }`}
              >
                {r.round_name}
              </span>
            ))}
          </div>
        )}

        {rows.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-12 text-center">
            <p className="text-4xl mb-4">🏆</p>
            <p className="text-foreground/50 text-sm">
              {!activeRound
                ? 'Nenhuma rodada disponível ainda.'
                : 'Nenhum resultado nesta rodada ainda.'}
            </p>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-foreground/40 uppercase tracking-wider w-12">#</th>
                  <th className="px-4 py-3 text-xs font-semibold text-foreground/40 uppercase tracking-wider">Usuário</th>
                  <th className="px-4 py-3 text-xs font-semibold text-foreground/40 uppercase tracking-wider text-right">Pts rodada</th>
                  <th className="px-4 py-3 text-xs font-semibold text-foreground/40 uppercase tracking-wider text-right">Pts total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row, i) => (
                  <tr
                    key={i}
                    className={`transition-colors ${row.position <= 3 ? 'bg-primary/5' : 'hover:bg-surface-2'}`}
                  >
                    <td className="px-4 py-3">
                      {row.position === 1 ? '🥇' : row.position === 2 ? '🥈' : row.position === 3 ? '🥉' : (
                        <span className="text-foreground/40">{row.position}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium">{row.username}</td>
                    <td className="px-4 py-3 text-right font-mono text-primary font-semibold">
                      {row.total_points.toFixed(1)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-foreground/60">
                      {row.total_championship_points.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
