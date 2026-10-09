'use client'

import { useState } from 'react'
import Link from 'next/link'
import FormRenderer from '@/components/FormRenderer'
import { Event, FormField } from '@/types'
import { formatDateTime } from '@/lib/utils'

interface Props {
  event: Event
  fields: FormField[]
}

interface SuccessData {
  requiresSubmission: boolean
  submissionDeadline: string | null
}

export default function RegistrationPageClient({ event, fields }: Props) {
  const [successData, setSuccessData] = useState<SuccessData | null>(null)

  const handleSubmit = async (answers: Record<string, unknown>) => {
    const res = await fetch(`/api/events/${event.slug}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    })

    const data = await res.json()

    if (!res.ok) {
      return { error: data.error ?? 'Something went wrong. Please try again.' }
    }

    setSuccessData({
      requiresSubmission: data.requiresSubmission ?? false,
      submissionDeadline: data.submissionDeadline ?? null,
    })
    return {}
  }

  if (successData) {
    return (
      <div className="space-y-5">
        {/* Success header */}
        <div className="text-center py-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(156,182,215,0.2)' }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              style={{ color: 'var(--color-navy)' }}
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h2
            className="heading-display text-3xl mb-2"
            style={{ color: 'var(--color-navy)' }}
          >
            You&apos;re Registered!
          </h2>
          <p className="text-sm opacity-60" style={{ color: 'var(--color-navy)' }}>
            Your registration has been confirmed.
          </p>
        </div>

        {/* Post-registration message from organizer */}
        {event.post_registration_message && (
          <div
            className="rounded-2xl p-5"
            style={{
              background: 'rgba(156,182,215,0.15)',
              border: '1.5px solid rgba(156,182,215,0.4)',
            }}
          >
            <p
              className="text-xs font-bold uppercase tracking-wider mb-2 opacity-60"
              style={{ color: 'var(--color-navy)' }}
            >
              📢 Message from Organizer
            </p>
            <p
              className="text-sm leading-relaxed whitespace-pre-wrap"
              style={{ color: 'var(--color-navy)' }}
            >
              {event.post_registration_message}
            </p>
          </div>
        )}

        {/* Submission reminder */}
        {successData.requiresSubmission && (
          <div
            className="rounded-2xl p-5"
            style={{
              background: 'rgba(253,248,217,0.6)',
              border: '1.5px solid rgba(200,180,80,0.3)',
            }}
          >
            <p
              className="text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: 'var(--color-navy)' }}
            >
              📝 Next: Submit Your Work
            </p>
            <p
              className="text-sm opacity-75 mb-3"
              style={{ color: 'var(--color-navy)' }}
            >
              This event requires a submission. You can submit your work anytime
              {successData.submissionDeadline
                ? ` before ${formatDateTime(successData.submissionDeadline)}.`
                : '.'}
            </p>
            <p className="text-sm font-semibold" style={{ color: 'var(--color-navy)' }}>
              Find it anytime in{' '}
              <Link href="/my-submissions" className="underline">
                My Submissions →
              </Link>
            </p>
          </div>
        )}

        {/* No submission — simple confirmation */}
        {!successData.requiresSubmission && !event.post_registration_message && (
          <p className="text-center text-sm opacity-60" style={{ color: 'var(--color-navy)' }}>
            Thank you for signing up. See you at the event!
          </p>
        )}

        {/* Back link */}
        <div className="text-center pt-2">
          <Link
            href={`/events/${event.slug}`}
            className="btn-secondary inline-flex items-center gap-2"
          >
            ← Back to Event
          </Link>
        </div>
      </div>
    )
  }

  return <FormRenderer fields={fields} onSubmit={handleSubmit} />
}
