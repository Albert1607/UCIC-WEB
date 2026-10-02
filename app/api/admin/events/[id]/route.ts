import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getUniqueSlug } from '@/lib/utils'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createAdminClient()
    const body = await req.json()
    const updateData: Record<string, unknown> = {}

    if (body.title !== undefined) updateData.title = body.title
    if (body.slug !== undefined) updateData.slug = await getUniqueSlug(admin, body.slug, id)
    if (body.description !== undefined) updateData.description = body.description || null
    if (body.date !== undefined) updateData.date = body.date || null
    if (body.end_date !== undefined) updateData.end_date = body.end_date || null
    if (body.location !== undefined) updateData.location = body.location || null
    if (body.cover_image_url !== undefined) updateData.cover_image_url = body.cover_image_url || null
    if (body.capacity !== undefined) updateData.capacity = body.capacity ? Number(body.capacity) : null
    if (body.deadline !== undefined) updateData.deadline = body.deadline || null
    if (body.is_published !== undefined) updateData.is_published = !!body.is_published
    if (body.registration_mode !== undefined) updateData.registration_mode = body.registration_mode
    if (body.external_registration_url !== undefined) updateData.external_registration_url = body.external_registration_url || null
    if (body.one_submission_per_email !== undefined) updateData.one_submission_per_email = !!body.one_submission_per_email
    if (body.email_field_id !== undefined) updateData.email_field_id = body.email_field_id || null

    updateData.updated_at = new Date().toISOString()

    const { data, error } = await admin
      .from('events')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === '23505' || error.message?.includes('events_slug_key')) {
        return NextResponse.json(
          { error: 'An event with this slug already exists. Please choose a different slug.' },
          { status: 409 }
        )
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ...data, event: data })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createAdminClient()
    const { error } = await admin
      .from('events')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
