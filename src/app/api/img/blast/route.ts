export async function GET() {
  const url = 'https://assets.blast.tv/images/tournament/bounty-2026-season-2?width=800&format=webp'
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://blast.tv/',
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
