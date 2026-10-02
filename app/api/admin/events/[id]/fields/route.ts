import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { FormField } from '@/types'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createAdminClient()
    const { data: fields, error } = await admin
      .from('form_fields')
      .select('*')
      .eq('event_id', id)
      .order('sort_order', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(fields ?? [])
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { fields, email_field_id } = body as {
      fields: Partial<FormField>[]
      email_field_id?: string | null
    }

    if (!Array.isArray(fields)) {
      return NextResponse.json({ error: 'Fields must be an array' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Delete existing form fields for this event
    const { error: deleteError } = await admin
      .from('form_fields')
      .delete()
      .eq('event_id', id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 })
    }

    // Insert updated fields with proper sort_order
    let savedFields: FormField[] = []
    if (fields.length > 0) {
      const recordsToInsert = fields.map((f, index) => ({
        id: f.id || crypto.randomUUID(),
        event_id: id,
        field_type: f.field_type || 'short_text',
        label: f.label || 'Untitled Field',
        help_text: f.help_text || null,
        placeholder: f.placeholder || null,
        required: !!f.required,
        options: f.options || null,
        sort_order: index,
      }))

      const { data: inserted, error: insertError } = await admin
        .from('form_fields')
        .insert(recordsToInsert)
        .select()

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 400 })
      }
      savedFields = inserted as FormField[]
    }

    // If email_field_id is passed, also update the event's email_field_id
    if (email_field_id !== undefined) {
      await admin
        .from('events')
        .update({ email_field_id: email_field_id || null })
        .eq('id', id)
    }

    return NextResponse.json(savedFields)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
