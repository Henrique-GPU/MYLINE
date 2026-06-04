export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const res = await fetch(`https://img-cdn.hltv.org/playerbodyshot/${id}.png`, {
    headers: {
      Referer: 'https://www.hltv.org',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
    next: { revalidate: 86400 },
  })

  if (!res.ok) return new Response(null, { status: 404 })

  const buffer = await res.arrayBuffer()
  return new Response(buffer, {
    headers: {
      'Content-Type': res.headers.get('Content-Type') ?? 'image/png',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
