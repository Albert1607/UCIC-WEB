'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface DeleteEventButtonProps {
  eventId: string
  eventTitle: string
}

export default function DeleteEventButton({ eventId, eventTitle }: DeleteEventButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    setIsDeleting(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/events/${eventId}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Failed to delete event')
      }
      setShowConfirm(false)
      router.push('/admin/events')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setIsDeleting(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="btn-danger text-sm px-3 py-1.5"
        type="button"
      >
        Delete
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !isDeleting && setShowConfirm(false)}
          />

          {/* Dialog */}
          <div className="relative card-cream w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
            <h2 className="heading-section text-[var(--color-navy)]">Delete Event?</h2>
            <p className="text-[var(--color-navy)] opacity-80 text-sm leading-relaxed">
              Are you sure you want to delete{' '}
              <span className="font-semibold">&ldquo;{eventTitle}&rdquo;</span>? This action
              cannot be undone and will also remove all associated form fields and registrations.
            </p>

            {error && (
              <p className="form-error">{error}</p>
            )}

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
                className="btn-secondary text-sm px-4 py-2"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="btn-danger text-sm px-4 py-2 flex items-center gap-2"
                type="button"
              >
                {isDeleting && (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                )}
                {isDeleting ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
