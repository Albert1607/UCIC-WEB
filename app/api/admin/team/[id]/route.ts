import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth/session'
import { updateTeamMember, deleteTeamMember } from '@/lib/db/queries/team'

function unauthorized() { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) return unauthorized()
  const { id } = await params
  const body = await req.json()
  const updateData: Record<string, unknown> = {}
  if (body.name !== undefined) updateData.name = body.name
  if (body.role !== undefined) updateData.role = body.role
  if (body.bio !== undefined) updateData.bio = body.bio || null
  if (body.photo_url !== undefined) updateData.photo_url = body.photo_url || null
  if (body.sort_order !== undefined) updateData.sort_order = body.sort_order
  try {
    const data = await updateTeamMember(id, updateData)
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(data)
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }) }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) return unauthorized()
  const { id } = await params
  await deleteTeamMember(id)
  return NextResponse.json({ success: true })
}
