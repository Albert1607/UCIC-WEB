import { db } from '@/lib/db/client'
import type { TimelineItem } from '@/types'

export type { TimelineItem }

export async function getAllTimeline(): Promise<TimelineItem[]> {
  const rows = await db`SELECT * FROM timeline_items ORDER BY sort_order`
  return rows as unknown as TimelineItem[]
}

export async function createTimelineItem(data: { year: string; title: string; description?: string | null; sort_order?: number; image_urls?: string[] }): Promise<TimelineItem> {
  const order = data.sort_order ?? await getNextSortOrder()
  const rows = await db`
    INSERT INTO timeline_items (year, title, description, sort_order, image_urls)
    VALUES (${data.year}, ${data.title}, ${data.description ?? null}, ${order}, ${db.json((data.image_urls ?? []) as any)})
    RETURNING *`
  return rows[0] as unknown as TimelineItem
}

export async function updateTimelineItem(id: string, data: Partial<Omit<TimelineItem, 'id' | 'created_at'>>): Promise<TimelineItem | null> {
  const now = new Date().toISOString()
  const { image_urls, ...rest } = data
  if (image_urls !== undefined) {
    const rows = await db`
      UPDATE timeline_items SET ${db({ ...rest, updated_at: now } as any)}, image_urls = ${db.json((image_urls ?? []) as any)}
      WHERE id = ${id} RETURNING *`
    return (rows[0] as unknown as TimelineItem) ?? null
  }
  const rows = await db`UPDATE timeline_items SET ${db({ ...rest, updated_at: now } as any)} WHERE id = ${id} RETURNING *`
  return (rows[0] as unknown as TimelineItem) ?? null
}

export async function deleteTimelineItem(id: string): Promise<void> {
  await db`DELETE FROM timeline_items WHERE id = ${id}`
}

export async function reorderTimelineItems(ids: string[]): Promise<void> {
  await Promise.all(ids.map((id, i) => db`UPDATE timeline_items SET sort_order = ${i} WHERE id = ${id}`))
}

async function getNextSortOrder(): Promise<number> {
  const rows = await db`SELECT MAX(sort_order) as max FROM timeline_items`
  return ((rows[0]?.max as number) ?? -1) + 1
}
