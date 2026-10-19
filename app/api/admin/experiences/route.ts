import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth/session'
import { getAllExperiences, createExperience } from '@/lib/db/queries/experiences'

function unauthorized() { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

export async function GET() {
  if (!(await getAdminSession())) return unauthorized()
  const data = await getAllExperiences()
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  if (!(await getAdminSession())) return unauthorized()
  let body: { title: string; description?: string; year?: string; sort_order?: number; banner_image_url?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  if (!body.title) return NextResponse.json({ error: 'title is required' }, { status: 400 })
  try {
    const data = await createExperience({ title: body.title, description: body.description ?? null, year: body.year ?? null, sort_order: body.sort_order, banner_image_url: body.banner_image_url ?? null })
    return NextResponse.json(data, { status: 201 })
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }) }
}
