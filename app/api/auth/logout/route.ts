import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  await supabase.auth.signOut()

  // Determine the base origin (e.g. https://ucic-psi.vercel.app or http://localhost:3000)
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https'
  const origin = request.headers.get('origin') ?? request.headers.get('referer')

  let baseUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (!baseUrl) {
    if (forwardedHost) {
      baseUrl = `${forwardedProto}://${forwardedHost}`
    } else if (origin) {
      baseUrl = origin
    } else {
      baseUrl = request.nextUrl.origin
    }
  }

  return NextResponse.redirect(new URL('/', baseUrl))
}
