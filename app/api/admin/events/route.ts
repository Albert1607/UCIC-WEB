import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth/session'
import { getAllEvents, createEvent, getUniqueEventSlug } from '@/lib/db/queries/events'

function unauthorized() { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

export async function GET() {
  if (!(await getAdminSession())) return unauthorized()
  const data = await getAllEvents()
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  if (!(await getAdminSession())) return unauthorized()
  try {
    const body = await req.json()
    const {
      title, slug: customSlug, description, date, end_date, location,
      cover_image_url, capacity, deadline, is_published, registration_mode,
      external_registration_url, one_submission_per_email, requires_submission,
      submission_deadline, submission_instructions, post_registration_message,
    } = body

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const slug = await getUniqueEventSlug(customSlug?.trim() || title)

    const data = await createEvent({
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
      email_field_id: null,
      requires_submission: !!requires_submission,
      submission_deadline: submission_deadline || null,
      submission_instructions: submission_instructions || null,
      post_registration_message: post_registration_message || null,
    })

    return NextResponse.json({ ...data, event: data }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    if (message.includes('events_slug_key') || message.includes('23505')) {
      return NextResponse.json({ error: 'An event with this slug already exists.' }, { status: 409 })
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
