import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Event } from '@/types'
import { formatDate } from '@/lib/utils'
import DeleteEventButton from './DeleteEventButton'

export const dynamic = 'force-dynamic'

export default async function AdminEventsPage() {
  const supabase = await createClient()

  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching events:', error)
  }

  const eventList: Event[] = events ?? []

  const registrationModeLabel: Record<string, string> = {
    none: 'None',
    internal: 'Internal Form',
    external: 'External Link',
  }

  return (
    <div className="min-h-screen bg-[var(--color-pale-blue)] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="section-label">Admin</p>
            <h1 className="heading-display text-[var(--color-navy)]">Events</h1>
            {eventList.length > 0 && (
              <p className="text-sm text-[var(--color-navy)] opacity-60 mt-1">
                {eventList.length} event{eventList.length !== 1 ? 's' : ''} total
              </p>
            )}
          </div>
          <Link
            href="/admin/events/new"
            className="btn-primary self-start sm:self-auto"
          >
            + New Event
          </Link>
        </div>

        {/* Content */}
        {eventList.length === 0 ? (
          <div className="card-cream rounded-2xl p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-dusty-blue)]/20 mb-4">
              <svg className="w-8 h-8 text-[var(--color-dusty-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="heading-section text-[var(--color-navy)] mb-2">No events yet</h2>
            <p className="text-[var(--color-navy)] opacity-60 mb-6">
              Create your first event to get started.
            </p>
            <Link href="/admin/events/new" className="btn-primary">
              Create Your First Event
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block card-cream rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--color-dusty-blue)]/30">
                      <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-navy)] opacity-60">
                        Event
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-navy)] opacity-60">
                        Date
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-navy)] opacity-60">
                        Location
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-navy)] opacity-60">
                        Status
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-navy)] opacity-60">
                        Registration
                      </th>
                      <th className="text-right px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-navy)] opacity-60">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-dusty-blue)]/20">
                    {eventList.map((event) => (
                      <tr key={event.id} className="hover:bg-[var(--color-pale-blue)]/50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-[var(--color-navy)] leading-tight">
                              {event.title}
                            </p>
                            <p className="text-xs text-[var(--color-navy)] opacity-50 mt-0.5">
                              /{event.slug}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-[var(--color-navy)] opacity-80 whitespace-nowrap">
                          {event.date ? formatDate(event.date) : '—'}
                        </td>
                        <td className="px-6 py-4 text-sm text-[var(--color-navy)] opacity-80">
                          {event.location ?? '—'}
                        </td>
                        <td className="px-6 py-4">
                          {event.is_published ? (
                            <span className="pill bg-emerald-100 text-emerald-800">Published</span>
                          ) : (
                            <span className="pill pill-dusty">Draft</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-[var(--color-navy)] opacity-80">
                          {registrationModeLabel[event.registration_mode] ?? event.registration_mode}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/events/${event.id}`}
                              className="btn-secondary text-sm px-3 py-1.5"
                            >
                              Edit
                            </Link>
                            <DeleteEventButton eventId={event.id} eventTitle={event.title} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card List */}
            <div className="md:hidden space-y-3">
              {eventList.map((event) => (
                <div key={event.id} className="card-cream rounded-2xl p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-[var(--color-navy)] leading-tight truncate">
                        {event.title}
                      </p>
                      <p className="text-xs text-[var(--color-navy)] opacity-50 mt-0.5">
                        /{event.slug}
                      </p>
                    </div>
                    {event.is_published ? (
                      <span className="pill bg-emerald-100 text-emerald-800 shrink-0">Published</span>
                    ) : (
                      <span className="pill pill-dusty shrink-0">Draft</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm text-[var(--color-navy)] opacity-80">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider opacity-60 block">Date</span>
                      {event.date ? formatDate(event.date) : '—'}
                    </div>
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider opacity-60 block">Location</span>
                      {event.location ?? '—'}
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs font-semibold uppercase tracking-wider opacity-60 block">Registration</span>
                      {registrationModeLabel[event.registration_mode] ?? event.registration_mode}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Link
                      href={`/admin/events/${event.id}`}
                      className="btn-secondary text-sm px-4 py-2 flex-1 text-center"
                    >
                      Edit
                    </Link>
                    <DeleteEventButton eventId={event.id} eventTitle={event.title} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
