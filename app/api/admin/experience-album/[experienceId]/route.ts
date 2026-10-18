import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET /api/admin/experience-album/[experienceId] - list album items
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ experienceId: string }> }
) {
  const { experienceId } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('experience_album_items')
    .select('*')
    .eq('experience_id', experienceId)
    .order('sort_order')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

// POST /api/admin/experience-album/[experienceId] - add album item
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ experienceId: string }> }
) {
  const { experienceId } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { image_url: string; caption?: string; sort_order?: number }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { image_url, caption, sort_order } = body
  if (!image_url) return NextResponse.json({ error: 'image_url required' }, { status: 400 })

  const admin = createAdminClient()
  let order = sort_order
  if (order === undefined) {
    const { data: maxData } = await admin
      .from('experience_album_items')
      .select('sort_order')
      .eq('experience_id', experienceId)
      .order('sort_order', { ascending: false })
      .limit(1)
      .single()
    order = ((maxData?.sort_order as number) ?? -1) + 1
  }

  const { data, error } = await admin
    .from('experience_album_items')
    .insert({ experience_id: experienceId, image_url, caption: caption ?? null, sort_order: order })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

// DELETE /api/admin/experience-album/[experienceId] with body { itemId }
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ experienceId: string }> }
) {
  await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { itemId: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const admin = createAdminClient()
  const { error } = await admin.from('experience_album_items').delete().eq('id', body.itemId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
