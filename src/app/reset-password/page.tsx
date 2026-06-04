'use client'

import Link from 'next/link'
import { useEffect, useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

type State = { error: string } | null

export default function ResetPasswordPage() {
  const router = useRouter()

  useEffect(() => {
    // Supabase detecta o hash automaticamente no carregamento
    const supabase = getSupabaseBrowserClient()
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // sessão estabelecida, usuário pode redefinir
      }
    })
  }, [])

  async function action(_prev: State, formData: FormData): Promise<State> {
    const password = formData.get('password') as string
    const confirm  = formData.get('confirm') as string
    if (password !== confirm) return { error: 'As senhas não coincidem.' }
    if (password.length < 6) return { error: 'Senha deve ter ao menos 6 caracteres.' }

    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) return { error: error.message }

    await fetch('/api/auth/cookie', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: null }),
    })
    router.push('/login?reset=1')
    return null
  }

  const [state, formAction, pending] = useActionState(action, null)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 500, height: 300, background: 'radial-gradient(ellipse, rgba(0,240,117,.05), transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span className="font-condensed text-gradient-green" style={{ fontWeight: 900, fontSize: 32, letterSpacing: '.06em', textTransform: 'uppercase', display: 'block' }}>MyLine</span>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--text3)' }}>CS2 FANTASY</span>
          </Link>
        </div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ height: 3, background: 'linear-gradient(90deg, var(--green), var(--cyan))' }} />
          <div style={{ padding: '24px' }}>
            <p className="font-condensed" style={{ fontWeight: 900, fontSize: 19, color: 'var(--white)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 4 }}>Nova senha</p>
            <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 20 }}>Defina uma nova senha para sua conta.</p>
            <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { name: 'password', label: 'Nova senha',      placeholder: 'mínimo 6 caracteres' },
                { name: 'confirm',  label: 'Confirmar senha', placeholder: 'repita a senha' },
              ].map(f => (
                <div key={f.name} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text3)' }}>{f.label}</label>
                  <input name={f.name} type="password" required minLength={6} placeholder={f.placeholder} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text)', fontSize: 14, fontFamily: 'inherit', outline: 'none', width: '100%' }} />
                </div>
              ))}
              {state?.error && (
                <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 8, padding: '9px 12px', fontSize: 12, color: 'var(--red)' }}>{state.error}</div>
              )}
              <button type="submit" disabled={pending} className="btn-green" style={{ width: '100%', borderRadius: 8, padding: '11px', fontSize: 13, fontWeight: 900, fontFamily: 'inherit', border: 'none', letterSpacing: '.06em', textTransform: 'uppercase', cursor: pending ? 'not-allowed' : 'pointer', opacity: pending ? 0.6 : 1 }}>
                {pending ? 'Salvando...' : 'Salvar nova senha'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
