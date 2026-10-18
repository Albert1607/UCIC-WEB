'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Props {
  next?: string
}

export default function SignupClient({ next }: Props) {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    setError(null)

    const supabase = createClient()
    const origin = typeof window !== 'undefined'
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_SITE_URL || 'https://ucic-psi.vercel.app')
    const redirectTo = `${origin}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ''}`

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          student_id: studentId.trim() || null,
        },
        emailRedirectTo: redirectTo,
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Insert user profile (if session exists — i.e. email confirm disabled)
    if (data.user && data.session) {
      await supabase.from('user_profiles').upsert({
        id: data.user.id,
        full_name: fullName,
        student_id: studentId.trim() || null,
      })
      router.push(next || '/my-submissions')
      router.refresh()
      return
    }

    // Email confirmation required — store profile data temporarily in localStorage
    if (data.user && !data.session) {
      localStorage.setItem('pending_profile', JSON.stringify({
        id: data.user.id,
        full_name: fullName,
        student_id: studentId.trim() || null,
      }))
    }

    // Show email check prompt
    setLoading(false)
    setEmailSent(true)
  }

  // Email verification sent screen
  if (emailSent) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4 py-12"
        style={{ background: 'var(--color-pale-blue)' }}
      >
        <div className="w-full max-w-md">
          <div className="card-cream p-8 rounded-2xl text-center space-y-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
              style={{ background: 'rgba(156,182,215,0.2)' }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-navy)' }}>
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M2 7l10 7 10-7" />
              </svg>
            </div>
            <h1 className="heading-display text-3xl" style={{ color: 'var(--color-navy)' }}>
              Check your email
            </h1>
            <p className="text-sm opacity-70 leading-relaxed" style={{ color: 'var(--color-navy)' }}>
              We sent a verification link to <strong>{email}</strong>.<br />
              Click the link in the email to activate your account.
            </p>
            <p className="text-xs opacity-50" style={{ color: 'var(--color-navy)' }}>
              Didn&apos;t receive it? Check your spam folder or{' '}
              <button
                type="button"
                onClick={() => setEmailSent(false)}
                className="underline font-medium"
              >
                try again
              </button>
              .
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'var(--color-pale-blue)' }}
    >
      <div className="w-full max-w-md">
        <div className="card-cream p-8 rounded-2xl">
          {/* Logo / header */}
          <div className="text-center mb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-black.png" alt="UCIC" className="w-12 h-auto mx-auto mb-4 opacity-80" />
            <h1 className="heading-display text-3xl" style={{ color: 'var(--color-navy)' }}>
              Create Account
            </h1>
            <p className="text-sm opacity-60 mt-2" style={{ color: 'var(--color-navy)' }}>
              Join UCIC to register for events &amp; submit your work
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label" htmlFor="fullName">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label" htmlFor="studentId">
                Student ID{' '}
                <span className="opacity-50 font-normal text-xs">(optional)</span>
              </label>
              <input
                id="studentId"
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g. 123456789"
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label" htmlFor="email">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label" htmlFor="password">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label" htmlFor="confirm">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                id="confirm"
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat your password"
                className="form-input"
              />
            </div>

            {error && (
              <div
                className="rounded-xl p-3 text-sm"
                style={{ background: 'rgba(220,80,80,0.08)', color: '#8b2424', border: '1px solid rgba(220,80,80,0.2)' }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center disabled:opacity-60 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Creating account…
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--color-navy)' }}>
            Already have an account?{' '}
            <Link
              href={`/login${next ? `?next=${encodeURIComponent(next)}` : ''}`}
              className="font-semibold underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
