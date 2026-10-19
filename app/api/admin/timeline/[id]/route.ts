import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth/session'
import { updateTimelineItem, deleteTimelineItem } from '@/lib/db/queries/timeline'

function unauthorized() { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) return unauthorized()
  const { id } = await params
  const body = await req.json()
  const updateData: Record<string, unknown> = {}
  if (body.year !== undefined) updateData.year = body.year
  if (body.title !== undefined) updateData.title = body.title
  if (body.description !== undefined) updateData.description = body.description || null
  if (body.sort_order !== undefined) updateData.sort_order = body.sort_order
  if (body.image_urls !== undefined) updateData.image_urls = body.image_urls ?? []
  try {
    const data = await updateTimelineItem(id, updateData)
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(data)
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }) }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) return unauthorized()
  const { id } = await params
  await deleteTimelineItem(id)
  return NextResponse.json({ success: true })
}
