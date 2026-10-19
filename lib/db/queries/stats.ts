import { db } from '@/lib/db/client'
import type { SiteStat } from '@/types'

export type { SiteStat }

export async function getAllStats(): Promise<SiteStat[]> {
  const rows = await db`SELECT * FROM site_stats ORDER BY sort_order`
  return rows as unknown as SiteStat[]
}

export async function createStat(data: { label: string; value: string; icon?: string | null; sort_order?: number }): Promise<SiteStat> {
  const order = data.sort_order ?? await getNextSortOrder()
  const rows = await db`
    INSERT INTO site_stats (label, value, icon, sort_order)
    VALUES (${data.label}, ${data.value}, ${data.icon ?? null}, ${order})
    RETURNING *`
  return rows[0] as unknown as SiteStat
}

export async function updateStat(id: string, data: Partial<Omit<SiteStat, 'id' | 'created_at'>>): Promise<SiteStat | null> {
  const patch = { ...data, updated_at: new Date().toISOString() }
  const rows = await db`UPDATE site_stats SET ${db(patch as any)} WHERE id = ${id} RETURNING *`
  return (rows[0] as unknown as SiteStat) ?? null
}

export async function deleteStat(id: string): Promise<void> {
  await db`DELETE FROM site_stats WHERE id = ${id}`
}

export async function reorderStats(ids: string[]): Promise<void> {
  await Promise.all(ids.map((id, i) => db`UPDATE site_stats SET sort_order = ${i} WHERE id = ${id}`))
}

async function getNextSortOrder(): Promise<number> {
  const rows = await db`SELECT MAX(sort_order) as max FROM site_stats`
  return ((rows[0]?.max as number) ?? -1) + 1
}
