export async function GET(request: Request) {
  // Deriva a URL base do request — funciona em localhost e produção
  const reqUrl = new URL(request.url)
  const siteUrl = `${reqUrl.protocol}//${reqUrl.host}`
  const returnTo = `${siteUrl}/api/auth/steam/callback`

  const params = new URLSearchParams({
    'openid.ns':         'http://specs.openid.net/auth/2.0',
    'openid.mode':       'checkid_setup',
    'openid.return_to':  returnTo,
    'openid.realm':      siteUrl,
    'openid.identity':   'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
  })

  return Response.redirect(`https://steamcommunity.com/openid/login?${params}`)
}
