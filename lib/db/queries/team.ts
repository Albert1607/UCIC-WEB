import { db } from '@/lib/db/client'
import type { TeamMember } from '@/types'

export type { TeamMember }

export async function getAllTeamMembers(): Promise<TeamMember[]> {
  const rows = await db`SELECT * FROM team_members ORDER BY sort_order`
  return rows as unknown as TeamMember[]
}

export async function createTeamMember(data: { name: string; role: string; bio?: string | null; photo_url?: string | null; sort_order?: number }): Promise<TeamMember> {
  const order = data.sort_order ?? await getNextSortOrder()
  const rows = await db`
    INSERT INTO team_members (name, role, bio, photo_url, sort_order)
    VALUES (${data.name}, ${data.role}, ${data.bio ?? null}, ${data.photo_url ?? null}, ${order})
    RETURNING *`
  return rows[0] as unknown as TeamMember
}

export async function updateTeamMember(id: string, data: Partial<Omit<TeamMember, 'id' | 'created_at'>>): Promise<TeamMember | null> {
  const patch = { ...data, updated_at: new Date().toISOString() }
  const rows = await db`UPDATE team_members SET ${db(patch as any)} WHERE id = ${id} RETURNING *`
  return (rows[0] as unknown as TeamMember) ?? null
}

export async function deleteTeamMember(id: string): Promise<void> {
  await db`DELETE FROM team_members WHERE id = ${id}`
}

export async function reorderTeamMembers(ids: string[]): Promise<void> {
  await Promise.all(ids.map((id, i) => db`UPDATE team_members SET sort_order = ${i} WHERE id = ${id}`))
}

async function getNextSortOrder(): Promise<number> {
  const rows = await db`SELECT MAX(sort_order) as max FROM team_members`
  return ((rows[0]?.max as number) ?? -1) + 1
}
