import { db } from '@/lib/db/client'
import type { EventSubmission, SubmissionField } from '@/types'

export type { EventSubmission, SubmissionField }

export async function getSubmissionByUserAndEvent(userId: string, eventId: string): Promise<EventSubmission | null> {
  const rows = await db`SELECT * FROM event_submissions WHERE user_id = ${userId} AND event_id = ${eventId} LIMIT 1`
  return (rows[0] as unknown as EventSubmission) ?? null
}

export async function getSubmissionsByUserId(userId: string): Promise<EventSubmission[]> {
  const rows = await db`SELECT * FROM event_submissions WHERE user_id = ${userId}`
  return rows as unknown as EventSubmission[]
}

export async function getSubmissionsByEventId(eventId: string): Promise<EventSubmission[]> {
  const rows = await db`SELECT * FROM event_submissions WHERE event_id = ${eventId} ORDER BY created_at DESC`
  return rows as unknown as EventSubmission[]
}

export async function createDraftSubmission(data: { event_id: string; registration_id: string; user_id: string }): Promise<EventSubmission> {
  const rows = await db`
    INSERT INTO event_submissions (event_id, registration_id, user_id, answers, status)
    VALUES (${data.event_id}, ${data.registration_id}, ${data.user_id}, ${db.json({} as any)}, 'draft')
    RETURNING *
  `
  return rows[0] as unknown as EventSubmission
}

export async function updateSubmission(userId: string, eventId: string, answers: Record<string, any>, finalize: boolean): Promise<EventSubmission | null> {
  const now = new Date().toISOString()
  const rows = finalize
    ? await db`
        UPDATE event_submissions
        SET answers = ${db.json(answers as any)}, status = 'submitted', submitted_at = ${now}, updated_at = ${now}
        WHERE user_id = ${userId} AND event_id = ${eventId} AND status = 'draft'
        RETURNING *`
    : await db`
        UPDATE event_submissions
        SET answers = ${db.json(answers as any)}, updated_at = ${now}
        WHERE user_id = ${userId} AND event_id = ${eventId} AND status = 'draft'
        RETURNING *`
  return (rows[0] as unknown as EventSubmission) ?? null
}

export async function getSubmissionFieldsByEvent(eventId: string): Promise<SubmissionField[]> {
  const rows = await db`SELECT * FROM submission_fields WHERE event_id = ${eventId} ORDER BY sort_order ASC`
  return rows as unknown as SubmissionField[]
}

export async function replaceSubmissionFields(eventId: string, fields: Partial<SubmissionField>[]): Promise<SubmissionField[]> {
  await db`DELETE FROM submission_fields WHERE event_id = ${eventId}`
  if (fields.length === 0) return []
  const records = fields.map((f, i) => ({
    id: f.id || crypto.randomUUID(),
    event_id: eventId,
    field_type: f.field_type || 'short_text',
    label: f.label || 'Untitled Field',
    help_text: f.help_text || null,
    placeholder: f.placeholder || null,
    required: !!f.required,
    allowed_file_types: f.allowed_file_types?.length ? f.allowed_file_types : null,
    max_file_size_mb: f.max_file_size_mb ?? 50,
    sort_order: i,
  }))
  const rows = await db`INSERT INTO submission_fields ${db(records as any)} RETURNING *`
  return rows as unknown as SubmissionField[]
}

export async function updateSubmissionStatus(id: string, status: string): Promise<void> {
  await db`UPDATE event_submissions SET status = ${status} WHERE id = ${id}`
}
