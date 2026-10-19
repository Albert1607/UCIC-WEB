import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

// ─── Public user session ──────────────────────────────────────────────────────

const SESSION_COOKIE = 'ucic_session'
const SESSION_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'ucic-fallback-secret-change-in-production-32ch'
)

export interface SessionPayload {
  userId: string
  email: string
  fullName: string | null
}

export async function createSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(SESSION_SECRET)
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SESSION_SECRET)
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      fullName: (payload.fullName as string) ?? null,
    }
  } catch {
    return null
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null
  return verifySession(token)
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
}

export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE

// ─── Admin session ────────────────────────────────────────────────────────────

const ADMIN_COOKIE = 'ucic_admin_session'
const ADMIN_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'ucic-fallback-secret-change-in-production-32ch'
)

export async function createAdminSession(): Promise<string> {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('12h')
    .sign(ADMIN_SECRET)
}

export async function verifyAdminSession(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, ADMIN_SECRET)
    return payload.role === 'admin'
  } catch {
    return false
  }
}

export async function getAdminSession(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_COOKIE)?.value
  if (!token) return false
  return verifyAdminSession(token)
}

export async function setAdminSessionCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12, // 12 hours
  })
}

export const ADMIN_COOKIE_NAME = ADMIN_COOKIE
