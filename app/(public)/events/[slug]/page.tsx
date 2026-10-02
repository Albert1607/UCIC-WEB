import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getSiteContent } from '@/lib/content'
import { formatDate, formatDateTime, isEventPast, isRegistrationClosed } from '@/lib/utils'
import { Event } from '@/types'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('events')
    .select('title, description')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!data) return { title: 'Event Not Found' }
  return {
    title: data.title,
    description: data.description ?? undefined,
  }
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params
  const [supabase, content] = await Promise.all([createClient(), getSiteContent()])

  const { data: eventData } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!eventData) notFound()

  const event: Event = eventData

  // Count registrations
  const { count: registrantCount } = await supabase
    .from('registrations')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', event.id)

  const past = isEventPast(event)
  const closed = isRegistrationClosed(event)
  const full = event.capacity != null && (registrantCount ?? 0) >= event.capacity

  function getRegisterButtonState() {
    if (event.registration_mode === 'none') return null
    if (past) return { label: 'Event has passed', disabled: true, href: null }
    if (closed) return { label: content['register_closed_label'] || 'Registration Closed', disabled: true, href: null }
    if (full) return { label: content['register_full_label'] || 'Event Full', disabled: true, href: null }
    if (event.registration_mode === 'external') {
      return {
        label: content['register_button_label'] || 'Register Now',
        disabled: false,
        href: event.external_registration_url,
        external: true,
      }
    }
    return {
      label: content['register_button_label'] || 'Register Now',
      disabled: false,
      href: `/events/${event.slug}/register`,
      external: false,
    }
  }

  const registerState = getRegisterButtonState()

  return (
    <div>
      {/* Cover */}
      <div className="relative w-full overflow-hidden" style={{ height: '560px', marginTop: 0 }}>
        {event.cover_image_url ? (
          <Image
            src={event.cover_image_url}
            alt={event.title}
            fill
            className="img-cover"
            priority
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, var(--color-dusty-blue) 0%, var(--color-navy) 100%)',
            }}
          >
            <span
              className="heading-display text-9xl opacity-10"
              style={{ color: 'var(--color-cream)' }}
            >
              UCIC
            </span>
          </div>
        )}
        <div
          className="absolute inset-0 flex items-end"
          style={{
            background: 'linear-gradient(to top, rgba(47,71,95,0.7) 0%, transparent 60%)',
          }}
        >
          <div className="max-w-7xl mx-auto px-6 pb-10 w-full">
            <div className="flex items-center gap-3 mb-3">
              <span
                className="pill"
                style={{
                  background: past ? 'rgba(253,248,217,0.7)' : 'rgba(156,182,215,0.85)',
                  color: 'var(--color-navy)',
                }}
              >
                {past ? 'Past Event' : 'Upcoming'}
              </span>
              {event.registration_mode !== 'none' && !past && !closed && !full && (
                <span
                  className="pill"
                  style={{ background: 'rgba(253,248,217,0.85)', color: 'var(--color-navy)' }}
                >
                  Registration Open
                </span>
              )}
            </div>
            <h1
              className="heading-display text-5xl sm:text-6xl lg:text-7xl"
              style={{ color: 'var(--color-cream)' }}
            >
              {event.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Detail Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main description */}
          <div className="lg:col-span-2">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 text-sm mb-8 opacity-50 hover:opacity-100 transition-opacity"
              style={{ color: 'var(--color-navy)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              All Events
            </Link>

            <h2
              className="heading-section text-3xl mb-6"
              style={{ color: 'var(--color-navy)' }}
            >
              About this Event
            </h2>
            {event.description ? (
              <div
                className="prose prose-sm max-w-none leading-relaxed opacity-70"
                style={{ color: 'var(--color-navy)' }}
              >
                {event.description.split('\n').map((para, i) => (
                  <p key={i} className="mb-4">{para}</p>
                ))}
              </div>
            ) : (
              <p className="opacity-40 italic" style={{ color: 'var(--color-navy)' }}>
                No description provided yet.
              </p>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Info card */}
            <div className="card-cream p-6">
              <h3
                className="font-bold text-sm uppercase tracking-wider mb-4 opacity-50"
                style={{ color: 'var(--color-navy)' }}
              >
                Event Details
              </h3>
              <ul className="space-y-4">
                {event.date && (
                  <li className="flex gap-3">
                    <svg
                      className="mt-0.5 shrink-0 opacity-40"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{ color: 'var(--color-navy)' }}
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <path d="M16 2v4M8 2v4M3 10h18" />
                    </svg>
                    <div>
                      <div className="text-sm font-semibold" style={{ color: 'var(--color-navy)' }}>
                        {formatDate(event.date)}
                      </div>
                      {event.end_date && (
                        <div className="text-xs opacity-50" style={{ color: 'var(--color-navy)' }}>
                          Until {formatDate(event.end_date)}
                        </div>
                      )}
                    </div>
                  </li>
                )}
                {event.location && (
                  <li className="flex gap-3">
                    <svg
                      className="mt-0.5 shrink-0 opacity-40"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{ color: 'var(--color-navy)' }}
                    >
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                      <circle cx="12" cy="9" r="2.5" />
                    </svg>
                    <span className="text-sm" style={{ color: 'var(--color-navy)' }}>
                      {event.location}
                    </span>
                  </li>
                )}
                {event.capacity && (
                  <li className="flex gap-3">
                    <svg
                      className="mt-0.5 shrink-0 opacity-40"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{ color: 'var(--color-navy)' }}
                    >
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                    </svg>
                    <div>
                      <div className="text-sm" style={{ color: 'var(--color-navy)' }}>
                        <span className="font-semibold">{registrantCount ?? 0}</span> / {event.capacity} registered
                      </div>
                      {/* Progress bar */}
                      <div
                        className="h-1.5 rounded-full mt-1.5 overflow-hidden"
                        style={{ background: 'rgba(156,182,215,0.3)', width: '100%' }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(100, Math.round(((registrantCount ?? 0) / event.capacity) * 100))}%`,
                            background: full ? '#8b2424' : 'var(--color-dusty-blue)',
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </div>
                    </div>
                  </li>
                )}
                {event.deadline && (
                  <li className="flex gap-3">
                    <svg
                      className="mt-0.5 shrink-0 opacity-40"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{ color: 'var(--color-navy)' }}
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                    <div>
                      <div className="text-xs opacity-50 mb-0.5" style={{ color: 'var(--color-navy)' }}>
                        Registration deadline
                      </div>
                      <div className="text-sm" style={{ color: 'var(--color-navy)' }}>
                        {formatDateTime(event.deadline)}
                      </div>
                    </div>
                  </li>
                )}
              </ul>
            </div>

            {/* Register CTA */}
            {registerState ? (
              <div className="card-cream p-6">
                {registerState.disabled ? (
                  <button
                    disabled
                    className="w-full py-3 px-6 rounded-pill text-center font-semibold text-sm opacity-40 cursor-not-allowed"
                    style={{
                      background: 'rgba(47,71,95,0.1)',
                      color: 'var(--color-navy)',
                      border: '1.5px solid rgba(47,71,95,0.15)',
                    }}
                  >
                    {registerState.label}
                  </button>
                ) : registerState.external ? (
                  <a
                    href={registerState.href!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary w-full justify-center"
                  >
                    {registerState.label}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                    </svg>
                  </a>
                ) : (
                  <Link
                    href={registerState.href!}
                    className="btn-primary w-full justify-center"
                  >
                    {registerState.label}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
