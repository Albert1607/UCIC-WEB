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
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Insert user profile
    if (data.user) {
      await supabase.from('user_profiles').upsert({
        id: data.user.id,
        full_name: fullName,
        student_id: studentId.trim() || null,
      })
    }

    router.push(next || '/my-submissions')
    router.refresh()
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'var(--color-pale-blue)' }}
    >
      <div className="w-full max-w-md">
        <div className="card-cream p-8 rounded-2xl">
          <div className="text-center mb-8">
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

            {error && <p className="form-error text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center disabled:opacity-60"
            >
              {loading ? 'Creating account…' : 'Create Account'}
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
