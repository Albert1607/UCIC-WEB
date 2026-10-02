import EventForm from '@/components/admin/EventForm'

export default function NewEventPage() {
  return (
    <div className="min-h-screen bg-[var(--color-pale-blue)] p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <p className="section-label">Admin / Events</p>
          <h1 className="heading-display text-[var(--color-navy)]">New Event</h1>
        </div>
        <EventForm />
      </div>
    </div>
  )
}
