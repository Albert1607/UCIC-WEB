'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Event, SubmissionField, EventSubmission } from '@/types'
import { formatDateTime } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface Props {
  event: Event
  submission: EventSubmission | null
  fields: SubmissionField[]
}

export default function SubmitClient({ event, submission, fields }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>(submission?.answers ?? {})
  const [uploading, setUploading] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [confirmSubmit, setConfirmSubmit] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(submission?.status === 'submitted')
  const [submittedAt, setSubmittedAt] = useState<string | null>(
    submission?.submitted_at ?? null
  )

  const deadlinePassed =
    event.submission_deadline ? new Date(event.submission_deadline) < new Date() : false

  const setAnswer = useCallback((fieldId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }))
  }, [])

  const handleFileUpload = async (field: SubmissionField, file: File) => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setError('Please log in again.')
      return
    }

    setUploading((prev) => ({ ...prev, [field.id]: true }))
    setError(null)

    try {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'file'

      // Validate file type
      if (field.allowed_file_types && field.allowed_file_types.length > 0) {
        if (!field.allowed_file_types.includes(ext)) {
          setError(
            `Invalid file type. Allowed: ${field.allowed_file_types.map((t) => '.' + t).join(', ')}`
          )
          return
        }
      }

      // Validate file size
      const maxMb = field.max_file_size_mb ?? 50
      if (file.size > maxMb * 1024 * 1024) {
        setError(`File too large. Maximum size: ${maxMb} MB`)
        return
      }

      const path = `${user.id}/${event.id}/${field.id}/${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('submission-files')
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      setAnswer(field.id, path)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading((prev) => ({ ...prev, [field.id]: false }))
    }
  }

  const handleSave = async (finalize = false) => {
    if (finalize) setSubmitting(true)
    else setSaving(true)
    setError(null)

    try {
      const res = await fetch(`/api/events/${event.slug}/submission`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, finalize }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Save failed')

      if (finalize) {
        setIsSubmitted(true)
        setSubmittedAt(data.submission?.submitted_at ?? new Date().toISOString())
        setConfirmSubmit(false)
      } else {
        setSavedAt(new Date().toLocaleTimeString())
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
      setSubmitting(false)
    }
  }

  // User hasn't registered (no submission slot)
  if (!submission) {
    return (
      <div className="text-center py-8">
        <p className="text-lg font-semibold mb-4" style={{ color: 'var(--color-navy)' }}>
          You haven&apos;t registered for this event yet.
        </p>
        <Link href={`/events/${event.slug}/register`} className="btn-primary">
          Register First →
        </Link>
      </div>
    )
  }

  // Already submitted — read-only view
  if (isSubmitted) {
    return (
      <div className="space-y-6">
        <div
          className="flex items-center gap-3 p-4 rounded-xl"
          style={{
            background: 'rgba(80,180,80,0.1)',
            border: '1.5px solid rgba(80,180,80,0.3)',
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ color: '#3d9e5f' }}
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
          <div>
            <p className="font-semibold text-sm" style={{ color: 'var(--color-navy)' }}>
              Submission Received!
            </p>
            {submittedAt && (
              <p className="text-xs opacity-60" style={{ color: 'var(--color-navy)' }}>
                Submitted on {formatDateTime(submittedAt)}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {fields.map((field) => {
            const val = answers[field.id]
            const isFile =
              field.field_type === 'file_upload' && val && val.includes('/')
            return (
              <div
                key={field.id}
                className="p-4 rounded-xl"
                style={{
                  background: 'rgba(156,182,215,0.1)',
                  border: '1px solid rgba(156,182,215,0.3)',
                }}
              >
                <p
                  className="text-xs font-bold uppercase tracking-wider mb-1 opacity-60"
                  style={{ color: 'var(--color-navy)' }}
                >
                  {field.label}
                </p>
                <p className="text-sm" style={{ color: 'var(--color-navy)' }}>
                  {isFile ? `📎 ${val.split('/').pop()}` : val || '—'}
                </p>
              </div>
            )
          })}
          {fields.length === 0 && (
            <p className="text-sm italic opacity-50 text-center py-6">
              No submission fields configured.
            </p>
          )}
        </div>

        <Link href="/my-submissions" className="btn-secondary inline-flex">
          ← My Submissions
        </Link>
      </div>
    )
  }

  // Deadline passed but not submitted
  if (deadlinePassed) {
    return (
      <div className="text-center py-8 space-y-3">
        <div className="text-5xl opacity-20">⏰</div>
        <p className="font-semibold" style={{ color: 'var(--color-navy)' }}>
          Submission deadline has passed.
        </p>
        <p className="text-sm opacity-60" style={{ color: 'var(--color-navy)' }}>
          The deadline was {formatDateTime(event.submission_deadline!)}.
        </p>
        <Link href="/my-submissions" className="btn-secondary inline-flex">
          ← My Submissions
        </Link>
      </div>
    )
  }

  // Active draft form
  return (
    <div className="space-y-6">
      {event.submission_deadline && (
        <div
          className="p-3 rounded-xl text-sm"
          style={{
            background: 'rgba(253,248,217,0.6)',
            border: '1px solid rgba(200,180,80,0.3)',
          }}
        >
          <span style={{ color: 'var(--color-navy)' }}>
            ⏰ Submission deadline:{' '}
            <strong>{formatDateTime(event.submission_deadline)}</strong>
          </span>
        </div>
      )}

      {fields.length === 0 ? (
        <p
          className="opacity-50 italic text-sm text-center py-8"
          style={{ color: 'var(--color-navy)' }}
        >
          No submission fields have been configured for this event yet.
        </p>
      ) : (
        <div className="space-y-5">
          {fields.map((field) => (
            <div key={field.id}>
              <label className="form-label" htmlFor={field.id}>
                {field.label}
                {field.required && <span className="ml-1 text-red-500">*</span>}
              </label>
              {field.help_text && <p className="form-help mb-2">{field.help_text}</p>}

              {field.field_type === 'short_text' && (
                <input
                  id={field.id}
                  type="text"
                  className="form-input"
                  placeholder={field.placeholder ?? ''}
                  value={answers[field.id] ?? ''}
                  onChange={(e) => setAnswer(field.id, e.target.value)}
                />
              )}
              {field.field_type === 'long_text' && (
                <textarea
                  id={field.id}
                  className="form-input"
                  rows={4}
                  placeholder={field.placeholder ?? ''}
                  value={answers[field.id] ?? ''}
                  onChange={(e) => setAnswer(field.id, e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              )}
              {field.field_type === 'url' && (
                <input
                  id={field.id}
                  type="url"
                  className="form-input"
                  placeholder={field.placeholder ?? 'https://'}
                  value={answers[field.id] ?? ''}
                  onChange={(e) => setAnswer(field.id, e.target.value)}
                />
              )}
              {field.field_type === 'file_upload' && (
                <div>
                  <input
                    id={field.id}
                    type="file"
                    className="block w-full text-sm opacity-80 text-[var(--color-navy)] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-dusty-blue)]/20 file:text-[var(--color-navy)] hover:file:bg-[var(--color-dusty-blue)]/30 file:cursor-pointer cursor-pointer"
                    accept={
                      field.allowed_file_types?.map((t) => `.${t}`).join(',') || '*'
                    }
                    disabled={uploading[field.id]}
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) handleFileUpload(field, f)
                    }}
                  />
                  {uploading[field.id] && (
                    <p className="form-help mt-1">Uploading…</p>
                  )}
                  {answers[field.id] && !uploading[field.id] && (
                    <p className="form-help mt-1 text-green-700">
                      ✓ Uploaded: {answers[field.id].split('/').pop()}
                    </p>
                  )}
                  {field.allowed_file_types && field.allowed_file_types.length > 0 && (
                    <p className="form-help">
                      Allowed:{' '}
                      {field.allowed_file_types.map((t) => `.${t}`).join(', ')} · Max{' '}
                      {field.max_file_size_mb ?? 50} MB
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {error && <p className="form-error text-sm">{error}</p>}

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="button"
          onClick={() => handleSave(false)}
          disabled={saving || submitting}
          className="btn-secondary flex-1 justify-center"
        >
          {saving ? 'Saving…' : savedAt ? `Draft saved ${savedAt}` : 'Save Draft'}
        </button>
        <button
          type="button"
          onClick={() => setConfirmSubmit(true)}
          disabled={saving || submitting || Object.values(uploading).some(Boolean)}
          className="btn-primary flex-1 justify-center"
        >
          Submit Final
        </button>
      </div>

      <p
        className="text-xs opacity-50 text-center"
        style={{ color: 'var(--color-navy)' }}
      >
        Once submitted, you cannot make changes.
      </p>

      {/* Confirm dialog */}
      {confirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="card-cream w-full max-w-sm rounded-2xl p-6 space-y-4 text-center">
            <h3
              className="heading-section text-xl"
              style={{ color: 'var(--color-navy)' }}
            >
              Submit your work?
            </h3>
            <p className="text-sm opacity-70" style={{ color: 'var(--color-navy)' }}>
              This action cannot be undone. Your submission will be locked and sent to the
              organizers.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setConfirmSubmit(false)}
                className="btn-secondary !py-2 !px-4 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSave(true)}
                disabled={submitting}
                className="btn-primary !py-2 !px-4 text-xs"
              >
                {submitting ? 'Submitting…' : 'Yes, Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
