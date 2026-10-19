import { NextResponse, type NextRequest } from 'next/server'
import { verifySession, SESSION_COOKIE_NAME, verifyAdminSession, ADMIN_COOKIE_NAME } from '@/lib/auth/session'

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isAdminRoute = pathname.startsWith('/admin')
  const isAdminLoginPage = pathname === '/admin/login'

  // ─── Admin route protection (custom JWT cookie) ───────────────────────────
  if (isAdminRoute && !isAdminLoginPage) {
    const adminToken = request.cookies.get(ADMIN_COOKIE_NAME)?.value
    const isAdminAuthenticated = adminToken ? await verifyAdminSession(adminToken) : false

    if (!isAdminAuthenticated) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }
  }

  // Redirect authenticated admin away from login page
  if (isAdminLoginPage) {
    const adminToken = request.cookies.get(ADMIN_COOKIE_NAME)?.value
    const isAdminAuthenticated = adminToken ? await verifyAdminSession(adminToken) : false
    if (isAdminAuthenticated) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin'
      return NextResponse.redirect(url)
    }
  }

  // ─── Public user route protection (custom JWT session cookie) ─────────────
  const isPublicUserProtectedRoute =
    pathname === '/my-submissions' ||
    /^\/events\/[^/]+\/submit$/.test(pathname)

  if (isPublicUserProtectedRoute) {
    const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value
    const session = sessionToken ? await verifySession(sessionToken) : null

    if (!session) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next({ request })
}
