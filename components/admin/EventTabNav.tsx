import Link from 'next/link'
import type { Event } from '@/types'

interface EventTabNavProps {
  event: Event
  activeTab: 'details' | 'form-builder' | 'registrants' | 'submission-builder' | 'submissions'
}

export default function EventTabNav({ event, activeTab }: EventTabNavProps) {
  const base = 'px-4 py-2 rounded-pill text-xs font-bold transition-colors whitespace-nowrap'
  const active = 'bg-[var(--color-navy)] text-[var(--color-cream)]'
  const inactive =
    'bg-[var(--color-cream)] text-[var(--color-navy)] border border-[var(--color-dusty-blue)]/50 hover:bg-[var(--color-dusty-blue)]/20'

  return (
    <div className="flex items-center gap-2 border-b border-[var(--color-dusty-blue)]/30 pb-3 overflow-x-auto">
      <Link
        href={`/admin/events/${event.id}`}
        className={`${base} ${activeTab === 'details' ? active : inactive}`}
      >
        Details &amp; Settings
      </Link>

      {event.registration_mode === 'internal' && (
        <>
          <Link
            href={`/admin/events/${event.id}/form-builder`}
            className={`${base} ${activeTab === 'form-builder' ? active : inactive}`}
          >
            Form Builder
          </Link>
          <Link
            href={`/admin/events/${event.id}/registrants`}
            className={`${base} ${activeTab === 'registrants' ? active : inactive}`}
          >
            Registrants
          </Link>
        </>
      )}

      {event.requires_submission && (
        <>
          <Link
            href={`/admin/events/${event.id}/submission-builder`}
            className={`${base} ${activeTab === 'submission-builder' ? active : inactive}`}
          >
            Submission Builder
          </Link>
          <Link
            href={`/admin/events/${event.id}/submissions`}
            className={`${base} ${activeTab === 'submissions' ? active : inactive}`}
          >
            Submissions
          </Link>
        </>
      )}
    </div>
  )
}
