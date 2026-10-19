import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db/client'
import { getEventById } from '@/lib/db/queries/events'
import { getSubmissionFieldsByEvent, getSubmissionsByEventId } from '@/lib/db/queries/submissions'
import type { Event, SubmissionField } from '@/types'
import EventTabNav from '@/components/admin/EventTabNav'
import SubmissionsAdminClient from './SubmissionsAdminClient'

interface Props {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export default async function AdminSubmissionsPage({ params }: Props) {
  const { id } = await params

  const [event, fields, submissions] = await Promise.all([
    getEventById(id),
    getSubmissionFieldsByEvent(id),
    getSubmissionsByEventId(id),
  ])

  if (!event) notFound()

  const typedEvent = event as unknown as Event
  const typedFields = (fields ?? []) as unknown as SubmissionField[]
  const rawSubmissions = submissions ?? []

  // Resolve user profile info for each submission from public.users
  const userIds = Array.from(new Set(rawSubmissions.map((s) => s.user_id).filter(Boolean)))
  const profileMap: Record<
    string,
    { full_name: string | null; student_id: string | null; email?: string | null }
  > = {}

  if (userIds.length > 0) {
    const users = await db`
      SELECT id, email, full_name, student_id
      FROM users
      WHERE id = ANY(${userIds})
    `

    for (const u of users) {
      profileMap[u.id] = {
        full_name: u.full_name || u.email?.split('@')[0] || 'Participant',
        student_id: u.student_id || null,
        email: u.email || null,
      }
    }
  }

  const typedSubmissions = rawSubmissions.map((s) => ({
    ...s,
    user_profiles: profileMap[s.user_id] ?? null,
  }))

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
                Submissions
              </p>
              <h1 className="heading-display text-3xl sm:text-4xl text-[var(--color-navy)]">
                {typedEvent.title}
              </h1>
            </div>
          </div>
        </div>

        <EventTabNav event={typedEvent} activeTab="submissions" />

        {!typedEvent.requires_submission && (
          <div className="card-cream p-5 rounded-2xl border-l-4 border-amber-500 text-sm">
            <p className="font-bold text-[var(--color-navy)]">Submission is not enabled</p>
            <p className="opacity-75 mt-1 text-[var(--color-navy)]">
              Enable &quot;Requires Submission&quot; in Details &amp; Settings to use this feature.
            </p>
          </div>
        )}

        <SubmissionsAdminClient
          event={typedEvent}
          fields={typedFields}
          initialSubmissions={typedSubmissions}
        />
      </div>
    </div>
  )
}
