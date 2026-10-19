import { db } from '@/lib/db/client'
import type { Experience, ExperienceAlbumItem } from '@/types'

export type { Experience, ExperienceAlbumItem }

export async function getAllExperiences(): Promise<Experience[]> {
  const rows = await db`SELECT * FROM experiences ORDER BY sort_order`
  return rows as unknown as Experience[]
}

export async function getExperienceById(id: string): Promise<Experience | null> {
  const rows = await db`SELECT * FROM experiences WHERE id = ${id} LIMIT 1`
  return (rows[0] as unknown as Experience) ?? null
}

export async function createExperience(data: { title: string; description?: string | null; year?: string | null; sort_order?: number; banner_image_url?: string | null }): Promise<Experience> {
  const order = data.sort_order ?? await getNextSortOrder()
  const rows = await db`
    INSERT INTO experiences (title, description, year, sort_order, banner_image_url)
    VALUES (${data.title}, ${data.description ?? null}, ${data.year ?? null}, ${order}, ${data.banner_image_url ?? null})
    RETURNING *`
  return rows[0] as unknown as Experience
}

export async function updateExperience(id: string, data: Partial<Omit<Experience, 'id' | 'created_at'>>): Promise<Experience | null> {
  const patch = { ...data, updated_at: new Date().toISOString() }
  const rows = await db`UPDATE experiences SET ${db(patch as any)} WHERE id = ${id} RETURNING *`
  return (rows[0] as unknown as Experience) ?? null
}

export async function deleteExperience(id: string): Promise<void> {
  await db`DELETE FROM experiences WHERE id = ${id}`
}

export async function reorderExperiences(ids: string[]): Promise<void> {
  await Promise.all(ids.map((id, i) => db`UPDATE experiences SET sort_order = ${i} WHERE id = ${id}`))
}

export async function getAlbumItemsByExperience(experienceId: string): Promise<ExperienceAlbumItem[]> {
  const rows = await db`SELECT * FROM experience_album_items WHERE experience_id = ${experienceId} ORDER BY sort_order`
  return rows as unknown as ExperienceAlbumItem[]
}

export async function addAlbumItem(data: { experience_id: string; image_url: string; caption?: string | null; sort_order?: number }): Promise<ExperienceAlbumItem> {
  const order = data.sort_order ?? await getNextAlbumSortOrder(data.experience_id)
  const rows = await db`
    INSERT INTO experience_album_items (experience_id, image_url, caption, sort_order)
    VALUES (${data.experience_id}, ${data.image_url}, ${data.caption ?? null}, ${order})
    RETURNING *`
  return rows[0] as unknown as ExperienceAlbumItem
}

export async function deleteAlbumItem(id: string): Promise<void> {
  await db`DELETE FROM experience_album_items WHERE id = ${id}`
}

export async function deleteAlbumByExperience(experienceId: string): Promise<void> {
  await db`DELETE FROM experience_album_items WHERE experience_id = ${experienceId}`
}

async function getNextSortOrder(): Promise<number> {
  const rows = await db`SELECT MAX(sort_order) as max FROM experiences`
  return ((rows[0]?.max as number) ?? -1) + 1
}

async function getNextAlbumSortOrder(experienceId: string): Promise<number> {
  const rows = await db`SELECT MAX(sort_order) as max FROM experience_album_items WHERE experience_id = ${experienceId}`
  return ((rows[0]?.max as number) ?? -1) + 1
}
