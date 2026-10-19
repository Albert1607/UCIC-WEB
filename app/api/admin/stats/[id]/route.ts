import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth/session'
import { updateStat, deleteStat } from '@/lib/db/queries/stats'

function unauthorized() { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) return unauthorized()
  const { id } = await params
  const body = await req.json()
  const updateData: Record<string, unknown> = {}
  if (body.label !== undefined) updateData.label = body.label
  if (body.value !== undefined) updateData.value = body.value
  if (body.icon !== undefined) updateData.icon = body.icon || null
  if (body.sort_order !== undefined) updateData.sort_order = body.sort_order
  try {
    const data = await updateStat(id, updateData)
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(data)
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }) }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) return unauthorized()
  const { id } = await params
  await deleteStat(id)
  return NextResponse.json({ success: true })
}
