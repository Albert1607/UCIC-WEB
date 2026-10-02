'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { ContentMap } from '@/types'

interface NavbarProps {
  content: ContentMap
}

export default function Navbar({ content }: NavbarProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [isDarkBg, setIsDarkBg] = useState(pathname === '/')

  useEffect(() => {
    const updateContrast = () => {
      if (pathname === '/') {
        // On home page, the dark hero occupies the full viewport height.
        // Above the threshold, it is over the dark hero -> dark background (light text).
        // Below the threshold, it is over the light page -> light background (dark text).
        const threshold = window.innerHeight - 90
        setIsDarkBg(window.scrollY < threshold)
      } else {
        // All other pages (/events, /about, etc.) have a light background right from the top.
        setIsDarkBg(false)
      }
    }

    updateContrast()
    window.addEventListener('scroll', updateContrast, { passive: true })
    window.addEventListener('resize', updateContrast, { passive: true })
    return () => {
      window.removeEventListener('scroll', updateContrast)
      window.removeEventListener('resize', updateContrast)
    }
  }, [pathname])

  const links = [
    { href: '/', label: content['nav_home'] || 'Home' },
    { href: '/about', label: content['nav_about'] || 'About Us' },
    { href: '/events', label: content['nav_events'] || 'Events' },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      {/* Edge-to-edge Frosted Glass Bar — dynamically adapts contrast */}
      <div
        className="w-full px-6 py-4 flex items-center justify-between transition-all duration-300"
        style={{
          background: isDarkBg
            ? 'rgba(255, 255, 255, 0.10)'
            : 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: isDarkBg
            ? '1px solid rgba(255, 255, 255, 0.18)'
            : '1px solid rgba(156, 182, 215, 0.40)',
          boxShadow: isDarkBg
            ? '0 4px 20px rgba(0, 0, 0, 0.12)'
            : '0 4px 20px rgba(47, 71, 95, 0.08)',
        }}
      >
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-3 no-underline group">
          <span
            className="heading-display text-2xl tracking-wider transition-colors duration-300"
            style={{
              color: isDarkBg ? '#ffffff' : 'var(--color-navy)',
              lineHeight: 1,
              textShadow: isDarkBg ? '0 2px 10px rgba(0,0,0,0.5)' : 'none',
            }}
          >
            UCIC
          </span>
          <span
            className="hidden sm:block text-xs font-semibold transition-colors duration-300"
            style={{
              color: isDarkBg ? 'rgba(255,255,255,0.82)' : 'rgba(47, 71, 95, 0.75)',
              maxWidth: '150px',
              lineHeight: 1.25,
              textShadow: isDarkBg ? '0 1px 6px rgba(0,0,0,0.5)' : 'none',
            }}
          >
            Universitas Ciputra<br />International Community
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-4 py-2 text-sm font-medium transition-all duration-200"
              style={{
                color: isDarkBg ? 'rgba(255,255,255,0.92)' : 'var(--color-navy)',
                textShadow: isDarkBg ? '0 1px 6px rgba(0,0,0,0.4)' : 'none',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLElement).style.backgroundColor = isDarkBg
                  ? 'rgba(255,255,255,0.12)'
                  : 'rgba(156,182,215,0.22)'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
              }}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/events"
            className="btn-primary ml-3 !py-2.5 !px-6 text-sm font-semibold tracking-wide transition-all duration-300"
            style={{
              background: isDarkBg ? 'var(--color-cream)' : 'var(--color-navy)',
              color: isDarkBg ? 'var(--color-navy)' : 'var(--color-cream)',
              border: 'none',
              boxShadow: isDarkBg
                ? '0 2px 12px rgba(0,0,0,0.2)'
                : '0 2px 12px rgba(47,71,95,0.15)',
            }}
          >
            {content['hero_cta_label'] || 'Browse Events'}
          </Link>
        </nav>

        {/* Mobile Hamburger Toggle */}
        <button
          className="md:hidden p-2 transition-colors duration-300"
          style={{
            color: isDarkBg ? '#ffffff' : 'var(--color-navy)',
          }}
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div
          className="w-full px-6 py-4 flex flex-col gap-2 transition-all duration-300"
          style={{
            background: isDarkBg
              ? 'rgba(25, 42, 60, 0.96)'
              : 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            borderBottom: isDarkBg
              ? '1px solid rgba(255, 255, 255, 0.15)'
              : '1px solid rgba(156, 182, 215, 0.40)',
            boxShadow: '0 12px 32px rgba(47, 71, 95, 0.12)',
          }}
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3 py-2.5 text-base font-medium transition-all"
              style={{
                color: isDarkBg ? 'rgba(255,255,255,0.92)' : 'var(--color-navy)',
              }}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/events"
            className="btn-primary mt-2 text-sm text-center !py-3"
            style={{
              background: isDarkBg ? 'var(--color-cream)' : 'var(--color-navy)',
              color: isDarkBg ? 'var(--color-navy)' : 'var(--color-cream)',
            }}
            onClick={() => setOpen(false)}
          >
            {content['hero_cta_label'] || 'Browse Events'}
          </Link>
        </div>
      )}
    </header>
  )
}
