import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getSession } from '@/lib/auth/session'
import { getEventBySlug } from '@/lib/db/queries/events'
import { countRegistrationsByEvent } from '@/lib/db/queries/registrations'
import { getFormFieldsByEvent } from '@/lib/db/queries/form-fields'
import { isEventPast, isRegistrationClosed } from '@/lib/utils'
import { Event, FormField } from '@/types'
import RegistrationPageClient from './RegistrationPageClient'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return { title: `Register — ${slug}` }
}

export default async function RegisterPage({ params }: Props) {
  const { slug } = await params

  const eventData = await getEventBySlug(slug, true)
  if (!eventData || eventData.registration_mode !== 'internal') notFound()

  const event: Event = eventData as unknown as Event

  // If event requires submission, user must be logged in
  if (event.requires_submission) {
    const session = await getSession()
    if (!session) {
      redirect(`/login?next=/events/${slug}/register`)
    }
  }

  // Guard conditions
  const past = isEventPast(event)
  const closed = isRegistrationClosed(event)

  const registrantCount = await countRegistrationsByEvent(event.id)
  const full = event.capacity != null && registrantCount >= event.capacity

  if (past || closed || full) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <div className="card-cream p-12">
          <div className="heading-display text-5xl mb-4 opacity-20" style={{ color: 'var(--color-navy)' }}>!</div>
          <h1 className="heading-section text-3xl mb-3" style={{ color: 'var(--color-navy)' }}>
            {full ? 'This event is full' : past ? 'This event has passed' : 'Registration is closed'}
          </h1>
          <p className="opacity-50 text-sm" style={{ color: 'var(--color-navy)' }}>
            {full
              ? 'All spots have been filled. Please check other upcoming events.'
              : past
              ? 'This event has already taken place.'
              : 'The registration deadline has passed.'}
          </p>
        </div>
      </div>
    )
  }

  // Fetch form fields
  const fieldsData = await getFormFieldsByEvent(event.id)
  const fields: FormField[] = (fieldsData ?? []) as FormField[]

  if (fields.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <div className="card-cream p-12">
          <p className="opacity-50 italic text-sm" style={{ color: 'var(--color-navy)' }}>
            No registration form has been set up for this event yet.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-10">
        <span className="pill pill-dusty mb-4 inline-block">Registration</span>
        <h1 className="heading-display text-4xl sm:text-5xl mb-3" style={{ color: 'var(--color-navy)' }}>
          {event.title}
        </h1>
        {registrantCount != null && event.capacity && (
          <p className="text-sm opacity-50" style={{ color: 'var(--color-navy)' }}>
            {registrantCount} / {event.capacity} spots taken
          </p>
        )}
      </div>

      <div className="card-cream p-8">
        <RegistrationPageClient
          event={event}
          fields={fields}
        />
      </div>
    </div>
  )
}
