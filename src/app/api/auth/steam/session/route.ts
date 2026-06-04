import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const token_hash = url.searchParams.get('token_hash')
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  if (!token_hash) {
    return NextResponse.redirect(new URL('/login?error=no_token', siteUrl))
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase.auth.verifyOtp({
    token_hash,
    type: 'magiclink',
  })

  if (error || !data.session) {
    return NextResponse.redirect(new URL('/login?error=session_failed', siteUrl))
  }

  const cookieStore = await cookies()
  cookieStore.set('myline-token', data.session.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  return NextResponse.redirect(new URL('/dashboard', siteUrl))
}
