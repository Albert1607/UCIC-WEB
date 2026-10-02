import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Event, FormField } from '@/types'
import FormBuilderClient from './FormBuilderClient'

interface PageProps {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export default async function FormBuilderPage({ params }: PageProps) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (eventError || !event) {
    notFound()
  }

  const { data: fields, error: fieldsError } = await supabase
    .from('form_fields')
    .select('*')
    .eq('event_id', id)
    .order('sort_order', { ascending: true })

  if (fieldsError) {
    console.error('Error fetching form fields:', fieldsError)
  }

  const typedEvent = event as Event
  const typedFields = (fields ?? []) as FormField[]

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
        <div className="flex items-center gap-2 border-b border-[var(--color-dusty-blue)]/30 pb-3 overflow-x-auto">
          <Link
            href={`/admin/events/${typedEvent.id}`}
            className="px-4 py-2 rounded-pill text-xs font-bold bg-[var(--color-cream)] text-[var(--color-navy)] border border-[var(--color-dusty-blue)]/50 hover:bg-[var(--color-dusty-blue)]/20 transition-colors"
          >
            Details & Settings
          </Link>
          <Link
            href={`/admin/events/${typedEvent.id}/form-builder`}
            className="px-4 py-2 rounded-pill text-xs font-bold bg-[var(--color-navy)] text-[var(--color-cream)]"
          >
            Form Builder
          </Link>
          <Link
            href={`/admin/events/${typedEvent.id}/registrants`}
            className="px-4 py-2 rounded-pill text-xs font-bold bg-[var(--color-cream)] text-[var(--color-navy)] border border-[var(--color-dusty-blue)]/50 hover:bg-[var(--color-dusty-blue)]/20 transition-colors"
          >
            Registrants
          </Link>
        </div>

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
