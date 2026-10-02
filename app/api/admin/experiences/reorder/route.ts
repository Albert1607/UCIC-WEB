import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { ids } = await req.json()
    if (!Array.isArray(ids)) {
      return NextResponse.json({ error: 'ids array is required' }, { status: 400 })
    }

    const admin = createAdminClient()
    await Promise.all(
      ids.map((id, index) =>
        admin.from('experiences').update({ sort_order: index }).eq('id', id)
      )
    )

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
