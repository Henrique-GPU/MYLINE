'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

const NAV_LINKS = [
  { href: '/dashboard',  label: 'Arena',        icon: '⚡' },
  { href: '/fantasy',    label: 'Campeonatos',   icon: '🏆' },
  { href: '/ligas',      label: 'Ligas',         icon: '🏅' },
  { href: '/times',      label: 'Times',         icon: '🛡️' },
  { href: '/jogadores',  label: 'Jogadores',     icon: '👤' },
  { href: '/comunidade', label: 'Comunidade',    icon: '🎮' },
]

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

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

  const username    = user?.user_metadata?.username ?? user?.email?.split('@')[0] ?? ''
  const steamAvatar = user?.user_metadata?.steam_avatar as string | undefined
  const initials    = username.slice(0, 2).toUpperCase()

  return (
    <header style={{
      height: 58,
      background: 'rgba(5,8,15,.98)',
      borderBottom: '1px solid var(--border)',
      backdropFilter: 'blur(20px)',
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 300,
      display: 'flex', alignItems: 'center', padding: '0 20px', gap: 0,
    }}>
      {/* Logo */}
      <Link href="/dashboard" style={{ display: 'flex', flexDirection: 'column', marginRight: 20, textDecoration: 'none', flexShrink: 0 }}>
        <span className="font-condensed text-gradient-green" style={{ fontWeight: 900, fontSize: 20, letterSpacing: '.06em', textTransform: 'uppercase', lineHeight: 1 }}>MyLine</span>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--text3)' }}>CS2</span>
      </Link>

      {/* Divider */}
      <div style={{ width: 1, height: 22, background: 'var(--border)', marginRight: 16, flexShrink: 0 }} />

      {/* Nav links */}
      <nav style={{ display: 'flex', flex: 1, height: '100%' }}>
        {NAV_LINKS.map((link) => {
          const active = pathname.startsWith(link.href)
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '0 14px', height: '100%', textDecoration: 'none',
                fontFamily: 'inherit', fontSize: 13, fontWeight: active ? 700 : 500,
                color: active ? 'var(--green)' : 'var(--text2)',
                position: 'relative',
                borderBottom: active ? '2px solid var(--green)' : '2px solid transparent',
                transition: 'color .15s, border-color .15s',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ fontSize: 12, opacity: active ? 1 : .6 }}>{link.icon}</span>
              {link.label}
            </Link>
          )
        })}
      </nav>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        {/* Round indicator */}
        <div style={{
          background: 'rgba(255,107,0,.08)', border: '1px solid rgba(255,107,0,.2)',
          borderRadius: 20, padding: '4px 12px', fontSize: 11, color: 'var(--orange)',
          fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap',
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--orange)', display: 'inline-block', animation: 'blink 1.2s ease-in-out infinite' }} />
          BLAST Bounty S2
        </div>

        {user ? (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setMenuOpen(o => !o)}
              style={{
                width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                background: steamAvatar ? 'transparent' : 'linear-gradient(135deg, var(--green), var(--cyan))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, fontSize: 12, color: '#000', cursor: 'pointer',
                border: 'none', fontFamily: 'var(--font-condensed)',
                boxShadow: '0 0 10px rgba(0,240,117,.3)',
                overflow: 'hidden', padding: 0,
              }}
              title={username}
            >
              {steamAvatar
                ? <img src={steamAvatar} alt={username} width={34} height={34} style={{ objectFit: 'cover', borderRadius: '50%' }} />
                : (initials || '?')
              }
            </button>

            {menuOpen && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setMenuOpen(false)} />
                <div style={{
                  position: 'absolute', top: 44, right: 0, zIndex: 20,
                  background: 'var(--bg2)', border: '1px solid var(--border2)',
                  borderRadius: 12, overflow: 'hidden', minWidth: 200,
                  boxShadow: '0 12px 32px rgba(0,0,0,.5)',
                }}>
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', background: 'rgba(0,240,117,.03)' }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--white)', marginBottom: 2 }}>{username}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{user.email}</div>
                  </div>
                  {[
                    { href: '/perfil',    label: 'Meu Perfil',   icon: '👤' },
                    { href: '/dashboard', label: 'Arena',         icon: '⚡' },
                    { href: '/fantasy',   label: 'Campeonatos',   icon: '🏆' },
                  ].map(item => (
                    <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
                      fontSize: 13, fontWeight: 600, color: 'var(--text2)', textDecoration: 'none',
                    }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg3)'; (e.currentTarget as HTMLElement).style.color = 'var(--white)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text2)' }}
                    >
                      <span>{item.icon}</span> {item.label}
                    </Link>
                  ))}
                  <div style={{ borderTop: '1px solid var(--border)' }}>
                    <button onClick={() => { setMenuOpen(false); handleLogout() }} style={{
                      display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                      textAlign: 'left', padding: '10px 16px', fontSize: 13, fontWeight: 600,
                      color: 'var(--red)', background: 'transparent', border: 'none',
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,.06)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span>🚪</span> Sair da conta
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <Link href="/login" className="btn-green" style={{
            display: 'flex', alignItems: 'center', gap: 6, borderRadius: 8,
            padding: '7px 16px', fontFamily: 'inherit', fontSize: 12, fontWeight: 700,
            textDecoration: 'none', letterSpacing: '.06em', textTransform: 'uppercase',
          }}>
            Entrar
          </Link>
        )}
      </div>
    </header>
  )
}
