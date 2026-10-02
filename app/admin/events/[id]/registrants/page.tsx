import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { Event, FormField, Registration } from '@/types'
import RegistrantsClient from './RegistrantsClient'

interface Props {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export default async function AdminRegistrantsPage({ params }: Props) {
  const { id } = await params
  const admin = createAdminClient()

  const [
    { data: event, error: eventError },
    { data: fields, error: fieldsError },
    { data: registrations, error: registrationsError },
  ] = await Promise.all([
    admin.from('events').select('*').eq('id', id).single(),
    admin.from('form_fields').select('*').eq('event_id', id).order('sort_order', { ascending: true }),
    admin.from('registrations').select('*').eq('event_id', id).order('created_at', { ascending: false }),
  ])

  if (eventError || !event) {
    notFound()
  }

  if (fieldsError) console.error('Error fetching fields:', fieldsError)
  if (registrationsError) console.error('Error fetching registrations:', registrationsError)

  const typedEvent = event as Event
  const typedFields = (fields ?? []) as FormField[]
  const typedRegistrations = (registrations ?? []) as Registration[]

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
        <div className="flex items-center gap-2 border-b border-[var(--color-dusty-blue)]/30 pb-3 overflow-x-auto">
          <Link
            href={`/admin/events/${typedEvent.id}`}
            className="px-4 py-2 rounded-pill text-xs font-bold bg-[var(--color-cream)] text-[var(--color-navy)] border border-[var(--color-dusty-blue)]/50 hover:bg-[var(--color-dusty-blue)]/20 transition-colors"
          >
            Details & Settings
          </Link>
          <Link
            href={`/admin/events/${typedEvent.id}/form-builder`}
            className="px-4 py-2 rounded-pill text-xs font-bold bg-[var(--color-cream)] text-[var(--color-navy)] border border-[var(--color-dusty-blue)]/50 hover:bg-[var(--color-dusty-blue)]/20 transition-colors"
          >
            Form Builder
          </Link>
          <Link
            href={`/admin/events/${typedEvent.id}/registrants`}
            className="px-4 py-2 rounded-pill text-xs font-bold bg-[var(--color-navy)] text-[var(--color-cream)]"
          >
            Registrants
          </Link>
        </div>

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
