import { NextResponse } from 'next/server'

// Catch-all 404 for unknown public pages
export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: 'var(--color-pale-blue)' }}
    >
      <div className="text-center">
        <div
          className="heading-display text-[10rem] leading-none opacity-10 mb-4"
          style={{ color: 'var(--color-navy)' }}
        >
          404
        </div>
        <h1
          className="heading-section text-3xl mb-4"
          style={{ color: 'var(--color-navy)' }}
        >
          Page Not Found
        </h1>
        <p className="opacity-50 mb-8 text-sm" style={{ color: 'var(--color-navy)' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <a href="/" className="btn-primary">
          Go Home
        </a>
      </div>
    </div>
  )
}
