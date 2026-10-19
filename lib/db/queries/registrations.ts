import { db } from '@/lib/db/client'
import type { Registration } from '@/types'

export type { Registration }

export async function getRegistrationsByUserId(userId: string): Promise<Registration[]> {
  const rows = await db`SELECT * FROM registrations WHERE user_id = ${userId} ORDER BY created_at DESC`
  return rows as unknown as Registration[]
}

export async function getRegistrationsByEventId(eventId: string): Promise<Registration[]> {
  const rows = await db`SELECT * FROM registrations WHERE event_id = ${eventId} ORDER BY created_at DESC`
  return rows as unknown as Registration[]
}

export async function getRegistrationById(id: string): Promise<Registration | null> {
  const rows = await db`SELECT * FROM registrations WHERE id = ${id} LIMIT 1`
  return (rows[0] as unknown as Registration) ?? null
}

export async function countRegistrationsByEvent(eventId: string): Promise<number> {
  const rows = await db`SELECT COUNT(*) as count FROM registrations WHERE event_id = ${eventId}`
  return Number(rows[0]?.count ?? 0)
}

export async function countRegistrationsByEmail(eventId: string, email: string): Promise<number> {
  const rows = await db`SELECT COUNT(*) as count FROM registrations WHERE event_id = ${eventId} AND submitted_email = ${email}`
  return Number(rows[0]?.count ?? 0)
}

export async function createRegistration(data: { event_id: string; answers: Record<string, unknown>; submitted_email: string | null; user_id: string | null }): Promise<Registration> {
  const rows = await db`
    INSERT INTO registrations (event_id, answers, submitted_email, user_id)
    VALUES (${data.event_id}, ${db.json(data.answers as any)}, ${data.submitted_email}, ${data.user_id})
    RETURNING *
  `
  return rows[0] as unknown as Registration
}

export async function deleteRegistration(id: string): Promise<void> {
  await db`DELETE FROM registrations WHERE id = ${id}`
}
