import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getEventBySlug } from '@/lib/db/queries/events'
import {
  getSubmissionByUserAndEvent,
  getSubmissionFieldsByEvent,
  updateSubmission
} from '@/lib/db/queries/submissions'

interface RouteParams {
  params: Promise<{ slug: string }>
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Get event
    const event = await getEventBySlug(slug, true)
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

    // Get submission
    const submission = await getSubmissionByUserAndEvent(session.userId, event.id)

    // Get submission fields
    const fields = await getSubmissionFieldsByEvent(event.id)

    return NextResponse.json({ submission: submission ?? null, fields: fields ?? [], event })
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { answers, finalize } = body as {
      answers: Record<string, unknown>
      finalize?: boolean
    }

    // Get event
    const event = await getEventBySlug(slug, true)
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

    // Check deadline if finalizing
    if (finalize && event.submission_deadline && new Date(event.submission_deadline) < new Date()) {
      return NextResponse.json({ error: 'Submission deadline has passed.' }, { status: 400 })
    }

    const updated = await updateSubmission(session.userId, event.id, answers, !!finalize)
    if (!updated) {
      return NextResponse.json({ error: 'Failed to update submission or submission already finalized.' }, { status: 400 })
    }

    return NextResponse.json({ submission: updated })
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
