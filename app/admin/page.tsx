import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Fetch quick stats
  const [
    { count: eventCount },
    { count: registrationCount },
    { count: teamCount },
    { data: recentEvents },
  ] = await Promise.all([
    supabase.from('events').select('*', { count: 'exact', head: true }),
    supabase.from('registrations').select('*', { count: 'exact', head: true }),
    supabase.from('team_members').select('*', { count: 'exact', head: true }),
    supabase
      .from('events')
      .select('id, title, slug, is_published, date, registration_mode')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const quickStats = [
    { label: 'Total Events', value: eventCount ?? 0, href: '/admin/events', color: 'var(--color-navy)' },
    { label: 'Registrations', value: registrationCount ?? 0, href: '/admin/events', color: 'var(--color-dusty-blue)' },
    { label: 'Team Members', value: teamCount ?? 0, href: '/admin/team', color: 'var(--color-navy-secondary)' },
  ]

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1
          className="heading-display text-4xl sm:text-5xl"
          style={{ color: 'var(--color-navy)' }}
        >
          Dashboard
        </h1>
        <p className="text-sm opacity-50 mt-1" style={{ color: 'var(--color-navy)' }}>
          Welcome back to the UCIC admin panel.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {quickStats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="card-cream p-6 hover:-translate-y-0.5 transition-transform block"
            style={{ textDecoration: 'none' }}
          >
            <div
              className="heading-display text-5xl mb-1"
              style={{ color: stat.color }}
            >
              {stat.value}
            </div>
            <div className="text-sm opacity-50" style={{ color: 'var(--color-navy)' }}>
              {stat.label}
            </div>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        {[
          { href: '/admin/events/new', label: 'New Event', icon: '+' },
          { href: '/admin/content', label: 'Edit Content', icon: '✏' },
          { href: '/admin/team', label: 'Manage Team', icon: '👥' },
          { href: '/admin/stats', label: 'Edit Stats', icon: '📊' },
        ].map((q) => (
          <Link
            key={q.href}
            href={q.href}
            className="card-cream p-4 text-center hover:-translate-y-0.5 transition-transform block"
            style={{ textDecoration: 'none' }}
          >
            <div className="text-2xl mb-1">{q.icon}</div>
            <div className="text-xs font-semibold" style={{ color: 'var(--color-navy)' }}>
              {q.label}
            </div>
          </Link>
        ))}
      </div>

      {/* Recent events */}
      <div className="card-cream p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold" style={{ color: 'var(--color-navy)' }}>Recent Events</h2>
          <Link
            href="/admin/events"
            className="text-sm opacity-50 hover:opacity-100 transition-opacity"
            style={{ color: 'var(--color-navy)' }}
          >
            View all →
          </Link>
        </div>
        {recentEvents && recentEvents.length > 0 ? (
          <ul className="divide-y" style={{ borderColor: 'rgba(156,182,215,0.2)' }}>
            {recentEvents.map((event) => (
              <li key={event.id} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate" style={{ color: 'var(--color-navy)' }}>
                    {event.title}
                  </div>
                  <div className="text-xs opacity-40 mt-0.5" style={{ color: 'var(--color-navy)' }}>
                    {event.registration_mode}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className="pill text-xs"
                    style={{
                      background: event.is_published ? 'rgba(80,180,100,0.12)' : 'rgba(156,182,215,0.2)',
                      color: event.is_published ? '#2a6e3a' : 'var(--color-navy)',
                      border: '1px solid',
                      borderColor: event.is_published ? 'rgba(80,180,100,0.3)' : 'rgba(156,182,215,0.3)',
                    }}
                  >
                    {event.is_published ? 'Published' : 'Draft'}
                  </span>
                  <Link
                    href={`/admin/events/${event.id}`}
                    className="text-xs opacity-50 hover:opacity-100 transition-opacity"
                    style={{ color: 'var(--color-navy)' }}
                  >
                    Edit
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm opacity-40 italic py-4 text-center" style={{ color: 'var(--color-navy)' }}>
            No events yet. <Link href="/admin/events/new" className="underline opacity-60">Create your first event →</Link>
          </p>
        )}
      </div>
    </div>
  )
}
