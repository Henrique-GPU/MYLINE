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
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { username } } })
    if (error) return { error: error.message }
    if (!data.session) return { confirm: true, email }
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
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ textAlign: 'center', maxWidth: 360 }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>📧</div>
          <h1 className="font-condensed" style={{ fontWeight: 900, fontSize: 24, color: 'var(--white)', textTransform: 'uppercase', marginBottom: 8 }}>Confirme seu email</h1>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 4 }}>Enviamos um link para:</p>
          <p style={{ fontSize: 14, color: 'var(--green)', fontWeight: 700, marginBottom: 20 }}>{state.email}</p>
          <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 24 }}>Clique no link do email e depois faça login.</p>
          <Link href="/login" className="btn-green" style={{ display: 'inline-block', borderRadius: 8, padding: '10px 28px', fontSize: 13, fontWeight: 900, textDecoration: 'none', fontFamily: 'inherit', letterSpacing: '.06em', textTransform: 'uppercase' }}>
            Ir para o login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 500, height: 300, background: 'radial-gradient(ellipse, rgba(0,240,117,.06), transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
            <span className="font-condensed text-gradient-green" style={{ fontWeight: 900, fontSize: 32, letterSpacing: '.06em', textTransform: 'uppercase', lineHeight: 1, display: 'block' }}>MyLine</span>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--text3)' }}>CS2 FANTASY</span>
          </Link>
        </div>

        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ height: 3, background: 'linear-gradient(90deg, var(--green), var(--cyan))' }} />
          <div style={{ padding: '24px 24px 20px' }}>
            <p className="font-condensed" style={{ fontWeight: 900, fontSize: 19, color: 'var(--white)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 4 }}>Criar conta</p>
            <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 20 }}>Junte-se ao MyLine CS2 gratuitamente</p>

            <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { name: 'username', label: 'Nome de usuário', type: 'text', placeholder: 'seu_nick', required: true },
                { name: 'email',    label: 'Email',           type: 'email', placeholder: 'seu@email.com', required: true },
                { name: 'password', label: 'Senha',           type: 'password', placeholder: 'mínimo 6 caracteres', required: true },
              ].map(f => (
                <div key={f.name} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text3)' }}>{f.label}</label>
                  <input name={f.name} type={f.type} required={f.required} placeholder={f.placeholder} minLength={f.name === 'password' ? 6 : undefined} style={{
                    background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8,
                    padding: '10px 14px', color: 'var(--text)', fontSize: 14, fontFamily: 'inherit',
                    outline: 'none', width: '100%',
                  }} />
                </div>
              ))}

              {state && 'error' in state && (
                <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 8, padding: '9px 12px', fontSize: 12, color: 'var(--red)' }}>
                  {state.error}
                </div>
              )}

              <button type="submit" disabled={pending} className="btn-green" style={{
                width: '100%', borderRadius: 8, padding: '11px', fontSize: 13, fontWeight: 900,
                fontFamily: 'inherit', border: 'none', letterSpacing: '.06em', textTransform: 'uppercase',
                cursor: pending ? 'not-allowed' : 'pointer', opacity: pending ? 0.6 : 1, marginTop: 4,
              }}>
                {pending ? 'Criando...' : 'Criar conta'}
              </button>
            </form>
          </div>
          <div style={{ padding: '14px 24px 20px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>
              Já tem conta?{' '}
              <Link href="/login" style={{ color: 'var(--green)', fontWeight: 700, textDecoration: 'none' }}>Entrar</Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
