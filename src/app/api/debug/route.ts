import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

  const urlClean = url.replace(/^﻿/, '').trim()
  const keyClean = key.replace(/^﻿/, '').trim()

  try {
    const supabase = createClient(urlClean, keyClean)
    const { data, error, count } = await supabase
      .from('championships')
      .select('id, name', { count: 'exact' })
      .limit(3)

    return Response.json({
      ok: !error,
      urlLength: urlClean.length,
      keyLength: keyClean.length,
      urlStart: urlClean.substring(0, 20),
      count,
      data,
      error: error?.message,
    })
  } catch (e) {
    return Response.json({ ok: false, exception: String(e) })
  }
}
