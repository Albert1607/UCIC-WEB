import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { Event } from '@/types'
import EventForm from '@/components/admin/EventForm'
import EventTabNav from '@/components/admin/EventTabNav'

interface Props {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export default async function AdminEventDetailPage({ params }: Props) {
  const { id } = await params
  const admin = createAdminClient()

  const { data: event, error } = await admin
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !event) {
    notFound()
  }

  const typedEvent = event as Event

  return (
    <div className="min-h-screen bg-[var(--color-pale-blue)] p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/admin/events"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-navy)] opacity-60 hover:opacity-100 transition-opacity mb-2"
          >
            ← Back to Events
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-dusty-blue)]">
                Event Management
              </p>
              <h1 className="heading-display text-3xl sm:text-4xl text-[var(--color-navy)]">
                {typedEvent.title}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {typedEvent.is_published && (
                <Link
                  href={`/events/${typedEvent.slug}`}
                  target="_blank"
                  className="btn-secondary !py-2 !px-4 text-xs"
                >
                  View Public Page ↗
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <EventTabNav event={typedEvent} activeTab="details" />

        {/* Edit Form */}
        <EventForm initialEvent={typedEvent} />
      </div>
    </div>
  )
}
