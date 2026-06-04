'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

type Championship = { id: string; name: string; status: string; initial_lc: number }
type Round = { id: string; championship_id: string; round_name: string; status: string; round_order: number }
type Player = { id: string; nickname: string; team_id: string | null; role: string | null; price_lc: number; eliminated: boolean }
type Team = { id: string; name: string }

// ── Tabela de pontuação ──
function calcPoints(stats: {
  kills: number; assists: number; deaths: number;
  rating: number; adr: number; clutches: number;
  aces: number; mvps: number; won: boolean; eliminated: boolean
}): number {
  let pts = 0
  pts += stats.kills * 1.0
  pts += stats.assists * 0.5
  pts += stats.deaths * -0.4
  const kd = stats.kills / Math.max(1, stats.deaths)
  if (kd > 1.5) pts += 4.0
  else if (kd > 1) pts += 2.0
  if (stats.rating >= 1.20) pts += 5.0
  else if (stats.rating >= 1.00) pts += 2.0
  else if (stats.rating < 0.80) pts += -4.0
  if (stats.adr > 85) pts += 3.0
  else if (stats.adr < 55) pts += -2.0
  pts += stats.clutches * 4.0
  pts += stats.aces * 6.0
  pts += stats.mvps * 5.0
  if (stats.won) pts += 3.0
  else pts += -1.0
  if (stats.eliminated) pts += -3.0
  return Math.round(pts * 10) / 10
}

