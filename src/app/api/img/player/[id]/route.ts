export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const res = await fetch(
      `https://img-cdn.hltv.org/playerres/${id}.png`,
      {
        headers: {
          'Referer': 'https://www.hltv.org/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        },
      }
    )

    if (!res.ok) {
      console.log(`[img-proxy] HLTV returned ${res.status} for player ${id}`)
      return new Response(`HLTV ${res.status}`, { status: res.status })
    }

    const buffer = await res.arrayBuffer()
    return new Response(buffer, {
      headers: {
        'Content-Type': res.headers.get('Content-Type') ?? 'image/png',
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch (err) {
    console.error(`[img-proxy] Error fetching player ${id}:`, err)
    return new Response('fetch error', { status: 502 })
  }
}
