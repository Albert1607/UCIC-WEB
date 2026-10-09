import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
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
  const supabase = await createClient()

  // Middleware already redirects if not logged in, but double-guard here
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/events/${slug}/submit`)

  const { data: eventData } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!eventData || !eventData.requires_submission) notFound()

  const event: Event = eventData

  // Fetch this user's submission
  const { data: submissionData } = await supabase
    .from('event_submissions')
    .select('*')
    .eq('event_id', event.id)
    .eq('user_id', user.id)
    .single()

  // Fetch submission fields
  const { data: fieldsData } = await supabase
    .from('submission_fields')
    .select('*')
    .eq('event_id', event.id)
    .order('sort_order')

  const submission = submissionData as EventSubmission | null
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
        <SubmitClient event={event} submission={submission} fields={fields} />
      </div>
    </div>
  )
}
