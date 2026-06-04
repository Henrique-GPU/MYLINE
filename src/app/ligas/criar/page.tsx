'use client'

import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AppLayout } from '@/components/layout/app-layout'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

type State = { error: string } | { created: true; id: string; name: string } | null

const FORMATS = ['BO3', 'BO1', 'Suíço', 'Grupos + Playoffs', 'Mata-mata']
const SIZES = [
  { label: '🆓 Até 10 — Grátis',         value: '10',  premium: false },
  { label: '⭐ Até 30 — Premium',          value: '30',  premium: true  },
  { label: '⭐ Até 100 — Premium',         value: '100', premium: true  },
]

export default function CriarLigaPage() {
  const router = useRouter()

  async function criarAction(_prev: State, formData: FormData): Promise<State> {
    const name = (formData.get('name') as string).trim()
    const description = (formData.get('description') as string).trim()
    const format = formData.get('format') as string
    const maxSize = formData.get('max_size') as string
    const start_date = formData.get('start_date') as string
    const end_date = formData.get('end_date') as string

    if (!name) return { error: 'Nome da liga é obrigatório.' }
    if (!start_date || !end_date) return { error: 'Datas são obrigatórias.' }
    if (new Date(end_date) <= new Date(start_date)) return { error: 'Data de fim deve ser após o início.' }

    const supabase = getSupabaseBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Você precisa estar logado.' }

    const { data, error } = await supabase
      .from('community_tournaments')
      .insert({
        name, description: description || null,
        format: `${format} · Max ${maxSize}`,
        start_date, end_date,
        organizer_id: user.id,
        status: 'upcoming',
      })
      .select('id')
      .single()

    if (error || !data) return { error: error?.message ?? 'Erro ao criar liga.' }
    return { created: true, id: data.id, name }
  }

  const [state, formAction, pending] = useActionState(criarAction, null)

  if (state && 'created' in state) {
    return (
      <AppLayout>
        <div style={{ maxWidth: 500, margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🏆</div>
          <h1 className="font-condensed" style={{ fontWeight: 900, fontSize: 28, color: 'var(--white)', textTransform: 'uppercase', marginBottom: 8 }}>
            Liga Criada!
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 6 }}>
            <strong style={{ color: 'var(--green)' }}>{state.name}</strong> está pronta.
          </p>
          <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 24 }}>
            Compartilhe o link com seus amigos para eles entrarem.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <Link href={`/comunidade/${state.id}`} className="btn-green" style={{ display: 'inline-flex', borderRadius: 10, padding: '11px 24px', fontSize: 13, fontWeight: 900, textDecoration: 'none', fontFamily: 'inherit', letterSpacing: '.06em', textTransform: 'uppercase' }}>
              Ver Liga →
            </Link>
            <Link href="/ligas" style={{ display: 'inline-flex', borderRadius: 10, padding: '11px 20px', fontSize: 13, fontWeight: 600, textDecoration: 'none', fontFamily: 'inherit', color: 'var(--text2)', background: 'var(--bg2)', border: '1px solid var(--border)' }}>
              Minhas Ligas
            </Link>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div style={{ maxWidth: 620, margin: '0 auto', padding: '28px 20px' }} className="page-animate">
        <div style={{ marginBottom: 24 }}>
          <Link href="/ligas" style={{ fontSize: 11, color: 'var(--text3)', textDecoration: 'none' }}>← Ligas</Link>
          <h1 className="font-condensed" style={{ fontWeight: 900, fontSize: 24, color: 'var(--white)', textTransform: 'uppercase', letterSpacing: '.04em', marginTop: 8 }}>
            Criar Liga
          </h1>
        </div>

        {/* Planos */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          {/* Grátis */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px' }}>
            <div className="font-condensed" style={{ fontWeight: 900, fontSize: 16, color: 'var(--white)', textTransform: 'uppercase', marginBottom: 4 }}>Grátis</div>
            <div className="font-tech" style={{ fontSize: 24, color: 'var(--white)', marginBottom: 10 }}>R$ 0</div>
            {['Até 10 participantes', 'Ranking básico', 'Liga pública ou privada', '1 liga ativa'].map(f => (
              <div key={f} style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4, display: 'flex', gap: 6 }}><span style={{ color: 'var(--green)' }}>✓</span>{f}</div>
            ))}
          </div>
          {/* Premium */}
          <div style={{ background: 'var(--bg2)', border: '2px solid rgba(255,200,50,.3)', borderRadius: 12, padding: '16px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ height: 3, background: 'linear-gradient(90deg,var(--gold),var(--yellow))', margin: '-16px -16px 12px', borderRadius: '12px 12px 0 0' }} />
            <div style={{ position: 'absolute', top: 16, right: 12, background: 'linear-gradient(90deg,var(--gold),var(--yellow))', color: '#000', fontSize: 8, fontWeight: 900, borderRadius: 20, padding: '2px 8px', letterSpacing: '.08em', textTransform: 'uppercase' }}>POPULAR</div>
            <div className="font-condensed" style={{ fontWeight: 900, fontSize: 16, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 4 }}>⭐ Premium</div>
            <div style={{ marginBottom: 10 }}>
              <span className="font-tech" style={{ fontSize: 22, color: 'var(--white)', fontWeight: 700 }}>R$ 9,90</span>
              <span style={{ fontSize: 11, color: 'var(--text3)' }}>/mês</span>
              <div style={{ fontSize: 10, color: 'var(--green)' }}>ou R$ 49,90/temporada</div>
            </div>
            {['Até 100 participantes', 'Logo personalizada', 'Mata-mata + grupos', 'Premiações reais', 'Estatísticas avançadas', 'Chat exclusivo'].map(f => (
              <div key={f} style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4, display: 'flex', gap: 6 }}><span style={{ color: 'var(--gold)' }}>★</span>{f}</div>
            ))}
          </div>
        </div>

        {/* Formulário */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ height: 3, background: 'linear-gradient(90deg,var(--green),var(--cyan))' }} />
          <form action={formAction} style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: 16 }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text3)' }}>Nome da Liga *</label>
              <input name="name" type="text" required maxLength={60} placeholder="Ex: Liga dos Amigos CS2" style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text)', fontSize: 14, fontFamily: 'inherit', outline: 'none', width: '100%' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text3)' }}>Descrição <span style={{ color: 'var(--text3)', fontWeight: 400 }}>(opcional)</span></label>
              <textarea name="description" rows={2} maxLength={200} placeholder="Regras, premiação, informações extras..." style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text)', fontSize: 14, fontFamily: 'inherit', outline: 'none', resize: 'none', width: '100%' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text3)' }}>Formato</label>
                <select name="format" defaultValue="BO3" style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text)', fontSize: 14, fontFamily: 'inherit', outline: 'none' }}>
                  {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text3)' }}>Tamanho máximo</label>
                <select name="max_size" defaultValue="10" style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text)', fontSize: 14, fontFamily: 'inherit', outline: 'none' }}>
                  {SIZES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[{ name: 'start_date', label: 'Data de Início *' }, { name: 'end_date', label: 'Data de Fim *' }].map(f => (
                <div key={f.name} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text3)' }}>{f.label}</label>
                  <input name={f.name} type="date" required style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text)', fontSize: 14, fontFamily: 'inherit', outline: 'none' }} />
                </div>
              ))}
            </div>

            {state && 'error' in state && (
              <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: 'var(--red)' }}>{state.error}</div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" disabled={pending} className="btn-green" style={{ flex: 2, borderRadius: 10, padding: '12px', fontSize: 13, fontWeight: 900, fontFamily: 'inherit', border: 'none', letterSpacing: '.06em', textTransform: 'uppercase', cursor: pending ? 'not-allowed' : 'pointer', opacity: pending ? 0.6 : 1 }}>
                {pending ? 'Criando...' : '🏆 Criar Liga'}
              </button>
              <Link href="/ligas" style={{ flex: 1, textAlign: 'center', padding: '12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, fontWeight: 600, color: 'var(--text2)', textDecoration: 'none', fontFamily: 'inherit' }}>
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  )
}
