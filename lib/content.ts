import { ContentMap, SiteStat } from '@/types'
import { getAllContent } from '@/lib/db/queries/content'
import { getAllStats } from '@/lib/db/queries/stats'

/**
 * Fetch all site_content rows and return as a flat { key: value } map.
 * Gracefully falls back to empty map if database is not reachable at build time.
 */
export async function getSiteContent(): Promise<ContentMap> {
  try {
    const data = await getAllContent()
    const map: ContentMap = {}
    if (data) {
      data.forEach((row) => {
        map[row.key] = row.value ?? ''
      })
    }
    return map
  } catch (err) {
    console.warn('Notice: Unable to fetch site_content, using fallback defaults.')
    return {}
  }
}

export async function getSiteStats(): Promise<SiteStat[]> {
  try {
    const data = await getAllStats()
    return (data ?? []) as unknown as SiteStat[]
  } catch (err) {
    console.warn('Notice: Unable to fetch site_stats, using fallback defaults.')
    return []
  }
}

/** Get a single content value by key, with a fallback default. */
export function c(map: ContentMap, key: string, fallback = ''): string {
  return map[key] ?? fallback
}
