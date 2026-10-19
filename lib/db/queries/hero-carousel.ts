import { db } from '@/lib/db/client'
import type { HeroCarouselItem } from '@/types'

export type { HeroCarouselItem }

export async function getAllCarouselItems(): Promise<HeroCarouselItem[]> {
  const rows = await db`SELECT * FROM hero_carousel_items ORDER BY sort_order`
  return rows as unknown as HeroCarouselItem[]
}

export async function createCarouselItem(data: { media_url: string; media_type: 'image' | 'video'; sort_order?: number }): Promise<HeroCarouselItem> {
  const order = data.sort_order ?? await getNextSortOrder()
  const rows = await db`
    INSERT INTO hero_carousel_items (media_url, media_type, sort_order)
    VALUES (${data.media_url}, ${data.media_type}, ${order})
    RETURNING *`
  return rows[0] as unknown as HeroCarouselItem
}

export async function reorderCarouselItems(ids: string[]): Promise<void> {
  await Promise.all(ids.map((id, i) => db`UPDATE hero_carousel_items SET sort_order = ${i} WHERE id = ${id}`))
}

export async function deleteCarouselItem(id: string): Promise<void> {
  await db`DELETE FROM hero_carousel_items WHERE id = ${id}`
}

async function getNextSortOrder(): Promise<number> {
  const rows = await db`SELECT MAX(sort_order) as max FROM hero_carousel_items`
  return ((rows[0]?.max as number) ?? -1) + 1
}
