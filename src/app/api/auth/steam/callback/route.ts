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
    if (player) {
      steamName   = player.personaname ?? steamName
      steamAvatar = player.avatarfull ?? ''
    }
  } catch { /* sem perfil */ }

  // 4. Criar/atualizar usuário no Supabase via admin
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const email    = `steam_${steamId}@myline.internal`
  const password = `SteamML_${steamId}_2026`

  // Tenta criar usuário — se já existe, ignora o erro
  await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      username:     steamName,
      steam_id:     steamId,
      steam_avatar: steamAvatar,
      provider:     'steam',
    },
  })

  // 5. Faz login com email/senha para obter sessão
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.session) {
    return Response.redirect(`${siteUrl}/login?error=steam_session_failed`)
  }

  // 6. Salva cookie HttpOnly
  const cookieStore = await cookies()
  cookieStore.set('myline-token', data.session.access_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  return Response.redirect(`${siteUrl}/dashboard`)
}
