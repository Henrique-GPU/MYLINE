import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const clean = (k?: string) => (k ?? '').replace(/^﻿/, '').trim()

export function getSupabaseServerClient() {
  return createClient<Database>(
    clean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  )
}
