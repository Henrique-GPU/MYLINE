import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const params = Object.fromEntries(url.searchParams.entries())
  const siteUrl = `${url.protocol}//${url.host}`

  // 1. Verificar com Steam
  const verifyParams = new URLSearchParams({ ...params, 'openid.mode': 'check_authentication' })
  const verifyRes = await fetch('https://steamcommunity.com/openid/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: verifyParams.toString(),
  })
  const verifyText = await verifyRes.text()
  if (!verifyText.includes('is_valid:true')) {
    return Response.redirect(`${siteUrl}/login?error=steam_invalid`)
  }

  // 2. Extrair Steam ID
  const claimedId = params['openid.claimed_id'] ?? ''
  const steamId = claimedId.split('/').pop()
  if (!steamId) return Response.redirect(`${siteUrl}/login?error=no_steam_id`)

  // 3. Buscar perfil Steam
  let steamName = `player_${steamId.slice(-6)}`
  let steamAvatar = ''
  try {
    const profileRes = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_API_KEY}&steamids=${steamId}`
    )
    const profileData = await profileRes.json()
    const player = profileData?.response?.players?.[0]
    if (player) { steamName = player.personaname ?? steamName; steamAvatar = player.avatarfull ?? '' }
  } catch { /* sem perfil */ }

  // Remove BOM e espaços que o PowerShell pode adicionar às env vars
  const cleanKey = (k?: string) => (k ?? '').replace(/^﻿/, '').trim()

  const supabaseAdmin = createClient(
    cleanKey(process.env.NEXT_PUBLIC_SUPABASE_URL),
    cleanKey(process.env.SUPABASE_SERVICE_ROLE_KEY),
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const email    = `steam_${steamId}@myline.app`
  const password = `steam_${steamId}`
  const metadata = { username: steamName, steam_id: steamId, steam_avatar: steamAvatar, provider: 'steam' }

  // 4. Tenta criar usuário
  const { error: createError } = await supabaseAdmin.auth.admin.createUser({
    email, password, email_confirm: true, user_metadata: metadata,
  })

  // Se já existe, atualiza senha e metadata (garante consistência)
  if (createError) {
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
    const existing = users?.find(u => u.email === email)
    if (existing) {
      await supabaseAdmin.auth.admin.updateUserById(existing.id, {
        password, user_metadata: metadata,
      })
    }
  }

  // 5. Login com email/senha
  const supabase = createClient(
    cleanKey(process.env.NEXT_PUBLIC_SUPABASE_URL),
    cleanKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  )

  const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

  if (signInError || !data.session) {
    return Response.redirect(`${siteUrl}/login?error=steam_session_failed&detail=${encodeURIComponent(signInError?.message ?? 'no_session')}`)
  }

  // 6. Cookie
  const cookieStore = await cookies()
  cookieStore.set('myline-token', data.session.access_token, {
    httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7,
  })

  return Response.redirect(`${siteUrl}/dashboard`)
}
