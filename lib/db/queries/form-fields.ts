import { db } from '@/lib/db/client'
import type { FormField } from '@/types'

export type { FormField }

export async function getFormFieldsByEvent(eventId: string): Promise<FormField[]> {
  const rows = await db`SELECT * FROM form_fields WHERE event_id = ${eventId} ORDER BY sort_order ASC`
  return rows as unknown as FormField[]
}

export async function replaceFormFields(eventId: string, fields: Partial<FormField>[]): Promise<FormField[]> {
  await db`DELETE FROM form_fields WHERE event_id = ${eventId}`
  if (fields.length === 0) return []
  const records = fields.map((f, i) => ({
    id: f.id || crypto.randomUUID(),
    event_id: eventId,
    field_type: f.field_type || 'short_text',
    label: f.label || 'Untitled Field',
    help_text: f.help_text || null,
    placeholder: f.placeholder || null,
    required: !!f.required,
    options: f.options ? db.json(f.options as any) : null,
    sort_order: i,
  }))
  const rows = await db`INSERT INTO form_fields ${db(records as any)} RETURNING *`
  return rows as unknown as FormField[]
}
