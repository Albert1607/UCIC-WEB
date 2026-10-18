import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/my-submissions'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const admin = createAdminClient()
      await admin.from('user_profiles').upsert(
        {
          id: data.user.id,
          full_name: data.user.user_metadata?.full_name ?? null,
          student_id: data.user.user_metadata?.student_id ?? null,
        },
        { onConflict: 'id' }
      )

      const forwardedHost = request.headers.get('x-forwarded-host')
      const forwardedProto = request.headers.get('x-forwarded-proto') || 'https'
      const baseOrigin = forwardedHost
        ? `${forwardedProto}://${forwardedHost}`
        : (process.env.NEXT_PUBLIC_SITE_URL || origin)

      const redirectUrl = next.startsWith('/') ? `${baseOrigin}${next}` : next
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Auth failed — redirect to login with error
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https'
  const baseOrigin = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : (process.env.NEXT_PUBLIC_SITE_URL || origin)

  return NextResponse.redirect(`${baseOrigin}/login?error=verification_failed`)
}
