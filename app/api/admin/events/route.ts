import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getUniqueSlug } from '@/lib/utils'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('events')
      .select('id, title, slug, is_published, date')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      title,
      slug: customSlug,
      description,
      date,
      end_date,
      location,
      cover_image_url,
      capacity,
      deadline,
      is_published,
      registration_mode,
      external_registration_url,
      one_submission_per_email,
    } = body

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const admin = createAdminClient()
    const rawSlug = customSlug?.trim() || title
    const slug = await getUniqueSlug(admin, rawSlug)

    const { data, error } = await admin
      .from('events')
      .insert({
        title,
        slug,
        description: description || null,
        date: date || null,
        end_date: end_date || null,
        location: location || null,
        cover_image_url: cover_image_url || null,
        capacity: capacity ? Number(capacity) : null,
        deadline: deadline || null,
        is_published: !!is_published,
        registration_mode: registration_mode || 'none',
        external_registration_url: external_registration_url || null,
        one_submission_per_email: !!one_submission_per_email,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505' || error.message?.includes('events_slug_key')) {
        return NextResponse.json(
          { error: 'An event with this slug already exists. Please choose a different title or slug.' },
          { status: 409 }
        )
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ...data, event: data }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
