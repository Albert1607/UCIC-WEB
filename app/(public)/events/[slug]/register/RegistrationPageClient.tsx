'use client'

import FormRenderer from '@/components/FormRenderer'
import { Event, FormField } from '@/types'

interface Props {
  event: Event
  fields: FormField[]
}

export default function RegistrationPageClient({ event, fields }: Props) {
  const handleSubmit = async (answers: Record<string, unknown>) => {
    // Server-side validation via API route
    const res = await fetch(`/api/events/${event.slug}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    })

    const data = await res.json()

    if (!res.ok) {
      return { error: data.error ?? 'Something went wrong. Please try again.' }
    }

    return {}
  }

  return <FormRenderer fields={fields} onSubmit={handleSubmit} />
}
