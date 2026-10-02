import { createClient } from '@/lib/supabase/server'
import { TeamMember } from '@/types'
import TeamManager from './TeamManager'

export const dynamic = 'force-dynamic'

export default async function AdminTeamPage() {
  const supabase = await createClient()

  const { data: members, error } = await supabase
    .from('team_members')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching team members:', error)
  }

  const memberList: TeamMember[] = members ?? []

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="heading-display text-4xl text-[var(--color-navy)] mb-1">
          Team Members
        </h1>
        <p className="text-sm opacity-60 text-[var(--color-navy-secondary)]">
          Manage leadership and committee members displayed on the About page.
        </p>
      </div>

      <TeamManager initialMembers={memberList} />
    </div>
  )
}
