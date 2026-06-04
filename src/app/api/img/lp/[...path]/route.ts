export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const url = `https://liquipedia.net/commons/images/${path.join('/')}`

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://liquipedia.net/',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
      },
    })
    if (!res.ok) return new Response(null, { status: 404 })
    const buffer = await res.arrayBuffer()
    return new Response(buffer, {
      headers: {
        'Content-Type': res.headers.get('Content-Type') ?? 'image/png',
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch {
    return new Response(null, { status: 502 })
  }
}
