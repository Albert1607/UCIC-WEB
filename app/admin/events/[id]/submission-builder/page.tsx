import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Event, SubmissionField } from '@/types'
import EventTabNav from '@/components/admin/EventTabNav'
import SubmissionBuilderClient from './SubmissionBuilderClient'

export const dynamic = 'force-dynamic'

export default async function SubmissionBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const admin = createAdminClient()

  const [{ data: event, error: eventError }, { data: fields }] = await Promise.all([
    admin.from('events').select('*').eq('id', id).single(),
    admin.from('submission_fields').select('*').eq('event_id', id).order('sort_order'),
  ])

  if (eventError || !event) notFound()

  const typedEvent = event as Event
  const typedFields = (fields ?? []) as SubmissionField[]

  return (
    <div className="min-h-screen bg-[var(--color-pale-blue)] p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <Link
            href={`/admin/events/${typedEvent.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-navy)] opacity-60 hover:opacity-100 transition-opacity mb-2"
          >
            ← Back to Event Settings
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-dusty-blue)]">
                Submission Builder
              </p>
              <h1 className="heading-display text-3xl sm:text-4xl text-[var(--color-navy)]">
                {typedEvent.title}
              </h1>
            </div>
          </div>
        </div>

        <EventTabNav event={typedEvent} activeTab="submission-builder" />

        {!typedEvent.requires_submission && (
          <div className="card-cream p-5 rounded-2xl border-l-4 border-amber-500 text-sm">
            <p className="font-bold text-[var(--color-navy)]">Submission is not enabled</p>
            <p className="opacity-75 mt-1 text-[var(--color-navy)]">
              Enable &quot;Requires Submission&quot; in{' '}
              <Link href={`/admin/events/${typedEvent.id}`} className="underline font-semibold">
                Details &amp; Settings
              </Link>{' '}
              to activate this builder.
            </p>
          </div>
        )}

        <SubmissionBuilderClient event={typedEvent} initialFields={typedFields} />
      </div>
    </div>
  )
}
