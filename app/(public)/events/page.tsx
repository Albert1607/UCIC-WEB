import type { Metadata } from 'next'
import { getSiteContent } from '@/lib/content'
import { createClient } from '@/lib/supabase/server'
import { Event } from '@/types'
import EventCard from '@/components/EventCard'
import SectionLabel from '@/components/SectionLabel'
import ScrollingStrip from '@/components/ScrollingStrip'

export const metadata: Metadata = { title: 'Events' }

export default async function EventsPage() {
  const content = await getSiteContent()
  const supabase = await createClient()

  const { data: eventsData } = await supabase
    .from('events')
    .select('*')
    .eq('is_published', true)
    .order('date', { ascending: false })

  const allEvents: Event[] = eventsData ?? []
  const now = new Date()

  const upcoming = allEvents.filter((e) => e.date && new Date(e.date) >= now)
  const past = allEvents.filter((e) => !e.date || new Date(e.date) < now)

  return (
    <div>
      {/* Header */}
      <section className="pt-32 pb-20 max-w-7xl mx-auto px-6">
        <SectionLabel letter="A" />
        <h1
          className="heading-display text-6xl sm:text-7xl lg:text-8xl mb-4"
          style={{ color: 'var(--color-navy)' }}
        >
          {content['events_section_title'] || 'Events'}
        </h1>
        <p
          className="text-lg opacity-60 max-w-xl leading-relaxed"
          style={{ color: 'var(--color-navy)' }}
        >
          From cultural exchanges to workshops and social gatherings — join us at our next event.
        </p>
      </section>

      {/* Upcoming Events */}
      <section className="pb-20 max-w-7xl mx-auto px-6">
        <SectionLabel letter="B" />
        <h2
          className="heading-section text-3xl sm:text-4xl mb-8"
          style={{ color: 'var(--color-navy)' }}
        >
          {content['events_upcoming_label'] || 'Upcoming'}
        </h2>

        {upcoming.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcoming.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div
            className="text-center py-20 rounded-2xl"
            style={{ border: '1.5px dashed rgba(156,182,215,0.4)' }}
          >
            <svg
              className="mx-auto mb-4 opacity-20"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              style={{ color: 'var(--color-navy)' }}
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            <p
              className="opacity-40 italic"
              style={{ color: 'var(--color-navy)' }}
            >
              No upcoming events right now — check back soon!
            </p>
          </div>
        )}
      </section>

      {past.length > 0 && (
        <>
          <ScrollingStrip text={content['scrolling_strip_text'] || 'UCIC · Past Events · Community · International ·'} />

          {/* Past Events */}
          <section className="py-20" style={{ background: 'var(--color-cream)' }}>
            <div className="max-w-7xl mx-auto px-6">
              <SectionLabel letter="C" />
              <h2
                className="heading-section text-3xl sm:text-4xl mb-8"
                style={{ color: 'var(--color-navy)' }}
              >
                {content['events_past_label'] || 'Past Events'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {past.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
