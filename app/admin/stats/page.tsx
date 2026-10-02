import { createClient } from '@/lib/supabase/server'
import { SiteStat } from '@/types'
import StatsManager from './StatsManager'

export const dynamic = 'force-dynamic'

export default async function AdminStatsPage() {
  const supabase = await createClient()

  const { data: stats, error } = await supabase
    .from('site_stats')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching site_stats:', error)
  }

  const statList: SiteStat[] = stats ?? []

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="heading-display text-4xl text-[var(--color-navy)] mb-1">
          Key Statistics
        </h1>
        <p className="text-sm opacity-60 text-[var(--color-navy-secondary)]">
          Configure highlighted numbers and labels shown across the website.
        </p>
      </div>

      <StatsManager initialStats={statList} />
    </div>
  )
}
