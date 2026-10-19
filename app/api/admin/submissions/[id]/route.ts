import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth/session'
import { db } from '@/lib/db/client'
import { createAdminClient } from '@/lib/supabase/admin'

interface RouteParams {
  params: Promise<{ id: string }>
}

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    if (!(await getAdminSession())) return unauthorized()
    const { id } = await params

    // Get the submission to find any file paths
    const rows = await db`SELECT answers FROM event_submissions WHERE id = ${id} LIMIT 1`
    const submission = rows[0]

    // Delete any uploaded files from storage if Supabase storage is configured
    if (submission?.answers && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const paths = Object.values(submission.answers as Record<string, string>).filter(
          v => typeof v === 'string' && v.includes('/')
        )
        if (paths.length > 0) {
          const admin = createAdminClient()
          await admin.storage.from('submission-files').remove(paths)
        }
      } catch (err) {
        console.warn('Storage cleanup failed or skipped:', err)
      }
    }

    await db`DELETE FROM event_submissions WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  // Generate a signed URL for a file path stored in submission answers
  try {
    if (!(await getAdminSession())) return unauthorized()
    const { id } = await params

    const body = await req.json()
    const { path } = body as { path: string }
    if (!path) return NextResponse.json({ error: 'path is required' }, { status: 400 })

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      // If local storage / non-supabase, return direct path
      return NextResponse.json({ signedUrl: path })
    }

    const admin = createAdminClient()
    const { data, error } = await admin.storage
      .from('submission-files')
      .createSignedUrl(path, 3600) // 1 hour

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ signedUrl: data.signedUrl })
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
