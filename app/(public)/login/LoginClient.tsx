'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Props {
  next?: string
}

export default function LoginClient({ next }: Props) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Login failed.')
      setLoading(false)
      return
    }

    router.push(next || '/my-submissions')
    router.refresh()
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--color-pale-blue)' }}
    >
      <div className="w-full max-w-md">
        <div className="card-cream p-8 rounded-2xl">
          <div className="text-center mb-8">
            <h1 className="heading-display text-3xl" style={{ color: 'var(--color-navy)' }}>
              Welcome Back
            </h1>
            <p className="text-sm opacity-60 mt-2" style={{ color: 'var(--color-navy)' }}>
              Sign in to your UCIC account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label" htmlFor="email">
                Email
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
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input"
              />
            </div>

            {error && <p className="form-error text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--color-navy)' }}>
            Don&apos;t have an account?{' '}
            <Link
              href={`/signup${next ? `?next=${encodeURIComponent(next)}` : ''}`}
              className="font-semibold underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
