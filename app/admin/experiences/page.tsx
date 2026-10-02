import { createClient } from '@/lib/supabase/server'
import { Experience } from '@/types'
import ExperiencesManager from './ExperiencesManager'

export const dynamic = 'force-dynamic'

export default async function AdminExperiencesPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('experiences')
    .select('*')
    .order('sort_order', { ascending: true })

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="heading-display text-4xl text-[var(--color-navy)] mb-1">Experiences</h1>
        <p className="text-sm opacity-60 text-[var(--color-navy-secondary)]">
          Manage the &ldquo;What We Do&rdquo; cards shown on the About page.
        </p>
      </div>
      <ExperiencesManager initialExperiences={(data ?? []) as Experience[]} />
    </div>
  )
}
