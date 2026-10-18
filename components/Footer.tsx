import Link from 'next/link'
import Image from 'next/image'
import { ContentMap } from '@/types'

interface FooterProps {
  content: ContentMap
}

export default function Footer({ content }: FooterProps) {
  const email = content['contact_email'] || 'ucic@ciputra.ac.id'
  const instagram = content['contact_instagram']
  const line = content['contact_line']

  return (
    <footer
      className="mt-24"
      style={{ background: 'var(--color-navy)', color: 'var(--color-pale-blue)' }}
    >
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="relative w-10 h-10 flex-shrink-0">
                <Image
                  src="/logo-white.png"
                  alt="UCIC Logo"
                  fill
                  sizes="40px"
                  className="object-contain"
                />
              </div>
              <div
                className="text-base sm:text-lg font-bold tracking-tight leading-tight"
                style={{ color: 'var(--color-cream)' }}
              >
                Universitas Ciputra<br />International Community
              </div>
            </div>
            {content['footer_tagline'] &&
              content['footer_tagline'] !== 'Universitas Ciputra International Community' && (
                <p className="text-sm opacity-70 max-w-xs leading-relaxed">
                  {content['footer_tagline']}
                </p>
              )}
            <p className="text-sm opacity-50 mt-2">
              {content['footer_description'] || 'Connecting UC students with the world.'}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3
              className="text-xs font-semibold uppercase tracking-widest mb-4 opacity-50"
            >
              Navigation
            </h3>
            <ul className="space-y-2">
              {[
                { href: '/', label: content['nav_home'] || 'Home' },
                { href: '/about', label: content['nav_about'] || 'About Us' },
                { href: '/events', label: content['nav_events'] || 'Events' },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm opacity-70 hover:opacity-100 transition-opacity"
                    style={{ color: 'var(--color-pale-blue)' }}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3
              className="text-xs font-semibold uppercase tracking-widest mb-4 opacity-50"
            >
              Contact
            </h3>
            <ul className="space-y-3">
              {email && (
                <li>
                  <a
                    href={`mailto:${email}`}
                    className="flex items-center gap-2 text-sm opacity-70 hover:opacity-100 transition-opacity"
                    style={{ color: 'var(--color-pale-blue)' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 shrink-0">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="M2 7l10 7 10-7" />
                    </svg>
                    {email}
                  </a>
                </li>
              )}
              {instagram && (
                <li>
                  <a
                    href={`https://instagram.com/${instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm opacity-70 hover:opacity-100 transition-opacity"
                    style={{ color: 'var(--color-pale-blue)' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 shrink-0">
                      <rect x="2" y="2" width="20" height="20" rx="5" />
                      <circle cx="12" cy="12" r="5" />
                      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                    </svg>
                    {instagram}
                  </a>
                </li>
              )}
              {line && (
                <li>
                  <span className="text-sm opacity-70" style={{ color: 'var(--color-pale-blue)' }}>
                    LINE: {line}
                  </span>
                </li>
              )}
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs opacity-40"
          style={{ borderTop: '1px solid rgba(156,182,215,0.15)' }}
        >
          <span>
            &copy; {new Date().getFullYear()} Universitas Ciputra International Community
          </span>
          <span>Built with ❤️ by UCIC</span>
        </div>
      </div>
    </footer>
  )
}
