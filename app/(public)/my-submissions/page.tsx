import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { db } from '@/lib/db/client'
import { getSession } from '@/lib/auth/session'
import { formatDate, formatDateTime } from '@/lib/utils'

export const metadata: Metadata = { title: 'My Submissions — UCIC' }
export const dynamic = 'force-dynamic'

export default async function MySubmissionsPage() {
  const session = await getSession()
  if (!session) redirect('/login?next=/my-submissions')

  // Get all registrations for this user with event details
  const regs = await db`
    SELECT
      r.id,
      r.event_id,
      r.created_at,
      json_build_object(
        'id', e.id,
        'title', e.title,
        'slug', e.slug,
        'date', e.date,
        'requires_submission', e.requires_submission,
        'submission_deadline', e.submission_deadline,
        'is_published', e.is_published
      ) as events
    FROM registrations r
    JOIN events e ON r.event_id = e.id
    WHERE r.user_id = ${session.userId}
    ORDER BY r.created_at DESC
  `

  // Get all submissions for this user
  const submissions = await db`
    SELECT id, event_id, status, submitted_at, registration_id
    FROM event_submissions
    WHERE user_id = ${session.userId}
  `

  const submissionsByEventId = Object.fromEntries(
    (submissions ?? []).map((s) => [s.event_id, s])
  )

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="mb-10">
        <span className="pill pill-dusty mb-4 inline-block">Dashboard</span>
        <h1
          className="heading-display text-4xl sm:text-5xl"
          style={{ color: 'var(--color-navy)' }}
        >
          My Registrations
        </h1>
        <p className="text-sm opacity-60 mt-2" style={{ color: 'var(--color-navy)' }}>
          Signed in as <strong>{session.email}</strong>
        </p>
      </div>

      {regs.length === 0 ? (
        <div className="card-cream p-12 text-center rounded-2xl">
          <p
            className="opacity-50 text-sm italic"
            style={{ color: 'var(--color-navy)' }}
          >
            You haven&apos;t registered for any events yet.
          </p>
          <Link href="/events" className="btn-primary mt-6 inline-flex">
            Browse Events →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {regs.map((reg) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const event = reg.events as any
            if (!event) return null

            const submission = submissionsByEventId[event.id] ?? null
            const deadlinePassed =
              event.submission_deadline
                ? new Date(event.submission_deadline) < new Date()
                : false
            const daysLeft =
              event.submission_deadline
                ? Math.ceil(
                    (new Date(event.submission_deadline).getTime() - Date.now()) / 86400000
                  )
                : null

            return (
              <div
                key={reg.id}
                className="card-cream rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p
                    className="font-bold text-base truncate"
                    style={{ color: 'var(--color-navy)' }}
                  >
                    {event.title}
                  </p>
                  {event.date && (
                    <p
                      className="text-xs opacity-60 mt-0.5"
                      style={{ color: 'var(--color-navy)' }}
                    >
                      Event: {formatDate(event.date)}
                    </p>
                  )}

                  {event.requires_submission ? (
                    <div className="mt-2">
                      {submission?.status === 'submitted' ? (
                        <span
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{
                            background: 'rgba(80,180,80,0.12)',
                            color: '#2d7a4f',
                          }}
                        >
                          ✅ Submitted
                          {submission.submitted_at
                            ? ` · ${formatDateTime(submission.submitted_at)}`
                            : ''}
                        </span>
                      ) : deadlinePassed ? (
                        <span
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{
                            background: 'rgba(200,50,50,0.1)',
                            color: '#8b2424',
                          }}
                        >
                          ⏰ Deadline passed
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{
                            background: 'rgba(253,180,50,0.15)',
                            color: '#7a5e00',
                          }}
                        >
                          🟡 Not submitted
                          {daysLeft !== null && daysLeft > 0
                            ? ` · ${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`
                            : ''}
                        </span>
                      )}
                      {event.submission_deadline && (
                        <p
                          className="text-xs opacity-50 mt-1"
                          style={{ color: 'var(--color-navy)' }}
                        >
                          Deadline: {formatDateTime(event.submission_deadline)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1.5 text-xs font-semibold mt-2 px-2.5 py-1 rounded-full"
                      style={{
                        background: 'rgba(156,182,215,0.2)',
                        color: 'var(--color-navy)',
                      }}
                    >
                      ✅ Registered
                    </span>
                  )}
                </div>

                <div className="flex gap-2 shrink-0">
                  {event.requires_submission && (
                    <>
                      {submission?.status === 'submitted' ? (
                        <Link
                          href={`/events/${event.slug}/submit`}
                          className="btn-secondary !py-2 !px-4 text-xs"
                        >
                          View →
                        </Link>
                      ) : !deadlinePassed ? (
                        <Link
                          href={`/events/${event.slug}/submit`}
                          className="btn-primary !py-2 !px-4 text-xs"
                        >
                          Submit Work →
                        </Link>
                      ) : null}
                    </>
                  )}
                  {!event.requires_submission && (
                    <Link
                      href={`/events/${event.slug}`}
                      className="btn-secondary !py-2 !px-4 text-xs"
                    >
                      View Event →
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
