import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export async function POST(request: NextRequest) {
  if (!(await getAdminSession())) return unauthorized()

  const body = await request.json()
  const { path, bucket = 'registration-files' } = body as { path: string; bucket?: string }

  if (!path) {
    return NextResponse.json({ error: 'Path is required' }, { status: 400 })
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ signedUrl: path })
  }

  try {
    const admin = createAdminClient()
    const { data, error } = await admin.storage
      .from(bucket)
      .createSignedUrl(path, 3600) // 1 hour

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ signedUrl: data.signedUrl })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Storage error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
