import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data, error } = await admin.from('hero_carousel_items').select('*').order('sort_order')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { media_url: string; media_type: 'image' | 'video'; sort_order?: number }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { media_url, media_type, sort_order } = body
  if (!media_url || !media_type) return NextResponse.json({ error: 'media_url and media_type required' }, { status: 400 })

  const admin = createAdminClient()
  let order = sort_order
  if (order === undefined) {
    const { data: maxData } = await admin.from('hero_carousel_items').select('sort_order').order('sort_order', { ascending: false }).limit(1).single()
    order = ((maxData?.sort_order as number) ?? -1) + 1
  }

  const { data, error } = await admin.from('hero_carousel_items').insert({ media_url, media_type, sort_order: order }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Bulk reorder: { ids: string[] }
  let body: { ids: string[] }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const admin = createAdminClient()
  await Promise.all(body.ids.map((id, idx) => admin.from('hero_carousel_items').update({ sort_order: idx }).eq('id', id)))
  return NextResponse.json({ ok: true })
}
