import { NextRequest, NextResponse } from 'next/server'
import { createAdminSession, setAdminSessionCookie } from '@/lib/auth/session'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminEmail || !adminPassword) {
      console.error('ADMIN_EMAIL or ADMIN_PASSWORD env vars not set')
      return NextResponse.json({ error: 'Admin credentials not configured.' }, { status: 500 })
    }

    if (email !== adminEmail || password !== adminPassword) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
    }

    const token = await createAdminSession()
    await setAdminSessionCookie(token)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Admin login error:', err)
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
