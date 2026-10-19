import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth/session'
import { getAllNews, createNewsItem } from '@/lib/db/queries/news'

function unauthorized() { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

export async function GET() {
  if (!(await getAdminSession())) return unauthorized()
  const data = await getAllNews()
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  if (!(await getAdminSession())) return unauthorized()
  let body: { title: string; embed_url: string; thumbnail_url?: string; sort_order?: number }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  if (!body.title || !body.embed_url) return NextResponse.json({ error: 'title and embed_url are required' }, { status: 400 })
  try {
    const data = await createNewsItem({ title: body.title, embed_url: body.embed_url, thumbnail_url: body.thumbnail_url ?? null, sort_order: body.sort_order })
    return NextResponse.json(data, { status: 201 })
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }) }
}
