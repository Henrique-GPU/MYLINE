'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

type ActionState = { error: string } | { confirm: true; email: string } | null

export default function SignupPage() {
  const router = useRouter()

  async function signupAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const username = formData.get('username') as string

    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    })

    if (error) return { error: error.message }

    if (!data.session) {
      return { confirm: true, email }
    }

    await fetch('/api/auth/cookie', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: data.session.access_token }),
    })

    router.push('/dashboard')
    router.refresh()
    return null
  }

  const [state, formAction, pending] = useActionState(signupAction, null)

  if (state && 'confirm' in state) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="text-5xl mb-4">📧</div>
          <h1 className="text-xl font-bold mb-2">Confirme seu email</h1>
          <p className="text-foreground/50 text-sm mb-1">
            Enviamos um link de confirmação para:
          </p>
          <p className="text-primary font-medium text-sm mb-6">{state.email}</p>
          <p className="text-foreground/40 text-xs mb-6">
            Clique no link do email e depois volte para fazer login.
          </p>
          <Link
            href="/login"
            className="inline-block w-full py-2.5 bg-primary text-black font-semibold rounded-lg hover:bg-primary-dark transition-colors text-sm"
          >
            Ir para o login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-primary">MyLine</Link>
          <p className="text-foreground/50 text-sm mt-2">Crie sua conta gratuita</p>
        </div>

        <form action={formAction} className="bg-surface border border-border rounded-xl p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="username" className="text-sm font-medium text-foreground/70">Nome de usuário</label>
            <input
              id="username"
              name="username"
              type="text"
              required
              placeholder="seu_nick"
              className="bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

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
              minLength={6}
              placeholder="mínimo 6 caracteres"
              className="bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          {state && 'error' in state && (
            <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full py-2.5 bg-primary text-black font-semibold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {pending ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p className="text-center text-sm text-foreground/50 mt-4">
          Já tem conta?{' '}
          <Link href="/login" className="text-primary hover:underline">Entrar</Link>
        </p>
      </div>
    </div>
  )
}
