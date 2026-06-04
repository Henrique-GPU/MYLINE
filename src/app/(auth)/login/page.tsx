'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

type ActionState = { error: string } | null

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const justConfirmed = searchParams.get('confirm') === '1'

  async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      if (error.message.toLowerCase().includes('email not confirmed')) {
        return { error: 'Email ainda não confirmado. Verifique sua caixa de entrada e clique no link enviado pelo Supabase.' }
      }
      return { error: error.message }
    }

    await fetch('/api/auth/cookie', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: data.session?.access_token }),
    })

    const next = searchParams.get('next') ?? '/dashboard'
    router.push(next)
    router.refresh()
    return null
  }

  const [state, formAction, pending] = useActionState(loginAction, null)

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-primary">MyLine</Link>
          <p className="text-foreground/50 text-sm mt-2">Entre na sua conta</p>
        </div>

        {justConfirmed && (
          <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 mb-4 text-sm text-primary text-center">
            Conta criada! Confirme seu email e depois faça login aqui.
          </div>
        )}

        <form action={formAction} className="bg-surface border border-border rounded-xl p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-foreground/70">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="seu@email.com"
              className="bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-foreground/70">Senha</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          {state?.error && (
            <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full py-2.5 bg-primary text-black font-semibold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {pending ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-sm text-foreground/50 mt-4">
          Não tem conta?{' '}
          <Link href="/signup" className="text-primary hover:underline">Criar conta</Link>
        </p>
      </div>
    </div>
  )
}
