import Image from 'next/image'
import Link from 'next/link'
import { getSiteContent, getSiteStats } from '@/lib/content'
import { createClient } from '@/lib/supabase/server'
import { Event, SiteStat } from '@/types'
import EventCard from '@/components/EventCard'
import ScrollingStrip from '@/components/ScrollingStrip'
import SectionLabel from '@/components/SectionLabel'
import { formatDate } from '@/lib/utils'

export default async function HomePage() {
  const [content, stats] = await Promise.all([getSiteContent(), getSiteStats()])
  const supabase = await createClient()

  // Fetch recent published events
  const { data: recentEvents } = await supabase
    .from('events')
    .select('*')
    .eq('is_published', true)
    .order('date', { ascending: false })
    .limit(4)

  const events: Event[] = recentEvents ?? []
  const upcomingEvents = events.filter((e) => e.date && new Date(e.date) >= new Date())
  const latestEvents = events.slice(0, 3)

  const heroImage = content['hero_image_url']
  

  return (
    <div>
      {/* ====== HERO ====== */}
      <section className="relative min-h-screen flex flex-col justify-end pt-28 sm:pt-36 pb-14 sm:pb-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          {heroImage ? (
            <Image
              src={heroImage}
              alt="Hero"
              fill
              className="img-cover"
              priority
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, var(--color-navy) 0%, var(--color-dusty-blue) 60%, var(--color-pale-blue) 100%)`,
              }}
            />
          )}
          {/* Multi-stop Overlay: Dark at top for glass navbar contrast, open in center for photo visibility, dark at bottom for crisp text readability */}
          <div
            className="absolute inset-0"
            style={{
              background: heroImage
                ? 'linear-gradient(180deg, rgba(20, 35, 52, 0.75) 0%, rgba(20, 35, 52, 0.22) 32%, rgba(20, 35, 52, 0.55) 65%, rgba(20, 35, 52, 0.92) 100%)'
                : 'none',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-end">
            {/* Headline */}
            <div className="lg:col-span-2">
              <div className="mb-4">
                <span
                  className="pill"
                  style={{
                    background: 'rgba(255, 255, 255, 0.14)',
                    color: '#fff',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    backdropFilter: 'blur(10px)',
                    textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                  }}
                >
                  Universitas Ciputra International Community
                </span>
              </div>
              <h1
                className="heading-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl mb-5"
                style={{
                  color: 'var(--color-cream)',
                  lineHeight: 0.95,
                  textShadow: '0 3px 24px rgba(0,0,0,0.7)',
                }}
              >
                {content['hero_headline'] || 'Connecting Students Across the Globe'}
              </h1>
              <p
                className="text-base sm:text-lg max-w-xl leading-relaxed opacity-90 mb-7"
                style={{
                  color: 'var(--color-cream)',
                  textShadow: '0 1px 8px rgba(0,0,0,0.6)',
                }}
              >
                {content['hero_subheadline'] ||
                  'Where cultures meet, ideas grow, and friendships last.'}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/events"
                  className="btn-primary"
                  style={{
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                  }}
                >
                  {content['hero_cta_label'] || 'Browse Events'}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href="/about"
                  className="btn-secondary"
                  style={{
                    borderColor: 'rgba(253,248,217,0.7)',
                    color: 'var(--color-cream)',
                    backdropFilter: 'blur(8px)',
                    background: 'rgba(255,255,255,0.06)',
                  }}
                >
                  About Us
                </Link>
              </div>
            </div>

            {/* Floating info card */}
            <div className="lg:justify-self-end">
              <div
                className="card-cream p-6 max-w-xs w-full"
                style={{
                  backdropFilter: 'blur(16px)',
                  background: 'rgba(253,248,217,0.95)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 flex items-center justify-center shrink-0"
                    style={{ background: 'var(--color-navy)' }}
                  >
                    <span className="heading-display text-sm" style={{ color: 'var(--color-cream)' }}>
                      UC
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-sm" style={{ color: 'var(--color-navy)' }}>
                      {content['hero_card_title'] || 'Join UCIC'}
                    </div>
                    <div className="text-xs opacity-60" style={{ color: 'var(--color-navy)' }}>
                      {content['hero_card_subtitle'] || 'Open to all UC students'}
                    </div>
                  </div>
                </div>
                {/* Upcoming event preview */}
                {upcomingEvents.length > 0 ? (
                  <>
                    <div className="text-xs font-semibold uppercase tracking-wider opacity-50 mb-2" style={{ color: 'var(--color-navy)' }}>
                      Next Event
                    </div>
                    <div
                      className="p-3"
                      style={{ background: 'rgba(156,182,215,0.18)' }}
                    >
                      <div className="font-semibold text-sm mb-1" style={{ color: 'var(--color-navy)' }}>
                        {upcomingEvents[0].title}
                      </div>
                      {upcomingEvents[0].date && (
                        <div className="text-xs opacity-60" style={{ color: 'var(--color-navy)' }}>
                          {formatDate(upcomingEvents[0].date)}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-xs opacity-50 italic" style={{ color: 'var(--color-navy)' }}>
                    No upcoming events yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== SCROLLING STRIP ====== */}
      <ScrollingStrip
        text={content['scrolling_strip_text'] || 'UCIC · Connecting Students · Events · Community · International · Universitas Ciputra ·'}
      />

      {/* ====== STATS ROW ====== */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <SectionLabel letter="A" />
        <h2
          className="heading-section text-3xl sm:text-4xl mb-10"
          style={{ color: 'var(--color-navy)' }}
        >
          {content['stats_section_title'] || 'By the Numbers'}
        </h2>
        {stats.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((stat: SiteStat) => (
              <div key={stat.id} className="stat-badge text-center">
                <span
                  className="heading-display text-5xl block"
                  style={{ color: 'var(--color-navy)' }}
                >
                  {stat.value}
                </span>
                <span
                  className="text-sm font-medium mt-1 block opacity-60"
                  style={{ color: 'var(--color-navy)' }}
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Members', value: '—' },
              { label: 'Events', value: '—' },
              { label: 'Nationalities', value: '—' },
              { label: 'Years Active', value: '—' },
            ].map((s) => (
              <div key={s.label} className="stat-badge text-center">
                <span className="heading-display text-5xl block" style={{ color: 'var(--color-navy)' }}>
                  {s.value}
                </span>
                <span className="text-sm font-medium mt-1 block opacity-40" style={{ color: 'var(--color-navy)' }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ====== LATEST ACTIVITY ====== */}
      <section className="py-20" style={{ background: 'var(--color-cream)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <SectionLabel letter="B" />
          <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
            <h2
              className="heading-section text-3xl sm:text-4xl"
              style={{ color: 'var(--color-navy)' }}
            >
              {content['latest_activity_title'] || 'Latest Activity'}
            </h2>
            <Link
              href="/events"
              className="btn-secondary text-sm !py-2 !px-5"
            >
              View All Events
            </Link>
          </div>

          {latestEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div
              className="text-center py-20 rounded-2xl"
              style={{ border: '1.5px dashed rgba(156,182,215,0.4)' }}
            >
              <div className="heading-display text-6xl opacity-10 mb-4" style={{ color: 'var(--color-navy)' }}>
                UCIC
              </div>
              <p className="opacity-40 italic" style={{ color: 'var(--color-navy)' }}>
                No events yet — check back soon!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ====== SCROLLING STRIP 2 ====== */}
      <ScrollingStrip
        text={content['scrolling_strip_text'] || 'UCIC · Connecting Students · Events · Community · International · Universitas Ciputra ·'}
      />

      {/* ====== CTA SECTION ====== */}
      <section className="py-24 max-w-7xl mx-auto px-6 text-center">
        <SectionLabel letter="C" className="justify-center" />
        <h2
          className="heading-display text-5xl sm:text-6xl lg:text-7xl mb-6"
          style={{ color: 'var(--color-navy)' }}
        >
          Ready to Connect?
        </h2>
        <p
          className="text-lg opacity-60 max-w-xl mx-auto mb-10 leading-relaxed"
          style={{ color: 'var(--color-navy)' }}
        >
          Join UCIC events and become part of a growing international community at Universitas Ciputra.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/events" className="btn-primary">
            Browse Events
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <Link href="/about" className="btn-secondary">
            Learn More
          </Link>
        </div>
      </section>
    </div>
  )
}
