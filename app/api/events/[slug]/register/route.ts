import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Event, FormField } from '@/types'

interface RouteParams {
  params: Promise<{ slug: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { slug } = await params

  try {
    const body = await request.json()
    const { answers } = body as { answers: Record<string, unknown> }

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json({ error: 'Invalid submission.' }, { status: 400 })
    }

    const supabase = await createClient()

    // Fetch event
    const { data: eventData } = await supabase
      .from('events')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single()

    if (!eventData) {
      return NextResponse.json({ error: 'Event not found.' }, { status: 404 })
    }

    const event: Event = eventData

    // Guard: registration mode
    if (event.registration_mode !== 'internal') {
      return NextResponse.json({ error: 'This event does not accept registrations here.' }, { status: 400 })
    }

    // Guard: past event
    if (event.date && new Date(event.date) < new Date()) {
      return NextResponse.json({ error: 'This event has already passed.' }, { status: 400 })
    }

    // Guard: deadline
    if (event.deadline && new Date(event.deadline) < new Date()) {
      return NextResponse.json({ error: 'Registration deadline has passed.' }, { status: 400 })
    }

    // Guard: capacity
    const { count: registrantCount } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', event.id)

    if (event.capacity != null && (registrantCount ?? 0) >= event.capacity) {
      return NextResponse.json({ error: 'This event is full.' }, { status: 400 })
    }

    // Fetch form fields
    const { data: fieldsData } = await supabase
      .from('form_fields')
      .select('*')
      .eq('event_id', event.id)
      .order('sort_order')

    const fields: FormField[] = fieldsData ?? []

    // Server-side validation
    const validationErrors: string[] = []
    for (const field of fields) {
      if (field.field_type === 'section_header') continue
      if (!field.required) continue
      const val = answers[field.id]
      if (val === undefined || val === null || val === '') {
        validationErrors.push(`"${field.label}" is required.`)
      }
      if (field.field_type === 'checkboxes' && Array.isArray(val) && val.length === 0) {
        validationErrors.push(`"${field.label}" requires at least one selection.`)
      }
      // Email format validation
      if (field.field_type === 'email' && val && typeof val === 'string') {
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRe.test(val)) {
          validationErrors.push(`"${field.label}" must be a valid email address.`)
        }
      }
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: validationErrors[0] },
        { status: 422 }
      )
    }

    // One submission per email check
    let submittedEmail: string | null = null
    if (event.one_submission_per_email && event.email_field_id) {
      submittedEmail = (answers[event.email_field_id] as string) ?? null
      if (submittedEmail) {
        const { count: existingCount } = await supabase
          .from('registrations')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id)
          .eq('submitted_email', submittedEmail)

        if ((existingCount ?? 0) > 0) {
          return NextResponse.json(
            { error: 'You have already registered for this event.' },
            { status: 409 }
          )
        }
      }
    }

    // Insert using admin client (bypasses RLS insert restriction — but we've validated above)
    const admin = createAdminClient()
    const { error: insertError } = await admin
      .from('registrations')
      .insert({
        event_id: event.id,
        answers,
        submitted_email: submittedEmail,
      })

    if (insertError) {
      console.error('Registration insert error:', insertError)
      return NextResponse.json({ error: 'Failed to save registration.' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    console.error('Registration error:', err)
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
