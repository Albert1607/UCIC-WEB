import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getUserByEmail, createUser } from '@/lib/db/queries/users'
import { createSession, setSessionCookie } from '@/lib/auth/session'

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, studentId } = await request.json()

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: 'Email, password, and full name are required.' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 })
    }

    const cleanEmail = email.toLowerCase().trim()

    // Check if email already exists
    const existing = await getUserByEmail(cleanEmail)
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Insert new user
    const newUser = await createUser({
      email: cleanEmail,
      password_hash: passwordHash,
      full_name: fullName.trim(),
      student_id: studentId?.trim() || null,
    })

    if (!newUser) {
      return NextResponse.json({ error: 'Failed to create account.' }, { status: 500 })
    }

    // Create session
    const token = await createSession({
      userId: newUser.id,
      email: newUser.email,
      fullName: newUser.full_name,
    })
    await setSessionCookie(token)

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    console.error('Signup error:', err)
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
