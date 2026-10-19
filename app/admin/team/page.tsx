import { getAllTeamMembers } from '@/lib/db/queries/team'
import { TeamMember } from '@/types'
import TeamManager from './TeamManager'

export const dynamic = 'force-dynamic'

export default async function AdminTeamPage() {
  const members = await getAllTeamMembers()
  const memberList: TeamMember[] = (members ?? []) as unknown as TeamMember[]

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
