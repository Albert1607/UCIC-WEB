import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { SubmissionField } from '@/types'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('submission_fields')
      .select('*')
      .eq('event_id', id)
      .order('sort_order', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data ?? [])
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { fields } = body as { fields: Partial<SubmissionField>[] }
    if (!Array.isArray(fields)) {
      return NextResponse.json({ error: 'Fields must be an array' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Delete existing fields and replace
    const { error: deleteError } = await admin
      .from('submission_fields')
      .delete()
      .eq('event_id', id)
    if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 400 })

    let saved: SubmissionField[] = []
    if (fields.length > 0) {
      const records = fields.map((f, i) => ({
        id: f.id || crypto.randomUUID(),
        event_id: id,
        field_type: f.field_type || 'short_text',
        label: f.label || 'Untitled Field',
        help_text: f.help_text || null,
        placeholder: f.placeholder || null,
        required: !!f.required,
        allowed_file_types: f.allowed_file_types?.length ? f.allowed_file_types : null,
        max_file_size_mb: f.max_file_size_mb || 50,
        sort_order: i,
      }))

      const { data: inserted, error: insertError } = await admin
        .from('submission_fields')
        .insert(records)
        .select()
      if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 })
      saved = (inserted ?? []) as SubmissionField[]
    }

    return NextResponse.json(saved)
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
