import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Event, SubmissionField } from '@/types'
import EventTabNav from '@/components/admin/EventTabNav'
import SubmissionsAdminClient from './SubmissionsAdminClient'

interface Props {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export default async function AdminSubmissionsPage({ params }: Props) {
  const { id } = await params
  const admin = createAdminClient()

  const [
    { data: event, error: eventError },
    { data: fields },
    { data: submissions, error: submissionsError },
  ] = await Promise.all([
    admin.from('events').select('*').eq('id', id).single(),
    admin.from('submission_fields').select('*').eq('event_id', id).order('sort_order'),
    admin
      .from('event_submissions')
      .select('*')
      .eq('event_id', id)
      .order('created_at', { ascending: false }),
  ])

  if (submissionsError) {
    console.error('Error fetching submissions:', submissionsError)
  }

  if (eventError || !event) notFound()

  const typedEvent = event as Event
  const typedFields = (fields ?? []) as SubmissionField[]
  const rawSubmissions = submissions ?? []

  // Resolve user profile info for each submission
  const userIds = Array.from(new Set(rawSubmissions.map((s) => s.user_id).filter(Boolean)))
  const profileMap: Record<
    string,
    { full_name: string | null; student_id: string | null; email?: string | null }
  > = {}

  if (userIds.length > 0) {
    const [{ data: profiles }, { data: usersData }] = await Promise.all([
      admin.from('user_profiles').select('*').in('id', userIds),
      admin.auth.admin.listUsers(),
    ])

    const authUserMap = new Map((usersData?.users ?? []).map((u) => [u.id, u]))
    const dbProfileMap = new Map((profiles ?? []).map((p) => [p.id, p]))

    for (const uid of userIds) {
      const dbProfile = dbProfileMap.get(uid)
      const authUser = authUserMap.get(uid)
      profileMap[uid] = {
        full_name:
          dbProfile?.full_name ||
          authUser?.user_metadata?.full_name ||
          authUser?.email?.split('@')[0] ||
          'Participant',
        student_id: dbProfile?.student_id || null,
        email: authUser?.email || null,
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
