import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  // Verify admin session
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { path, bucket = 'registration-files' } = body as { path: string; bucket?: string }

  if (!path) {
    return NextResponse.json({ error: 'Path is required' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin.storage
    .from(bucket)
    .createSignedUrl(path, 3600) // 1 hour

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ signedUrl: data.signedUrl })
}
