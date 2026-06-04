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
    { href: '/fantasy', label: 'Fantasy' },
    { href: '/comunidade', label: 'Comunidade' },
  ]

  return (
    <header className="border-b border-border px-6 py-4 flex items-center gap-6">
      <Link href="/dashboard" className="text-xl font-bold text-primary shrink-0">
        MyLine
      </Link>

      <nav className="flex items-center gap-1 flex-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              pathname.startsWith(link.href)
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-foreground/60 hover:text-foreground hover:bg-surface-2'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <span className="text-sm text-foreground/60 hidden sm:block">
              {user.user_metadata?.username ?? user.email?.split('@')[0]}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-foreground/40 hover:text-foreground/70 transition-colors"
            >
              Sair
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="text-sm px-3 py-1.5 bg-primary text-black font-medium rounded-lg hover:bg-primary-dark transition-colors"
          >
            Entrar
          </Link>
        )}
      </div>
    </header>
  )
}
