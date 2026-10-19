import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE_NAME } from '@/lib/auth/session'

export async function POST(request: NextRequest) {
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

  const response = NextResponse.redirect(new URL('/', baseUrl))
  // Clear public user session cookie
  response.cookies.delete(SESSION_COOKIE_NAME)
  return response
}
