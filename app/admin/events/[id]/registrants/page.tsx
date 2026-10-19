import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getEventById } from '@/lib/db/queries/events'
import { getFormFieldsByEvent } from '@/lib/db/queries/form-fields'
import { getRegistrationsByEventId } from '@/lib/db/queries/registrations'
import { Event, FormField, Registration } from '@/types'
import RegistrantsClient from './RegistrantsClient'
import EventTabNav from '@/components/admin/EventTabNav'

interface Props {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export default async function AdminRegistrantsPage({ params }: Props) {
  const { id } = await params

  const [event, fields, registrations] = await Promise.all([
    getEventById(id),
    getFormFieldsByEvent(id),
    getRegistrationsByEventId(id),
  ])

  if (!event) {
    notFound()
  }

  const typedEvent = event as unknown as Event
  const typedFields = (fields ?? []) as unknown as FormField[]
  const typedRegistrations = (registrations ?? []) as unknown as Registration[]

  return (
    <div className="min-h-screen bg-[var(--color-pale-blue)] p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Breadcrumb Header */}
        <div>
          <Link
            href={`/admin/events/${typedEvent.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-navy)] opacity-60 hover:opacity-100 transition-opacity mb-2"
          >
            ← Back to Event Settings
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-dusty-blue)]">
                Registrations
              </p>
              <h1 className="heading-display text-3xl sm:text-4xl text-[var(--color-navy)]">
                {typedEvent.title}
              </h1>
            </div>
            {typedEvent.is_published && typedEvent.registration_mode === 'internal' && (
              <Link
                href={`/events/${typedEvent.slug}/register`}
                target="_blank"
                className="btn-secondary !py-2 !px-4 text-xs"
              >
                View Public Form ↗
              </Link>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <EventTabNav event={typedEvent} activeTab="registrants" />

        {/* Warning if external */}
        {typedEvent.registration_mode !== 'internal' && (
          <div className="card-cream p-5 rounded-2xl border-l-4 border-amber-500 text-sm">
            <p className="font-bold text-[var(--color-navy)]">Notice</p>
            <p className="opacity-75 mt-1 text-[var(--color-navy)]">
              This event does not use on-site registration. If any previous registrations were recorded, they appear below.
            </p>
          </div>
        )}

        {/* Registrants Client */}
        <RegistrantsClient
          event={typedEvent}
          fields={typedFields}
          initialRegistrations={typedRegistrations}
        />
      </div>
    </div>
  )
}
