import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth/session'
import { updateNewsItem, deleteNewsItem } from '@/lib/db/queries/news'

function unauthorized() { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) return unauthorized()
  const { id } = await params
  const body = await req.json()
  const updateData: Record<string, unknown> = {}
  if (body.title !== undefined) updateData.title = body.title
  if (body.embed_url !== undefined) updateData.embed_url = body.embed_url
  if (body.thumbnail_url !== undefined) updateData.thumbnail_url = body.thumbnail_url || null
  if (body.sort_order !== undefined) updateData.sort_order = body.sort_order
  try {
    const data = await updateNewsItem(id, updateData)
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(data)
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }) }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) return unauthorized()
  const { id } = await params
  await deleteNewsItem(id)
  return NextResponse.json({ success: true })
}
