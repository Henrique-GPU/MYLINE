'use client'

import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AppLayout } from '@/components/layout/app-layout'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

type ActionState = { error: string } | null

const FORMATS = ['BO1', 'BO3', 'BO5', 'Suíço', 'Grupos + Playoffs', 'Liga']

export default function CriarTorneioPag() {
  const router = useRouter()

  async function criarAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
    const supabase = getSupabaseBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Você precisa estar logado.' }

    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const format = formData.get('format') as string
    const start_date = formData.get('start_date') as string
    const end_date = formData.get('end_date') as string

    if (!name.trim()) return { error: 'Nome do torneio é obrigatório.' }
    if (!start_date || !end_date) return { error: 'Datas de início e fim são obrigatórias.' }
    if (new Date(end_date) <= new Date(start_date)) return { error: 'Data de fim deve ser após a de início.' }

    const { data, error } = await supabase
      .from('community_tournaments')
      .insert({
        name: name.trim(),
        description: description.trim() || null,
        format,
        start_date,
        end_date,
        organizer_id: user.id,
        status: 'upcoming',
      })
      .select('id')
      .single()

    if (error) return { error: error.message }

    router.push(`/comunidade/${data.id}`)
    return null
  }

  const [state, formAction, pending] = useActionState(criarAction, null)

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto px-6 py-10">
        <div className="mb-6">
          <Link href="/comunidade" className="text-sm text-foreground/40 hover:text-foreground/70 transition-colors">
            ← Comunidade
          </Link>
          <h1 className="text-2xl font-bold mt-3">Criar torneio</h1>
        </div>

        <form action={formAction} className="bg-surface border border-border rounded-xl p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-medium text-foreground/70">
              Nome do torneio <span className="text-red-400">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              maxLength={80}
              placeholder="Ex: MyLine Open Season 1"
              className="bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className="text-sm font-medium text-foreground/70">
              Descrição <span className="text-foreground/30 font-normal">(opcional)</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              maxLength={300}
              placeholder="Regras, premiação, informações extras..."
              className="bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50 transition-colors resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="format" className="text-sm font-medium text-foreground/70">
              Formato <span className="text-red-400">*</span>
            </label>
            <select
              id="format"
              name="format"
              required
              defaultValue="BO3"
              className="bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
            >
              {FORMATS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="start_date" className="text-sm font-medium text-foreground/70">
                Início <span className="text-red-400">*</span>
              </label>
              <input
                id="start_date"
                name="start_date"
                type="date"
                required
                className="bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="end_date" className="text-sm font-medium text-foreground/70">
                Fim <span className="text-red-400">*</span>
              </label>
              <input
                id="end_date"
                name="end_date"
                type="date"
                required
                className="bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          </div>

          {state?.error && (
            <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {state.error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <Link
              href="/comunidade"
              className="flex-1 text-center py-2.5 bg-surface-2 border border-border text-sm rounded-lg hover:border-foreground/20 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={pending}
              className="flex-1 py-2.5 bg-accent text-black font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {pending ? 'Criando...' : 'Criar torneio'}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
