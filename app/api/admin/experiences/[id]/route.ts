import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth/session'
import { updateExperience, deleteExperience, deleteAlbumByExperience } from '@/lib/db/queries/experiences'

function unauthorized() { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) return unauthorized()
  const { id } = await params
  const body = await req.json()
  const updateData: Record<string, unknown> = {}
  if (body.title !== undefined) updateData.title = body.title
  if (body.description !== undefined) updateData.description = body.description || null
  if (body.year !== undefined) updateData.year = body.year || null
  if (body.sort_order !== undefined) updateData.sort_order = body.sort_order
  if (body.banner_image_url !== undefined) updateData.banner_image_url = body.banner_image_url || null
  try {
    const data = await updateExperience(id, updateData)
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(data)
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }) }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) return unauthorized()
  const { id } = await params
  await deleteAlbumByExperience(id)
  await deleteExperience(id)
  return NextResponse.json({ success: true })
}
