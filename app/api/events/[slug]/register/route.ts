import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getEventBySlug } from '@/lib/db/queries/events'
import { getFormFieldsByEvent } from '@/lib/db/queries/form-fields'
import { countRegistrationsByEvent, countRegistrationsByEmail, createRegistration } from '@/lib/db/queries/registrations'
import { createDraftSubmission } from '@/lib/db/queries/submissions'
import { FormField } from '@/types'

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

    // Fetch event
    const event = await getEventBySlug(slug, true)
    if (!event) {
      return NextResponse.json({ error: 'Event not found.' }, { status: 404 })
    }

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
    const registrantCount = await countRegistrationsByEvent(event.id)
    if (event.capacity != null && registrantCount >= event.capacity) {
      return NextResponse.json({ error: 'This event is full.' }, { status: 400 })
    }

    // Fetch form fields
    const fieldsData = await getFormFieldsByEvent(event.id)
    const fields = (fieldsData ?? []) as FormField[]

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
        const existingCount = await countRegistrationsByEmail(event.id, submittedEmail)
        if (existingCount > 0) {
          return NextResponse.json(
            { error: 'You have already registered for this event.' },
            { status: 409 }
          )
        }
      }
    }

    // Get public user session (may be null for anonymous registrations)
    const session = await getSession()

    const insertedReg = await createRegistration({
      event_id: event.id,
      answers,
      submitted_email: submittedEmail,
      user_id: session?.userId ?? null,
    })

    // If event requires submission, create a draft submission slot
    if (event.requires_submission && session && insertedReg) {
      await createDraftSubmission({
        event_id: event.id,
        registration_id: insertedReg.id,
        user_id: session.userId,
      })
    }

    return NextResponse.json(
      {
        success: true,
        requiresSubmission: !!event.requires_submission,
        submissionDeadline: event.submission_deadline ?? null,
      },
      { status: 201 }
    )
  } catch (err) {
    console.error('Registration error:', err)
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
