import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()

    // Get the submission to find any file paths
    const { data: submission } = await admin
      .from('event_submissions')
      .select('answers')
      .eq('id', id)
      .single()

    // Delete any uploaded files from storage
    if (submission?.answers) {
      const paths = Object.values(submission.answers as Record<string, string>).filter(
        v => typeof v === 'string' && v.includes('/')
      )
      if (paths.length > 0) {
        await admin.storage.from('submission-files').remove(paths)
      }
    }

    const { error } = await admin.from('event_submissions').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  // Generate a signed URL for a file path stored in submission answers
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { path } = body as { path: string }
    if (!path) return NextResponse.json({ error: 'path is required' }, { status: 400 })

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
