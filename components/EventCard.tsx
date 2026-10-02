import Link from 'next/link'
import Image from 'next/image'
import { Event } from '@/types'
import { formatDate, isEventPast } from '@/lib/utils'

interface EventCardProps {
  event: Event
  registrantCount?: number
}

export default function EventCard({ event, registrantCount }: EventCardProps) {
  const past = isEventPast(event)

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group block card-cream overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-[var(--shadow-float)]"
      style={{ textDecoration: 'none' }}
    >
      {/* Cover image */}
      <div
        className="relative w-full overflow-hidden"
        style={{ height: '200px' }}
      >
        {event.cover_image_url ? (
          <Image
            src={event.cover_image_url}
            alt={event.title}
            fill
            className="img-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, var(--color-dusty-blue) 0%, var(--color-navy) 100%)`,
            }}
          >
            <span
              className="heading-display text-5xl opacity-20"
              style={{ color: 'var(--color-cream)' }}
            >
              UCIC
            </span>
          </div>
        )}

        {/* Overlay for past events */}
        {past && (
          <div className="absolute inset-0 img-overlay flex items-end p-3">
            <span className="pill pill-cream text-xs">Past Event</span>
          </div>
        )}

        {/* Status pill */}
        {!past && (
          <div className="absolute top-3 left-3">
            <span
              className="pill"
              style={{
                background: 'rgba(253,248,217,0.92)',
                color: 'var(--color-navy)',
                backdropFilter: 'blur(8px)',
              }}
            >
              Upcoming
            </span>
          </div>
        )}

        {/* Registration mode indicator */}
        {event.registration_mode !== 'none' && (
          <div className="absolute top-3 right-3">
            <span
              className="pill"
              style={{
                background: 'rgba(47,71,95,0.85)',
                color: 'var(--color-cream)',
                backdropFilter: 'blur(8px)',
                fontSize: '0.65rem',
              }}
            >
              {event.registration_mode === 'external' ? 'External' : 'Register'}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3
          className="font-bold text-lg leading-tight mb-2 group-hover:opacity-75 transition-opacity"
          style={{ color: 'var(--color-navy)' }}
        >
          {event.title}
        </h3>

        <div className="space-y-1 mb-3">
          {event.date && (
            <div className="flex items-center gap-2 text-sm opacity-70" style={{ color: 'var(--color-navy)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              {formatDate(event.date)}
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-2 text-sm opacity-70" style={{ color: 'var(--color-navy)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
              {event.location}
            </div>
          )}
          {typeof registrantCount === 'number' && event.capacity && (
            <div className="flex items-center gap-2 text-sm opacity-70" style={{ color: 'var(--color-navy)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              {registrantCount} / {event.capacity} registered
            </div>
          )}
        </div>

        {/* Description excerpt */}
        {event.description && (
          <p
            className="text-sm opacity-60 line-clamp-2 leading-relaxed"
            style={{ color: 'var(--color-navy)' }}
          >
            {event.description}
          </p>
        )}
      </div>
    </Link>
  )
}
