import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getSession } from '@/lib/auth/session'
import { getEventBySlug } from '@/lib/db/queries/events'
import { getSubmissionByUserAndEvent, getSubmissionFieldsByEvent } from '@/lib/db/queries/submissions'
import { Event, SubmissionField, EventSubmission } from '@/types'
import SubmitClient from './SubmitClient'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  return { title: `Submit — ${slug}` }
}

export default async function SubmitPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const session = await getSession()
  if (!session) redirect(`/login?next=/events/${slug}/submit`)

  const eventData = await getEventBySlug(slug, true)
  if (!eventData || !eventData.requires_submission) notFound()

  const event: Event = eventData as unknown as Event

  // Fetch this user's submission
  const submissionData = await getSubmissionByUserAndEvent(session.userId, event.id)

  // Fetch submission fields
  const fieldsData = await getSubmissionFieldsByEvent(event.id)

  const submission = submissionData as unknown as EventSubmission | null
  const fields = (fieldsData ?? []) as SubmissionField[]

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-10">
        <span className="pill pill-dusty mb-4 inline-block">Submission</span>
        <h1
          className="heading-display text-4xl sm:text-5xl mb-3"
          style={{ color: 'var(--color-navy)' }}
        >
          {event.title}
        </h1>
        {event.submission_instructions && (
          <p
            className="text-sm opacity-70 leading-relaxed whitespace-pre-wrap mt-3"
            style={{ color: 'var(--color-navy)' }}
          >
            {event.submission_instructions}
          </p>
        )}
      </div>

      <div className="card-cream p-8">
        <SubmitClient event={event} submission={submission} fields={fields} userId={session.userId} />
      </div>
    </div>
  )
}
