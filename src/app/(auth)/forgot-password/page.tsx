'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

type State = { error: string } | { sent: true; email: string } | null

export default function ForgotPasswordPage() {
  async function action(_prev: State, formData: FormData): Promise<State> {
    const email = formData.get('email') as string
    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) return { error: error.message }
    return { sent: true, email }
  }

  const [state, formAction, pending] = useActionState(action, null)

  if (state && 'sent' in state) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ textAlign: 'center', maxWidth: 360 }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>📨</div>
          <h1 className="font-condensed" style={{ fontWeight: 900, fontSize: 24, color: 'var(--white)', textTransform: 'uppercase', marginBottom: 8 }}>Link enviado!</h1>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 4 }}>Enviamos um link de redefinição para:</p>
          <p style={{ fontSize: 14, color: 'var(--green)', fontWeight: 700, marginBottom: 20 }}>{state.email}</p>
          <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 24 }}>Verifique seu email e clique no link.</p>
          <Link href="/login" style={{ color: 'var(--green)', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>← Voltar para o login</Link>
        </div>
      </div>
    )
  }

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
            <p className="font-condensed" style={{ fontWeight: 900, fontSize: 19, color: 'var(--white)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 4 }}>Recuperar senha</p>
            <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 20 }}>Enviaremos um link para redefinir sua senha.</p>
            <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text3)' }}>Email</label>
                <input name="email" type="email" required placeholder="seu@email.com" style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text)', fontSize: 14, fontFamily: 'inherit', outline: 'none', width: '100%' }} />
              </div>
              {state && 'error' in state && (
                <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 8, padding: '9px 12px', fontSize: 12, color: 'var(--red)' }}>{state.error}</div>
              )}
              <button type="submit" disabled={pending} className="btn-green" style={{ width: '100%', borderRadius: 8, padding: '11px', fontSize: 13, fontWeight: 900, fontFamily: 'inherit', border: 'none', letterSpacing: '.06em', textTransform: 'uppercase', cursor: pending ? 'not-allowed' : 'pointer', opacity: pending ? 0.6 : 1 }}>
                {pending ? 'Enviando...' : 'Enviar link'}
              </button>
            </form>
          </div>
          <div style={{ padding: '14px 24px 20px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
            <Link href="/login" style={{ fontSize: 12, color: 'var(--text3)', textDecoration: 'none' }}>← Voltar para o login</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
