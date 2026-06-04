'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    const supabase = getSupabaseBrowserClient()
    await supabase.auth.signOut()
    await fetch('/api/auth/cookie', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: null }),
    })
    router.push('/')
    router.refresh()
  }

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/fantasy',   label: 'Fantasy' },
    { href: '/comunidade', label: 'Comunidade' },
  ]

  const username = user?.user_metadata?.username ?? user?.email?.split('@')[0] ?? ''
  const initials = username.slice(0, 2).toUpperCase()

  return (
    <header
      style={{
        height: 58,
        background: 'rgba(5,8,15,.97)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(14px)',
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 300,
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: 6,
      }}
    >
      {/* Logo */}
      <Link href="/dashboard" style={{ display: 'flex', flexDirection: 'column', marginRight: 12, textDecoration: 'none', flexShrink: 0 }}>
        <span
          className="font-condensed text-gradient-green"
          style={{ fontWeight: 900, fontSize: 20, letterSpacing: '.06em', textTransform: 'uppercase', lineHeight: 1 }}
        >
          MyLine
        </span>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text3)' }}>
          CS2
        </span>
      </Link>

      {/* Nav links */}
      <nav style={{ display: 'flex', gap: 2 }}>
        {links.map((link) => {
          const active = pathname.startsWith(link.href)
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                background: active ? 'rgba(0,240,117,.08)' : 'transparent',
                color: active ? 'var(--green)' : 'var(--text2)',
                border: 'none',
                borderRadius: 6,
                padding: '7px 12px',
                fontFamily: 'inherit',
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                transition: 'all .15s',
              }}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>

      {/* Right side */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {/* Round pill */}
        <div style={{
          background: 'rgba(255,200,50,.06)',
          border: '1px solid rgba(255,200,50,.2)',
          borderRadius: 20,
          padding: '5px 12px',
          fontSize: 11,
          color: 'var(--yellow)',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          whiteSpace: 'nowrap',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--yellow)', display: 'inline-block', animation: 'blink 1.2s ease-in-out infinite' }} />
          BLAST Bounty S2
        </div>

        {user ? (
          <>
            <div
              style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--green), var(--cyan))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, fontSize: 13, color: '#000', cursor: 'pointer', flexShrink: 0,
              }}
              title={username}
            >
              {initials || '?'}
            </div>
            <button
              onClick={handleLogout}
              style={{
                background: 'transparent',
                border: '1px solid var(--border2)',
                borderRadius: 6,
                color: 'var(--text2)',
                fontSize: 12,
                fontWeight: 600,
                padding: '5px 10px',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Sair
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="btn-green"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              borderRadius: 8, padding: '7px 14px',
              fontFamily: 'inherit', fontSize: 12,
              fontWeight: 700, textDecoration: 'none',
              letterSpacing: '.06em', textTransform: 'uppercase',
            }}
          >
            Entrar
          </Link>
        )}
      </div>
    </header>
  )
}
