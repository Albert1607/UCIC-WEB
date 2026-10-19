import { db } from '@/lib/db/client'
import type { SiteContent } from '@/types'

export type { SiteContent }

export async function getAllContent(): Promise<SiteContent[]> {
  const rows = await db`SELECT * FROM site_content ORDER BY key`
  return rows as unknown as SiteContent[]
}

export async function updateContentById(id: string, value: string): Promise<void> {
  await db`UPDATE site_content SET value = ${value}, updated_at = ${new Date().toISOString()} WHERE id = ${id}`
}
