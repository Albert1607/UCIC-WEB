import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — getUser() validates the JWT with Supabase's server
  // (never trust cookies alone; this is the recommended pattern from @supabase/ssr)
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  // Treat any auth error as "not logged in" to avoid stale-cookie loops
  const isAuthenticated = !!user && !userError

  const pathname = request.nextUrl.pathname
  const isAdminRoute = pathname.startsWith('/admin')
  const isLoginPage = pathname === '/admin/login'

  // Unauthenticated user visiting a protected /admin page → send to login
  if (isAdminRoute && !isLoginPage && !isAuthenticated) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    // Prevent redirect loops — if we're already going to login, just pass through
    if (url.pathname === pathname) return supabaseResponse
    return NextResponse.redirect(url)
  }

  // Authenticated user on the login page → send to dashboard
  // Only redirect if we're confident the session is valid (isAuthenticated)
  if (isLoginPage && isAuthenticated) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
