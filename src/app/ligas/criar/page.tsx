'use client'

import { useEffect, useActionState, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AppLayout } from '@/components/layout/app-layout'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

type Championship = { id: string; name: string; status: string }
type State = { error: string } | { created: true; id: string; name: string; invite_code: string } | null

const SIZES = [
  { value: 10,  label: 'Até 10 membros',  sub: 'Grátis',  premium: false },
  { value: 50,  label: 'Até 50 membros',  sub: 'Premium', premium: true  },
  { value: 100, label: 'Até 100 membros', sub: 'Premium', premium: true  },
]

export default function CriarLigaPage() {
  const router = useRouter()
  const [championships, setChampionships] = useState<Championship[]>([])
  const [selectedChamps, setSelectedChamps] = useState<string[]>([])
  const [maxSize, setMaxSize] = useState(10)
  const [privacy, setPrivacy] = useState<'private' | 'public'>('private')

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    supabase
      .from('championships')
      .select('id, name, status')
      .in('status', ['active', 'upcoming'])
      .order('created_at', { ascending: true })
      .then(({ data }) => setChampionships(data ?? []))
  }, [])

  function toggleChamp(id: string) {
    setSelectedChamps(prev => {
      if (prev.includes(id)) return prev.filter(c => c !== id)
      // Gratuito: máx 2 campeonatos
      if (maxSize <= 10 && prev.length >= 2) return prev
      return [...prev, id]
    })
  }

  async function createAction(_prev: State, formData: FormData): Promise<State> {
    const name        = (formData.get('name') as string).trim()
    const description = (formData.get('description') as string).trim()

    if (!name)                  return { error: 'Nome da liga é obrigatório.' }
    if (selectedChamps.length === 0) return { error: 'Selecione pelo menos 1 campeonato.' }

    const supabase = getSupabaseBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Faça login para criar uma liga.' }

    // Criar liga
    const { data: league, error: leagueErr } = await supabase
      .from('leagues')
      .insert({
        name,
        description: description || null,
        creator_id: user.id,
        max_members: maxSize,
        privacy,
        plan_type: maxSize > 10 ? 'premium' : 'free',
      })
      .select('id, name, invite_code')
      .single()

    if (leagueErr || !league) return { error: leagueErr?.message ?? 'Erro ao criar liga.' }

    // Vincular campeonatos
    if (selectedChamps.length > 0) {
      await supabase.from('league_championships').insert(
        selectedChamps.map(cid => ({ league_id: league.id, championship_id: cid }))
      )
    }

    // Adicionar criador como admin
    await supabase.from('league_members').insert({
      league_id: league.id,
      user_id: user.id,
      role: 'admin',
    })

    return { created: true, id: league.id, name: league.name, invite_code: league.invite_code ?? '' }
  }

  const [state, formAction, pending] = useActionState(createAction, null)

  if (state && 'created' in state) {
    const inviteUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://mylinecs.app'}/ligas/entrar/${state.invite_code}`
    return (
      <AppLayout>
        <div style={{ maxWidth: 480, margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🏆</div>
          <h1 className="font-condensed" style={{ fontWeight: 900, fontSize: 28, color: 'var(--white)', textTransform: 'uppercase', marginBottom: 8 }}>
            Liga criada!
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 20 }}>
            <strong style={{ color: 'var(--green)' }}>{state.name}</strong> está pronta. Compartilhe o link com seus amigos.
          </p>

          {/* Link de convite */}
          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(0,240,117,.25)', borderRadius: 12, padding: '16px', marginBottom: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 8 }}>
              🔗 Link de convite
            </div>
            <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', fontFamily: 'monospace', fontSize: 12, color: 'var(--cyan)', wordBreak: 'break-all', marginBottom: 10 }}>
              {inviteUrl}
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(inviteUrl)}
              style={{ width: '100%', padding: '9px', background: 'rgba(0,240,117,.1)', border: '1px solid rgba(0,240,117,.25)', borderRadius: 8, fontSize: 12, fontWeight: 700, color: 'var(--green)', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              📋 Copiar link
            </button>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Link href={`/ligas/${state.id}`} className="btn-green" style={{ flex: 1, textAlign: 'center', borderRadius: 10, padding: '11px', fontSize: 13, fontWeight: 900, textDecoration: 'none', fontFamily: 'inherit', letterSpacing: '.06em', textTransform: 'uppercase' }}>
              Ver minha liga →
            </Link>
            <Link href="/ligas" style={{ padding: '11px 16px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, fontWeight: 600, color: 'var(--text2)', textDecoration: 'none', fontFamily: 'inherit' }}>
              Ligas
            </Link>
          </div>
        </div>
      </AppLayout>
    )
  }

  const isPremium = maxSize > 10
  const maxChampsForFree = 2
  const champsLimitReached = !isPremium && selectedChamps.length >= maxChampsForFree

  return (
    <AppLayout>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '28px 20px' }} className="page-animate">
        <div style={{ marginBottom: 24 }}>
          <Link href="/ligas" style={{ fontSize: 11, color: 'var(--text3)', textDecoration: 'none' }}>← Ligas</Link>
          <h1 className="font-condensed" style={{ fontWeight: 900, fontSize: 24, color: 'var(--white)', textTransform: 'uppercase', letterSpacing: '.04em', marginTop: 8, marginBottom: 4 }}>
            Criar Liga
          </h1>
          {/* Conceito explicado */}
          <div style={{ background: 'rgba(0,212,255,.06)', border: '1px solid rgba(0,212,255,.15)', borderRadius: 10, padding: '12px 14px' }}>
            <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.65 }}>
              💡 Uma liga é um <strong style={{ color: 'var(--white)' }}>ranking privado entre amigos</strong>. Selecione quais Campeonatos Oficiais vão contar pontos para esta liga. Os pontos continuam valendo normalmente no ranking geral — a liga apenas cria uma visão interna do grupo.
            </p>
          </div>
        </div>

        <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Nome */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text3)' }}>
              Nome da liga *
            </label>
            <input
              name="name" type="text" required maxLength={60}
              placeholder="Ex: Amigos do CS2, Liga da Empresa..."
              style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: '11px 14px', color: 'var(--text)', fontSize: 14, fontFamily: 'inherit', outline: 'none' }}
            />
          </div>

          {/* Descrição */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text3)' }}>
              Descrição <span style={{ fontWeight: 400, textTransform: 'none', color: 'var(--text3)' }}>(opcional)</span>
            </label>
            <textarea
              name="description" rows={2} maxLength={200}
              placeholder="Regras, premiação entre amigos, informações extras..."
              style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: '11px 14px', color: 'var(--text)', fontSize: 14, fontFamily: 'inherit', outline: 'none', resize: 'none' }}
            />
          </div>

          {/* Tamanho */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text3)' }}>
              Tamanho máximo
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {SIZES.map(s => (
                <button
                  key={s.value} type="button"
                  onClick={() => { setMaxSize(s.value); if (s.value <= 10) setSelectedChamps(prev => prev.slice(0, 2)) }}
                  style={{
                    flex: 1, padding: '10px 8px', borderRadius: 9, cursor: 'pointer',
                    fontFamily: 'inherit', transition: 'all .15s', border: 'none',
                    background: maxSize === s.value
                      ? s.premium ? 'linear-gradient(90deg,var(--gold),var(--yellow))' : 'linear-gradient(90deg,var(--green),var(--cyan))'
                      : 'var(--bg2)',
                    color: maxSize === s.value ? '#000' : 'var(--text2)',
                    outline: maxSize === s.value ? 'none' : `1px solid var(--border)`,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 900 }}>{s.label}</div>
                  <div style={{ fontSize: 9, fontWeight: 700, opacity: .8, textTransform: 'uppercase', letterSpacing: '.06em', marginTop: 2 }}>
                    {s.premium ? '⭐ ' : ''}{s.sub}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Campeonatos oficiais */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text3)' }}>
                Campeonatos que contam pontos *
              </label>
              {!isPremium && (
                <span style={{ fontSize: 10, color: champsLimitReached ? 'var(--yellow)' : 'var(--text3)' }}>
                  {selectedChamps.length}/{maxChampsForFree} (plano grátis)
                </span>
              )}
            </div>

            {championships.length === 0 ? (
              <div style={{ padding: '16px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, textAlign: 'center', fontSize: 12, color: 'var(--text3)' }}>
                Nenhum campeonato ativo no momento.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {championships.map(c => {
                  const selected = selectedChamps.includes(c.id)
                  const blocked  = !selected && champsLimitReached
                  return (
                    <div
                      key={c.id}
                      onClick={() => !blocked && toggleChamp(c.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '12px 14px', borderRadius: 10, cursor: blocked ? 'not-allowed' : 'pointer',
                        background: selected ? 'rgba(0,240,117,.06)' : 'var(--bg2)',
                        border: `1px solid ${selected ? 'rgba(0,240,117,.3)' : 'var(--border)'}`,
                        opacity: blocked ? 0.45 : 1,
                        transition: 'all .15s',
                      }}
                    >
                      {/* Checkbox visual */}
                      <div style={{
                        width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                        background: selected ? 'var(--green)' : 'var(--bg3)',
                        border: `2px solid ${selected ? 'var(--green)' : 'var(--border2)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, color: '#000', fontWeight: 900,
                      }}>
                        {selected && '✓'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="font-condensed" style={{ fontWeight: 800, fontSize: 14, color: 'var(--white)', letterSpacing: '.03em' }}>
                          {c.name}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                          {c.status === 'active' ? '🔴 Ao vivo' : '🟡 Em breve'}
                        </div>
                      </div>
                      {selected && <span style={{ fontSize: 10, color: 'var(--green)', fontWeight: 700 }}>✓ Selecionado</span>}
                      {blocked && <span style={{ fontSize: 9, color: 'var(--yellow)' }}>Premium</span>}
                    </div>
                  )
                })}
              </div>
            )}

            {champsLimitReached && (
              <div style={{ background: 'rgba(255,200,50,.06)', border: '1px solid rgba(255,200,50,.2)', borderRadius: 8, padding: '8px 12px', fontSize: 11, color: 'var(--yellow)' }}>
                ⭐ Plano gratuito permite até 2 campeonatos. Escolha Premium para selecionar mais.
              </div>
            )}
          </div>

          {/* Privacidade */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text3)' }}>
              Privacidade
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { value: 'private', label: '🔒 Privada por link', sub: 'Apenas quem tiver o link pode entrar' },
                { value: 'public',  label: '🌐 Pública',         sub: 'Qualquer usuário pode encontrar e entrar' },
              ].map(p => (
                <button
                  key={p.value} type="button"
                  onClick={() => setPrivacy(p.value as 'private' | 'public')}
                  style={{
                    flex: 1, padding: '10px 12px', borderRadius: 9, cursor: 'pointer',
                    fontFamily: 'inherit', textAlign: 'left', border: 'none',
                    background: privacy === p.value ? 'rgba(0,240,117,.06)' : 'var(--bg2)',
                    outline: privacy === p.value ? '1px solid rgba(0,240,117,.3)' : '1px solid var(--border)',
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: privacy === p.value ? 'var(--green)' : 'var(--text2)', marginBottom: 3 }}>{p.label}</div>
                  <div style={{ fontSize: 10, color: 'var(--text3)', lineHeight: 1.4 }}>{p.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {state && 'error' in state && (
            <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: 'var(--red)' }}>
              {state.error}
            </div>
          )}

          {/* Submit */}
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button
              type="submit" disabled={pending || selectedChamps.length === 0}
              className="btn-green"
              style={{
                flex: 2, borderRadius: 12, padding: '13px', fontSize: 14, fontWeight: 900,
                fontFamily: 'inherit', border: 'none', letterSpacing: '.06em', textTransform: 'uppercase',
                cursor: pending || selectedChamps.length === 0 ? 'not-allowed' : 'pointer',
                opacity: selectedChamps.length === 0 ? 0.4 : 1,
              }}
            >
              {pending ? 'Criando...' : '🏆 Criar Liga'}
            </button>
            <Link href="/ligas" style={{ padding: '13px 20px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13, fontWeight: 600, color: 'var(--text2)', textDecoration: 'none', fontFamily: 'inherit', display: 'flex', alignItems: 'center' }}>
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
