import { db } from '@/lib/db/client'
import type { NewsItem } from '@/types'

export type { NewsItem }

export async function getAllNews(): Promise<NewsItem[]> {
  const rows = await db`SELECT * FROM news_items ORDER BY sort_order`
  return rows as unknown as NewsItem[]
}

export async function createNewsItem(data: { title: string; embed_url: string; thumbnail_url?: string | null; sort_order?: number }): Promise<NewsItem> {
  const order = data.sort_order ?? await getNextSortOrder()
  const rows = await db`
    INSERT INTO news_items (title, embed_url, thumbnail_url, sort_order)
    VALUES (${data.title}, ${data.embed_url}, ${data.thumbnail_url ?? null}, ${order})
    RETURNING *`
  return rows[0] as unknown as NewsItem
}

export async function updateNewsItem(id: string, data: Partial<Omit<NewsItem, 'id' | 'created_at'>>): Promise<NewsItem | null> {
  const patch = { ...data, updated_at: new Date().toISOString() }
  const rows = await db`UPDATE news_items SET ${db(patch as any)} WHERE id = ${id} RETURNING *`
  return (rows[0] as unknown as NewsItem) ?? null
}

export async function deleteNewsItem(id: string): Promise<void> {
  await db`DELETE FROM news_items WHERE id = ${id}`
}

async function getNextSortOrder(): Promise<number> {
  const rows = await db`SELECT MAX(sort_order) as max FROM news_items`
  return ((rows[0]?.max as number) ?? -1) + 1
}
