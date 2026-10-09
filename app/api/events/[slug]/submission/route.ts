import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ slug: string }>
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Get event
    const { data: event } = await supabase
      .from('events')
      .select('id, slug, requires_submission, submission_deadline, submission_instructions')
      .eq('slug', slug)
      .eq('is_published', true)
      .single()
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

    // Get submission
    const { data: submission } = await supabase
      .from('event_submissions')
      .select('*')
      .eq('event_id', event.id)
      .eq('user_id', user.id)
      .single()

    // Get submission fields
    const { data: fields } = await supabase
      .from('submission_fields')
      .select('*')
      .eq('event_id', event.id)
      .order('sort_order')

    return NextResponse.json({ submission: submission ?? null, fields: fields ?? [], event })
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { answers, finalize } = body as {
      answers: Record<string, string>
      finalize?: boolean
    }

    // Get event
    const { data: event } = await supabase
      .from('events')
      .select('id, submission_deadline')
      .eq('slug', slug)
      .eq('is_published', true)
      .single()
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

    // Check deadline if finalizing
    if (finalize && event.submission_deadline && new Date(event.submission_deadline) < new Date()) {
      return NextResponse.json({ error: 'Submission deadline has passed.' }, { status: 400 })
    }

    // Build update payload
    const updateData: Record<string, unknown> = {
      answers,
      updated_at: new Date().toISOString(),
    }
    if (finalize) {
      updateData.status = 'submitted'
      updateData.submitted_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('event_submissions')
      .update(updateData)
      .eq('event_id', event.id)
      .eq('user_id', user.id)
      .eq('status', 'draft') // Can only update draft submissions
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ submission: data })
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
