import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth/session'
import { getAlbumItemsByExperience, addAlbumItem, deleteAlbumItem } from '@/lib/db/queries/experiences'
import { createAdminClient } from '@/lib/supabase/admin'

function unauthorized() { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

export async function GET(_req: NextRequest, { params }: { params: Promise<{ experienceId: string }> }) {
  if (!(await getAdminSession())) return unauthorized()
  const { experienceId } = await params
  const data = await getAlbumItemsByExperience(experienceId)
  return NextResponse.json(data)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ experienceId: string }> }) {
  if (!(await getAdminSession())) return unauthorized()
  const { experienceId } = await params
  const body = await req.json()
  const { image_url, caption, sort_order } = body
  if (!image_url) return NextResponse.json({ error: 'image_url is required' }, { status: 400 })
  try {
    const data = await addAlbumItem({ experience_id: experienceId, image_url, caption: caption ?? null, sort_order })
    return NextResponse.json(data, { status: 201 })
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }) }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ experienceId: string }> }) {
  if (!(await getAdminSession())) return unauthorized()
  const body = await req.json()
  const { id, storage_path } = body
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })
  // Delete from storage if path provided
  if (storage_path) {
    const admin = createAdminClient()
    await admin.storage.from('experience-photos').remove([storage_path])
  }
  await deleteAlbumItem(id)
  return NextResponse.json({ success: true })
}
