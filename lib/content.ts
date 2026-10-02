import { ContentMap, SiteContent, SiteStat } from '@/types'
import { createClient } from '@/lib/supabase/server'

/**
 * Fetch all site_content rows and return as a flat { key: value } map.
 * Uses the server client so it runs in Server Components.
 */
export async function getSiteContent(): Promise<ContentMap> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_content')
    .select('key, value')
    .order('key')

  const map: ContentMap = {}
  if (data) {
    data.forEach((row: { key: string; value: string | null }) => {
      map[row.key] = row.value ?? ''
    })
  }
  return map
}

export async function getSiteStats(): Promise<SiteStat[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_stats')
    .select('*')
    .order('sort_order')
  return data ?? []
}

/** Get a single content value by key, with a fallback default. */
export function c(map: ContentMap, key: string, fallback = ''): string {
  return map[key] ?? fallback
}
