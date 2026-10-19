import { db } from '@/lib/db/client'
import type { Event } from '@/types'

export type { Event }

export async function getEventBySlug(slug: string, publishedOnly = false): Promise<Event | null> {
  const rows = publishedOnly
    ? await db`SELECT * FROM events WHERE slug = ${slug} AND is_published = true LIMIT 1`
    : await db`SELECT * FROM events WHERE slug = ${slug} LIMIT 1`
  return (rows[0] as unknown as Event) ?? null
}

export async function getEventById(id: string): Promise<Event | null> {
  const rows = await db`SELECT * FROM events WHERE id = ${id} LIMIT 1`
  return (rows[0] as unknown as Event) ?? null
}

export async function getAllEvents(publishedOnly = false): Promise<Event[]> {
  const rows = publishedOnly
    ? await db`SELECT * FROM events WHERE is_published = true ORDER BY date DESC`
    : await db`SELECT * FROM events ORDER BY created_at DESC`
  return rows as unknown as Event[]
}

export async function createEvent(data: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Promise<Event> {
  const rows = await db`
    INSERT INTO events ${db(data as any)}
    RETURNING *
  `
  return rows[0] as unknown as Event
}

export async function updateEvent(id: string, data: Partial<Omit<Event, 'id' | 'created_at'>>): Promise<Event | null> {
  const patch = { ...data, updated_at: new Date().toISOString() }
  const rows = await db`
    UPDATE events SET ${db(patch as any)} WHERE id = ${id} RETURNING *
  `
  return (rows[0] as unknown as Event) ?? null
}

export async function deleteEvent(id: string): Promise<void> {
  await db`DELETE FROM events WHERE id = ${id}`
}

export async function getEventRegistrantCount(eventId: string): Promise<number> {
  const rows = await db`SELECT COUNT(*) as count FROM registrations WHERE event_id = ${eventId}`
  return Number(rows[0].count)
}

export async function getUniqueEventSlug(baseSlug: string, excludeId?: string): Promise<string> {
  const slug = baseSlug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  let candidate = slug
  let i = 1
  while (true) {
    const rows = excludeId
      ? await db`SELECT id FROM events WHERE slug = ${candidate} AND id != ${excludeId} LIMIT 1`
      : await db`SELECT id FROM events WHERE slug = ${candidate} LIMIT 1`
    if (rows.length === 0) return candidate
    candidate = `${slug}-${i++}`
  }
}
