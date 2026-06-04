'use client'

import Link from 'next/link'
import { Suspense, useActionState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

type ActionState = { error: string } | null

function SteamIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.718L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.454 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.252 0-2.265-1.014-2.265-2.265z"/>
    </svg>
  )
}

function LoginForm() {
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

  function handleSteamLogin() {
    window.location.href = '/api/auth/steam'
  }

  const [state, formAction, pending] = useActionState(loginAction, null)

  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ height: 3, background: 'linear-gradient(90deg, var(--green), var(--cyan))' }} />
      <div style={{ padding: '24px 24px 20px' }}>
        <p className="font-condensed" style={{ fontWeight: 900, fontSize: 19, color: 'var(--white)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 4 }}>
          Entrar na conta
        </p>
        <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 20 }}>Bem-vindo de volta ao MyLine CS2</p>

        {justConfirmed && (
          <div style={{ background: 'rgba(0,240,117,.08)', border: '1px solid rgba(0,240,117,.25)', borderRadius: 8, padding: '10px 12px', marginBottom: 16, fontSize: 12, color: 'var(--green)' }}>
            ✓ Conta criada! Confirme seu email e faça login.
          </div>
        )}

        <button onClick={handleSteamLogin} style={{
          width: '100%', padding: '12px', borderRadius: 10, border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg, #1b2838, #2a475e)',
          color: '#c6d4df', fontFamily: 'inherit', fontSize: 14, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          marginBottom: 16,
          boxShadow: '0 0 0 1px rgba(103,193,245,.2)',
        }}>
          <SteamIcon />
          Entrar com Steam
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600 }}>ou email</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text3)' }}>Email</label>
            <input name="email" type="email" required placeholder="seu@email.com" style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text)', fontSize: 14, fontFamily: 'inherit', outline: 'none', width: '100%' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text3)' }}>Senha</label>
              <Link href="/forgot-password" style={{ fontSize: 11, color: 'var(--text3)', textDecoration: 'none' }}>Esqueci minha senha</Link>
            </div>
            <input name="password" type="password" required placeholder="••••••••" style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text)', fontSize: 14, fontFamily: 'inherit', outline: 'none', width: '100%' }} />
          </div>
          {state?.error && (
            <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 8, padding: '9px 12px', fontSize: 12, color: 'var(--red)' }}>{state.error}</div>
          )}
          <button type="submit" disabled={pending} className="btn-green" style={{ width: '100%', borderRadius: 8, padding: '11px', fontSize: 13, fontWeight: 900, fontFamily: 'inherit', border: 'none', letterSpacing: '.06em', textTransform: 'uppercase', cursor: pending ? 'not-allowed' : 'pointer', opacity: pending ? 0.6 : 1 }}>
            {pending ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
      <div style={{ padding: '14px 24px 20px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--text3)' }}>
          Não tem conta?{' '}
          <Link href="/signup" style={{ color: 'var(--green)', fontWeight: 700, textDecoration: 'none' }}>Criar conta grátis</Link>
        </span>
      </div>
    </div>
  )
}

export default function LoginPage() {
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
        <Suspense fallback={<div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: '40px', textAlign: 'center', color: 'var(--text3)' }}>Carregando...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
