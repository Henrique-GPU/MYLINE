import { AppLayout } from '@/components/layout/app-layout'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getEventMeta, getBannerUrl } from '@/lib/events'
import { ChampionshipsClient } from '@/components/fantasy/championships-client'

export default async function FantasyPage() {
  const supabase = getSupabaseServerClient()
  const { data } = await supabase
    .from('championships')
    .select('id, name, status, initial_lc')
    .order('created_at', { ascending: true })

  const championships = data ?? []

  // Pre-compute metas and banners server-side
  const metas: Record<string, ReturnType<typeof getEventMeta>> = {}
  const bannerUrls: Record<string, string | null> = {}
  for (const c of championships) {
    metas[c.name] = getEventMeta(c.name)
    bannerUrls[c.name] = getBannerUrl(c.name)
  }

  const roundId = 'b0000000-0000-0000-0000-000000000001'

  return (
    <AppLayout>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 20px 40px' }} className="page-animate">

        <div style={{ marginBottom: 22 }}>
          <h1 className="font-condensed" style={{ fontWeight: 900, fontSize: 26, color: 'var(--white)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 3 }}>
            Campeonatos Oficiais
          </h1>
          <p style={{ color: 'var(--text3)', fontSize: 13 }}>
            Monte sua lineup com 100.000 LC e dispute os maiores eventos do CS2
          </p>
        </div>

        <ChampionshipsClient
          championships={championships}
          metas={metas}
          bannerUrls={bannerUrls}
          roundId={roundId}
        />
      </div>
    </AppLayout>
  )
}
