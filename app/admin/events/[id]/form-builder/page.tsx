import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getEventById } from '@/lib/db/queries/events'
import { getFormFieldsByEvent } from '@/lib/db/queries/form-fields'
import type { Event, FormField } from '@/types'
import FormBuilderClient from './FormBuilderClient'
import EventTabNav from '@/components/admin/EventTabNav'

interface PageProps {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export default async function FormBuilderPage({ params }: PageProps) {
  const { id } = await params

  const [event, fields] = await Promise.all([
    getEventById(id),
    getFormFieldsByEvent(id),
  ])

  if (!event) {
    notFound()
  }

  const typedEvent = event as unknown as Event
  const typedFields = (fields ?? []) as unknown as FormField[]

  return (
    <div className="min-h-screen bg-[var(--color-pale-blue)] p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
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
                Form Builder
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
        <EventTabNav event={typedEvent} activeTab="form-builder" />

        {/* Warning banner when registration_mode is not 'internal' */}
        {typedEvent.registration_mode !== 'internal' && (
          <div className="card-cream p-5 rounded-2xl border-l-4 border-amber-500 text-sm">
            <p className="font-bold text-[var(--color-navy)]">Form builder is inactive</p>
            <p className="opacity-75 mt-1 text-[var(--color-navy)]">
              This event is set to{' '}
              <strong>
                {typedEvent.registration_mode === 'none' ? 'No Registration' : 'External Link'}
              </strong>
              . Change registration mode to <strong>On our site</strong> in Event Details to enable
              public registrations using this form.
            </p>
          </div>
        )}

        {/* Main builder */}
        <FormBuilderClient event={typedEvent} initialFields={typedFields} />
      </div>
    </div>
  )
}
