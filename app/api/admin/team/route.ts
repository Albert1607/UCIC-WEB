import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth/session'
import { getAllTeamMembers, createTeamMember } from '@/lib/db/queries/team'

function unauthorized() { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

export async function GET() {
  if (!(await getAdminSession())) return unauthorized()
  const data = await getAllTeamMembers()
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  if (!(await getAdminSession())) return unauthorized()
  let body: { name: string; role: string; bio?: string; photo_url?: string; sort_order?: number }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  if (!body.name || !body.role) return NextResponse.json({ error: 'name and role are required' }, { status: 400 })
  try {
    const data = await createTeamMember({ name: body.name, role: body.role, bio: body.bio ?? null, photo_url: body.photo_url ?? null, sort_order: body.sort_order })
    return NextResponse.json(data, { status: 201 })
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }) }
}
