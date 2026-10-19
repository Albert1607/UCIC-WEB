import { ContentMap, SiteStat } from '@/types'
import { getAllContent } from '@/lib/db/queries/content'
import { getAllStats } from '@/lib/db/queries/stats'

/**
 * Fetch all site_content rows and return as a flat { key: value } map.
 * Uses the database query so it runs on any PostgreSQL database.
 */
export async function getSiteContent(): Promise<ContentMap> {
  const data = await getAllContent()
  const map: ContentMap = {}
  if (data) {
    data.forEach((row) => {
      map[row.key] = row.value ?? ''
    })
  }
  return map
}

export async function getSiteStats(): Promise<SiteStat[]> {
  const data = await getAllStats()
  return data as unknown as SiteStat[]
}

/** Get a single content value by key, with a fallback default. */
export function c(map: ContentMap, key: string, fallback = ''): string {
  return map[key] ?? fallback
}
