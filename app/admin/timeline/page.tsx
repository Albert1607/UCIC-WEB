import { getAllTimeline } from '@/lib/db/queries/timeline'
import { TimelineItem } from '@/types'
import TimelineManager from './TimelineManager'

export const dynamic = 'force-dynamic'

export default async function AdminTimelinePage() {
  const data = await getAllTimeline()

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="heading-display text-4xl text-[var(--color-navy)] mb-1">Timeline</h1>
        <p className="text-sm opacity-60 text-[var(--color-navy-secondary)]">
          Manage the &ldquo;Our Journey&rdquo; section shown on the About page.
        </p>
      </div>
      <TimelineManager initialItems={(data ?? []) as unknown as TimelineItem[]} />
    </div>
  )
}
