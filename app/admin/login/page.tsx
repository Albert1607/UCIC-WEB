'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
    } else {
      router.push('/admin')
      router.refresh()
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'var(--color-pale-blue)' }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div
            className="heading-display text-5xl mb-2"
            style={{ color: 'var(--color-navy)' }}
          >
            UCIC
          </div>
          <div
            className="text-sm opacity-50"
            style={{ color: 'var(--color-navy)', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}
          >
            Admin Dashboard
          </div>
        </div>

        <div className="card-cream p-8">
          <h1
            className="heading-section text-2xl mb-6 text-center"
            style={{ color: 'var(--color-navy)' }}
          >
            Sign In
          </h1>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="form-label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div
                className="rounded-xl p-3 text-sm"
                style={{
                  background: 'rgba(220,80,80,0.08)',
                  color: '#8b2424',
                  border: '1px solid rgba(220,80,80,0.2)',
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center mt-2"
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs opacity-30 mt-6" style={{ color: 'var(--color-navy)' }}>
          UCIC Admin · Restricted access
        </p>
      </div>
    </div>
  )
}
