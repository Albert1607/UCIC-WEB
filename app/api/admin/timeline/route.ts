import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth/session'
import { getAllTimeline, createTimelineItem } from '@/lib/db/queries/timeline'

function unauthorized() { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

export async function GET() {
  if (!(await getAdminSession())) return unauthorized()
  const data = await getAllTimeline()
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  if (!(await getAdminSession())) return unauthorized()
  let body: { year: string; title: string; description?: string; sort_order?: number; image_urls?: string[] }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }) }
  if (!body.year || !body.title) return NextResponse.json({ error: 'year and title are required' }, { status: 400 })
  try {
    const data = await createTimelineItem({ year: body.year, title: body.title, description: body.description ?? null, sort_order: body.sort_order, image_urls: body.image_urls ?? [] })
    return NextResponse.json(data, { status: 201 })
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }) }
}
