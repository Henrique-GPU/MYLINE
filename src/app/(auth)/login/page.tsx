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
      if (error.message.toLowerCase().includes('email not confirmed'))
        return { error: 'Email ainda não confirmado. Verifique sua caixa de entrada.' }
      return { error: error.message }
    }
    await fetch('/api/auth/cookie', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: data.session?.access_token }),
    })
    router.push(searchParams.get('next') ?? '/dashboard')
    router.refresh()
    return null
  }

  const [state, formAction, pending] = useActionState(loginAction, null)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', position: 'relative', overflow: 'hidden' }}>
      {/* Background glow */}
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 500, height: 300, background: 'radial-gradient(ellipse, rgba(0,240,117,.06), transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
            <span className="font-condensed text-gradient-green" style={{ fontWeight: 900, fontSize: 32, letterSpacing: '.06em', textTransform: 'uppercase', lineHeight: 1, display: 'block' }}>MyLine</span>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--text3)' }}>CS2 FANTASY</span>
          </Link>
        </div>

        {/* Card */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ height: 3, background: 'linear-gradient(90deg, var(--green), var(--cyan))' }} />

          <div style={{ padding: '24px 24px 20px' }}>
            <p className="font-condensed" style={{ fontWeight: 900, fontSize: 19, color: 'var(--white)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 4 }}>
              Entrar na conta
            </p>
            <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 20 }}>
              Bem-vindo de volta ao MyLine CS2
            </p>

            {justConfirmed && (
              <div style={{ background: 'rgba(0,240,117,.08)', border: '1px solid rgba(0,240,117,.25)', borderRadius: 8, padding: '10px 12px', marginBottom: 16, fontSize: 12, color: 'var(--green)' }}>
                ✓ Conta criada! Confirme seu email e faça login.
              </div>
            )}

            <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text3)' }}>Email</label>
                <input name="email" type="email" required placeholder="seu@email.com" style={{
                  background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8,
                  padding: '10px 14px', color: 'var(--text)', fontSize: 14, fontFamily: 'inherit',
                  outline: 'none', transition: 'border-color .15s', width: '100%',
                }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text3)' }}>Senha</label>
                  <Link href="/forgot-password" style={{ fontSize: 11, color: 'var(--text3)', textDecoration: 'none' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--green)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text3)'}
                  >
                    Esqueci minha senha
                  </Link>
                </div>
                <input name="password" type="password" required placeholder="••••••••" style={{
                  background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8,
                  padding: '10px 14px', color: 'var(--text)', fontSize: 14, fontFamily: 'inherit',
                  outline: 'none', transition: 'border-color .15s', width: '100%',
                }} />
              </div>

              {state?.error && (
                <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 8, padding: '9px 12px', fontSize: 12, color: 'var(--red)' }}>
                  {state.error}
                </div>
              )}

              <button type="submit" disabled={pending} className="btn-green" style={{
                width: '100%', borderRadius: 8, padding: '11px', fontSize: 13, fontWeight: 900,
                fontFamily: 'inherit', border: 'none', letterSpacing: '.06em', textTransform: 'uppercase',
                cursor: pending ? 'not-allowed' : 'pointer', opacity: pending ? 0.6 : 1, marginTop: 4,
              }}>
                {pending ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          </div>

          <div style={{ padding: '14px 24px 20px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>
              Não tem conta?{' '}
              <Link href="/signup" style={{ color: 'var(--green)', fontWeight: 700, textDecoration: 'none' }}>
                Criar conta grátis
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
