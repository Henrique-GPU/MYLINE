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
  let steamName = `Steam_${steamId}`
  let steamAvatar = ''

  try {
    const profileRes = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_API_KEY}&steamids=${steamId}`
    )
    const profileData = await profileRes.json()
    const player = profileData?.response?.players?.[0]
    if (player) {
      steamName   = player.personaname ?? steamName
      steamAvatar = player.avatarfull ?? player.avatarmedium ?? ''
    }
  } catch { /* continua sem perfil */ }

  // 4. Criar/atualizar usuário no Supabase
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const email = `steam_${steamId}@myline.internal`

  const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
  const existing = existingUsers?.users?.find(u => u.email === email)

  let userId: string

  if (existing) {
    await supabaseAdmin.auth.admin.updateUserById(existing.id, {
      user_metadata: { username: steamName, steam_id: steamId, steam_avatar: steamAvatar, provider: 'steam' },
    })
    userId = existing.id
  } else {
    const { data: newUser, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
      password: `steam_${steamId}_myline`,
      user_metadata: { username: steamName, steam_id: steamId, steam_avatar: steamAvatar, provider: 'steam' },
    })
    if (error || !newUser?.user) {
      return Response.redirect(`${siteUrl}/login?error=create_failed`)
    }
    userId = newUser.user.id
  }

  // 5. Gerar magic link para criar sessão
  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: { redirectTo: `${siteUrl}/api/auth/steam/session` },
  })

  if (linkError || !linkData?.properties?.hashed_token) {
    return Response.redirect(`${siteUrl}/login?steam=ok&name=${encodeURIComponent(steamName)}`)
  }

  return Response.redirect(`${siteUrl}/api/auth/steam/session?token_hash=${linkData.properties.hashed_token}`)
}
