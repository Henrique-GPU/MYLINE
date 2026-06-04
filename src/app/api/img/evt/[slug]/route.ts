const BANNER_URLS: Record<string, string> = {
  'blast-bounty-s2':    'https://assets.blast.tv/images/tournament/bounty-2026-season-2?width=800&format=webp',
  'blast-open-porto':   'https://assets.blast.tv/images/tournament/open-2026-season-2?width=800&format=webp',
  'blast-rivals-s2':    'https://assets.blast.tv/images/tournament/rivals-2026-season-2?width=800&format=webp',
  'esl-pro-league-s24': 'https://assets.blast.tv/images/tournament/esl-pro-league-season-24-2026?width=800&format=webp',
  'ewc-2026':           'https://d3h9qea4qy4169.cloudfront.net/EWC_Web_Game_Hero_Banners_CS_2_001_8f141e3b12.jpg',
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const url = BANNER_URLS[slug]
  if (!url) return new Response(null, { status: 404 })

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': url.includes('blast.tv') ? 'https://blast.tv/' : 'https://esportsworldcup.com/',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
      },
    })
    if (!res.ok) return new Response(null, { status: 404 })
    const buffer = await res.arrayBuffer()
    return new Response(buffer, {
      headers: {
        'Content-Type': res.headers.get('Content-Type') ?? 'image/webp',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch {
    return new Response(null, { status: 502 })
  }
}
