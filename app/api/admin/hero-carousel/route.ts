import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth/session'
import { getAllCarouselItems, createCarouselItem, reorderCarouselItems } from '@/lib/db/queries/hero-carousel'

function unauthorized() { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

export async function GET() {
  if (!(await getAdminSession())) return unauthorized()
  const data = await getAllCarouselItems()
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  if (!(await getAdminSession())) return unauthorized()
  let body: { media_url: string; media_type: 'image' | 'video'; sort_order?: number }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  if (!body.media_url || !body.media_type) return NextResponse.json({ error: 'media_url and media_type required' }, { status: 400 })
  try {
    const data = await createCarouselItem({ media_url: body.media_url, media_type: body.media_type, sort_order: body.sort_order })
    return NextResponse.json(data, { status: 201 })
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }) }
}

export async function PATCH(req: NextRequest) {
  if (!(await getAdminSession())) return unauthorized()
  let body: { ids: string[] }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  await reorderCarouselItems(body.ids)
  return NextResponse.json({ ok: true })
}