function calcPriceChange(points: number): number {
  if (points >= 40) return 0.08
  if (points >= 30) return 0.05
  if (points >= 20) return 0.02
  if (points >= 10) return 0
  if (points >= 0)  return -0.03
  if (points < 0)   return -0.07
  return 0
}

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [championships, setChampionships] = useState<Championship[]>([])
  const [rounds, setRounds] = useState<Round[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedChamp, setSelectedChamp] = useState('')
  const [selectedRound, setSelectedRound] = useState('')
  const [tab, setTab] = useState<'rounds' | 'stats' | 'scores'>('rounds')
  const [msg, setMsg] = useState('')
  const [importingStats, setImportingStats] = useState(false)

  // Stats form state (importar via extensão Chrome)
  const [statsInput, setStatsInput] = useState('')

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      // Autorizar: verificar email do founder
      const isAdmin = user.email === 'rico.goncalves97@hotmail.com'
      if (!isAdmin) { router.push('/dashboard'); return }
      setAuthorized(true)

      const [{ data: champs }, { data: ps }, { data: ts }] = await Promise.all([
        supabase.from('championships').select('*').order('created_at'),
        supabase.from('players').select('id, nickname, team_id, role, price_lc, eliminated').order('price_lc', { ascending: false }),
        supabase.from('teams').select('id, name'),
      ])
      setChampionships(champs ?? [])
      setPlayers(ps ?? [])
      setTeams(ts ?? [])
      setLoading(false)
    }
    init()
  }, [router])

  useEffect(() => {
    if (!selectedChamp) return
    const supabase = getSupabaseBrowserClient()
    supabase.from('rounds').select('*').eq('championship_id', selectedChamp).order('round_order').then(({ data }) => setRounds(data ?? []))
  }, [selectedChamp])

  async function updateRoundStatus(roundId: string, newStatus: string) {
    const supabase = getSupabaseBrowserClient()
    await supabase.from('rounds').update({ status: newStatus }).eq('id', roundId)
    setRounds(prev => prev.map(r => r.id === roundId ? { ...r, status: newStatus } : r))
    setMsg(`Rodada atualizada para: ${newStatus}`)
    setTimeout(() => setMsg(''), 3000)
  }

  async function toggleEliminated(playerId: string, current: boolean) {
    const supabase = getSupabaseBrowserClient()
    await supabase.from('players').update({ eliminated: !current }).eq('id', playerId)
    setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, eliminated: !current } : p))
  }

  async function importStats() {
    if (!selectedRound || !statsInput.trim()) { setMsg('Selecione uma rodada e cole os stats.'); return }
    setImportingStats(true)
    setMsg('Processando stats...')

    try {
      const lines = statsInput.trim().split('\n').filter(l => l.trim())
      const supabase = getSupabaseBrowserClient()
      let updated = 0

      for (const line of lines) {
        // Formato esperado: nickname,kills,assists,deaths,rating,adr,clutches,aces,mvps,won(1/0),eliminated(1/0)
        const parts = line.split(',').map(p => p.trim())
        if (parts.length < 11) continue
        const [nickname, kills, assists, deaths, rating, adr, clutches, aces, mvps, won, elim] = parts
        const player = players.find(p => p.nickname.toLowerCase() === nickname.toLowerCase())
        if (!player) continue

        const statsObj = {
          kills: parseInt(kills), assists: parseInt(assists), deaths: parseInt(deaths),
          rating: parseFloat(rating), adr: parseFloat(adr),
          clutches: parseInt(clutches), aces: parseInt(aces), mvps: parseInt(mvps),
          won: won === '1', eliminated: elim === '1',
        }

        const points = calcPoints(statsObj)
        const priceChange = calcPriceChange(points)
        const newPrice = Math.round(player.price_lc * (1 + priceChange))

        // Upsert player_round_stats
        await supabase.from('player_round_stats').upsert({
          player_id: player.id, round_id: selectedRound,
          kills: statsObj.kills, assists: statsObj.assists, deaths: statsObj.deaths,
          rating: statsObj.rating, adr: statsObj.adr,
          clutches: statsObj.clutches, aces: statsObj.aces, mvps: statsObj.mvps,
          points, eliminated: statsObj.eliminated,
        }, { onConflict: 'player_id,round_id' })

        // Atualiza price_lc + eliminated no player
        await supabase.from('players').update({ price_lc: newPrice, eliminated: statsObj.eliminated }).eq('id', player.id)

        // Atualiza player_prices
        await supabase.from('player_prices').upsert({
          player_id: player.id, championship_id: selectedChamp,
          round_id: selectedRound, price: newPrice, price_change: priceChange,
        }, { onConflict: 'player_id,round_id' })

        updated++
      }

      setMsg(`✅ ${updated} jogadores atualizados com sucesso!`)
      setStatsInput('')
    } catch (e) {
      setMsg(`❌ Erro: ${e}`)
    }
    setImportingStats(false)
  }

  async function calculateRankings() {
    if (!selectedRound || !selectedChamp) { setMsg('Selecione campeonato e rodada.'); return }
    setMsg('Calculando rankings...')
    const supabase = getSupabaseBrowserClient()

    // Busca todos os lineups desta rodada
    const { data: lineups } = await supabase
      .from('lineups')
      .select('id, user_id, championship_id')
      .eq('round_id', selectedRound)
      .eq('championship_id', selectedChamp)

    if (!lineups?.length) { setMsg('Nenhuma lineup encontrada.'); return }

    // Para cada lineup, calcula pontuação
    const scores: { user_id: string; lineup_id: string; uc_id?: string; total: number }[] = []

    for (const lineup of lineups) {
      const { data: lps } = await supabase
        .from('lineup_players')
        .select('player_id, is_captain')
        .eq('lineup_id', lineup.id)

      if (!lps?.length) continue

      const playerIds = lps.map(l => l.player_id)
      const { data: stats } = await supabase
        .from('player_round_stats')
        .select('player_id, points')
        .eq('round_id', selectedRound)
        .in('player_id', playerIds)

      if (!stats?.length) continue

      let total = 0
      for (const stat of stats) {
        const lp = lps.find(l => l.player_id === stat.player_id)
        total += lp?.is_captain ? stat.points * 2 : stat.points
      }

      // Busca user_championship
      const { data: uc } = await supabase
        .from('user_championships')
        .select('id, total_points')
        .eq('user_id', lineup.user_id)
        .eq('championship_id', selectedChamp)
        .single()

      scores.push({ user_id: lineup.user_id, lineup_id: lineup.id, uc_id: uc?.id, total: Math.round(total * 10) / 10 })
    }

    // Ordena por pontuação
    scores.sort((a, b) => b.total - a.total)

    // Upsert rankings
    for (let i = 0; i < scores.length; i++) {
      const s = scores[i]
      if (!s.uc_id) {
        // Cria user_championship se não existe
        const { data: newUc } = await supabase
          .from('user_championships')
          .insert({ user_id: s.user_id, championship_id: selectedChamp, lc_balance: 100000, total_points: s.total })
          .select('id').single()
        if (newUc) {
          await supabase.from('rankings').upsert({
            user_championship_id: newUc.id, round_id: selectedRound,
            position: i + 1, total_points: s.total,
          }, { onConflict: 'user_championship_id,round_id' })
        }
      } else {
        await supabase.from('user_championships').update({ total_points: s.total }).eq('id', s.uc_id)
        await supabase.from('rankings').upsert({
          user_championship_id: s.uc_id, round_id: selectedRound,
          position: i + 1, total_points: s.total,
        }, { onConflict: 'user_championship_id,round_id' })
      }
    }

    setMsg(`✅ Rankings calculados! ${scores.length} lineups processadas.`)
  }

  const teamsById = Object.fromEntries(teams.map(t => [t.id, t]))
  const filteredPlayers = players.filter(p => !selectedChamp || true) // show all

  if (loading) return <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: 'var(--text3)' }}>Carregando...</p></div>
  if (!authorized) return null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '24px 20px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 className="font-condensed" style={{ fontWeight: 900, fontSize: 24, color: 'var(--white)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 2 }}>
              ⚙️ Admin Panel
            </h1>
            <p style={{ fontSize: 12, color: 'var(--text3)' }}>Gerenciar rodadas, importar stats e calcular rankings</p>
          </div>
          <Link href="/dashboard" style={{ fontSize: 12, color: 'var(--text3)', textDecoration: 'none', padding: '6px 12px', border: '1px solid var(--border)', borderRadius: 7 }}>
            ← Arena
          </Link>
        </div>

        {/* Message */}
        {msg && (
          <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13, fontWeight: 600, background: msg.startsWith('✅') ? 'rgba(0,240,117,.1)' : msg.startsWith('❌') ? 'rgba(239,68,68,.1)' : 'rgba(245,158,11,.1)', color: msg.startsWith('✅') ? 'var(--green)' : msg.startsWith('❌') ? 'var(--red)' : 'var(--yellow)', border: `1px solid currentColor` }}>
            {msg}
          </div>
        )}

        {/* Selectors */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <div>
            <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6, display: 'block' }}>Campeonato</label>
            <select value={selectedChamp} onChange={e => setSelectedChamp(e.target.value)} style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text)', fontSize: 14, fontFamily: 'inherit', outline: 'none' }}>
              <option value="">Selecionar...</option>
              {championships.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6, display: 'block' }}>Rodada</label>
            <select value={selectedRound} onChange={e => setSelectedRound(e.target.value)} style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text)', fontSize: 14, fontFamily: 'inherit', outline: 'none' }} disabled={!selectedChamp}>
              <option value="">Selecionar...</option>
              {rounds.map(r => <option key={r.id} value={r.id}>{r.round_name} — {r.status}</option>)}
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
          {([['rounds', '🗓️ Rodadas'], ['stats', '📊 Importar Stats'], ['scores', '🏆 Calcular Ranking']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              padding: '10px 16px', fontSize: 13, fontWeight: 600, marginBottom: -1,
              color: tab === key ? 'var(--green)' : 'var(--text3)',
              borderBottom: tab === key ? '2px solid var(--green)' : '2px solid transparent',
            }}>
              {label}
            </button>
          ))}
        </div>

        {/* Tab: Rodadas */}
        {tab === 'rounds' && (
          <div>
            <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 14 }}>Ative/encerre rodadas para controlar quando o mercado abre e fecha.</p>
            {rounds.length === 0 && selectedChamp && <p style={{ color: 'var(--text3)' }}>Nenhuma rodada neste campeonato.</p>}
            {!selectedChamp && <p style={{ color: 'var(--text3)' }}>Selecione um campeonato acima.</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {rounds.map(r => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'var(--bg2)', border: `1px solid ${r.status === 'active' ? 'rgba(0,240,117,.3)' : 'var(--border)'}`, borderRadius: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div className="font-condensed" style={{ fontWeight: 800, fontSize: 15, color: 'var(--white)' }}>{r.round_name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>Ordem: {r.round_order}</div>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
                    background: r.status === 'active' ? 'rgba(0,240,117,.1)' : r.status === 'finished' ? 'rgba(255,255,255,.04)' : 'rgba(245,158,11,.1)',
                    color: r.status === 'active' ? 'var(--green)' : r.status === 'finished' ? 'var(--text3)' : 'var(--yellow)',
                    border: `1px solid currentColor`,
                  }}>{r.status.toUpperCase()}</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {r.status !== 'active' && (
                      <button onClick={() => updateRoundStatus(r.id, 'active')} style={{ padding: '6px 12px', background: 'rgba(0,240,117,.1)', border: '1px solid rgba(0,240,117,.3)', borderRadius: 6, color: 'var(--green)', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                        ▶ Ativar
                      </button>
                    )}
                    {r.status === 'active' && (
                      <button onClick={() => updateRoundStatus(r.id, 'finished')} style={{ padding: '6px 12px', background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 6, color: 'var(--red)', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                        ⬛ Encerrar
                      </button>
                    )}
                    {r.status === 'finished' && (
                      <button onClick={() => updateRoundStatus(r.id, 'upcoming')} style={{ padding: '6px 12px', background: 'rgba(255,255,255,.04)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text3)', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
                        ↩ Reabrir
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Eliminated players */}
            <div style={{ marginTop: 24 }}>
              <p className="font-condensed" style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 12 }}>
                MARCAR ELIMINADOS (-3.0 pts / -10% valorização)
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 6, maxHeight: 300, overflowY: 'auto' }}>
                {filteredPlayers.map(p => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: p.eliminated ? 'rgba(239,68,68,.08)' : 'var(--bg2)', border: `1px solid ${p.eliminated ? 'rgba(239,68,68,.2)' : 'var(--border)'}`, borderRadius: 7, cursor: 'pointer' }} onClick={() => toggleEliminated(p.id, p.eliminated)}>
                    <div style={{ width: 12, height: 12, borderRadius: 2, background: p.eliminated ? 'var(--red)' : 'var(--border)', border: '1px solid var(--border2)', flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: p.eliminated ? 'var(--red)' : 'var(--text2)' }}>{p.nickname}</span>
                    <span style={{ fontSize: 10, color: 'var(--text3)', marginLeft: 'auto' }}>{teamsById[p.team_id]?.name?.slice(0,4)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Importar Stats */}
        {tab === 'stats' && (
          <div>
            <div style={{ background: 'rgba(0,240,117,.05)', border: '1px solid rgba(0,240,117,.15)', borderRadius: 10, padding: '14px', marginBottom: 16 }}>
              <p className="font-condensed" style={{ fontWeight: 700, fontSize: 13, color: 'var(--green)', marginBottom: 6 }}>Formato de importação (extensão Chrome → HLTV)</p>
              <p style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'monospace', lineHeight: 1.8 }}>
                nickname,kills,assists,deaths,rating,adr,clutches,aces,mvps,won(1/0),eliminated(1/0)<br/>
                <span style={{ color: 'var(--text2)' }}>ZywOo,28,5,12,1.45,88.3,2,1,1,1,0</span><br/>
                <span style={{ color: 'var(--text2)' }}>donk,31,3,10,1.62,95.1,1,0,1,1,0</span><br/>
                <span style={{ color: 'var(--text2)' }}>sh1ro,22,8,15,1.21,82.4,0,0,0,0,0</span>
              </p>
            </div>
            <textarea
              value={statsInput}
              onChange={e => setStatsInput(e.target.value)}
              placeholder="Cole os stats aqui (um jogador por linha)..."
              style={{ width: '100%', height: 240, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px', color: 'var(--text)', fontSize: 13, fontFamily: 'monospace', outline: 'none', resize: 'vertical', marginBottom: 12 }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={importStats}
                disabled={importingStats || !selectedRound}
                className="btn-green"
                style={{ padding: '11px 24px', borderRadius: 9, border: 'none', cursor: importingStats || !selectedRound ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 900, letterSpacing: '.06em', textTransform: 'uppercase', opacity: !selectedRound ? 0.5 : 1 }}
              >
                {importingStats ? '⏳ Processando...' : '📥 Importar Stats + Calcular Pontos + Atualizar Preços'}
              </button>
            </div>
            {!selectedRound && <p style={{ fontSize: 11, color: 'var(--yellow)', marginTop: 8 }}>⚠️ Selecione uma rodada antes de importar.</p>}
          </div>
        )}

        {/* Tab: Calcular Ranking */}
        {tab === 'scores' && (
          <div>
            <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16, lineHeight: 1.6 }}>
              Após importar os stats, calcule o ranking para atualizar a posição de todos os usuários que montaram lineup nesta rodada.
            </p>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px', marginBottom: 16 }}>
              <p className="font-condensed" style={{ fontWeight: 700, fontSize: 12, color: 'var(--text3)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 10 }}>O que este processo faz:</p>
              {[
                'Busca todas as lineups da rodada selecionada',
                'Soma os pontos de cada jogador escalado (capitão = 2x)',
                'Ordena por pontuação total',
                'Atualiza a posição de cada usuário no ranking',
                'Atualiza o total_points do user_championship',
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>
                  <span style={{ color: 'var(--green)', fontWeight: 700 }}>{i + 1}.</span> {s}
                </div>
              ))}
            </div>
            <button
              onClick={calculateRankings}
              disabled={!selectedRound || !selectedChamp}
              style={{ padding: '12px 28px', background: selectedRound && selectedChamp ? 'linear-gradient(90deg,var(--green),var(--cyan))' : 'var(--bg3)', border: 'none', borderRadius: 10, cursor: selectedRound && selectedChamp ? 'pointer' : 'not-allowed', fontFamily: 'inherit', fontSize: 13, fontWeight: 900, letterSpacing: '.06em', textTransform: 'uppercase', color: selectedRound && selectedChamp ? '#000' : 'var(--text3)' }}
            >
              🏆 Calcular Rankings Agora
            </button>
            {(!selectedRound || !selectedChamp) && <p style={{ fontSize: 11, color: 'var(--yellow)', marginTop: 8 }}>⚠️ Selecione campeonato e rodada primeiro.</p>}
          </div>
        )}
      </div>
    </div>
  )
}
