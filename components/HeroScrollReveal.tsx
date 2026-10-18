'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  children: React.ReactNode
}

/**
 * HeroScrollReveal — wraps hero text content.
 * On initial mount, only the background carousel is visible (content is hidden).
 * When the user scrolls down, the content fades + slides in.
 * When user scrolls back to top, it fades back out (content disappears again until scroll).
 */
export default function HeroScrollReveal({ children }: Props) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      // Trigger when user scrolls at least 40px
      setVisible(scrollY > 40)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  )
}
