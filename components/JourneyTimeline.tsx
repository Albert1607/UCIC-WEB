'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import type { TimelineItem } from '@/types'

interface Props {
  items: TimelineItem[]
}

function ImageCarousel({ urls, year }: { urls: string[]; year: string }) {
  const [current, setCurrent] = useState(0)
  const [fading, setFading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Reset to first image when urls change (i.e. different timeline item selected)
  useEffect(() => {
    setCurrent(0)
    setFading(false)
  }, [urls])

  useEffect(() => {
    if (urls.length <= 1) return
    timerRef.current = setTimeout(() => {
      setFading(true)
      setTimeout(() => {
        setCurrent((c) => (c + 1) % urls.length)
        setFading(false)
      }, 500)
    }, 4000)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [current, urls.length])

  if (urls.length === 0) {
    return (
      <div
        className="absolute inset-0 flex items-end p-8"
        style={{ background: 'linear-gradient(135deg, var(--color-navy) 0%, var(--color-dusty-blue) 100%)' }}
      >
        <span
          className="heading-display select-none pointer-events-none"
          style={{ fontSize: 'clamp(80px, 14vw, 160px)', lineHeight: 1, color: 'rgba(156,182,215,0.18)' }}
        >
          {year}
        </span>
      </div>
    )
  }

  return (
    <div className="absolute inset-0">
      {urls.map((url, idx) => (
        <div
          key={idx}
          className="absolute inset-0 transition-opacity duration-500"
          style={{ opacity: idx === current ? (fading ? 0 : 1) : 0 }}
          aria-hidden={idx !== current}
        >
          <Image
            src={url}
            alt={`Timeline image ${idx + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={idx === 0}
          />
        </div>
      ))}

      {/* Dark overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(20,35,52,0.75) 100%)' }}
      />

      {/* Year watermark */}
      <div className="absolute bottom-0 left-0 p-6 pointer-events-none" style={{ zIndex: 5 }}>
        <span
          className="heading-display select-none"
          style={{ fontSize: 'clamp(60px, 10vw, 120px)', lineHeight: 1, color: 'rgba(253,248,217,0.15)' }}
        >
          {year}
        </span>
      </div>

      {/* Dot indicators */}
      {urls.length > 1 && (
        <div className="absolute bottom-4 right-4 flex gap-1.5 z-10">
          {urls.map((_, i) => (
            <button
              key={i}
              onClick={() => { setCurrent(i); setFading(false) }}
              aria-label={`Image ${i + 1}`}
              style={{
                width: i === current ? 18 : 6,
                height: 6,
                background: i === current ? 'var(--color-cream)' : 'rgba(253,248,217,0.45)',
                border: 'none',
                cursor: 'pointer',
                transition: 'width 0.3s',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function JourneyTimeline({ items }: Props) {
  const [current, setCurrent] = useState(0)
  const [sliding, setSliding] = useState<'in' | 'out' | null>(null)
  const pendingRef = useRef<number | null>(null)

  const goTo = (idx: number) => {
    if (idx === current) return
    setSliding('out')
    pendingRef.current = idx
    setTimeout(() => {
      setCurrent(idx)
      setSliding('in')
      setTimeout(() => setSliding(null), 350)
    }, 250)
  }

  const prev = () => goTo(Math.max(0, current - 1))
  const next = () => goTo(Math.min(items.length - 1, current + 1))

  const item = items[current]
  if (!item) return null

  const imageUrls: string[] = Array.isArray(item.image_urls) ? item.image_urls : []

  const contentStyle: React.CSSProperties = {
    opacity: sliding === 'out' ? 0 : 1,
    transform: sliding === 'out' ? 'translateY(10px)' : 'translateY(0)',
    transition: 'opacity 0.25s ease, transform 0.25s ease',
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-[500px]">
      {/* ── Left: Image panel ─────────────────────────────── */}
      <div
        className="relative shrink-0 overflow-hidden w-full h-72 lg:h-auto lg:w-[48%]"
        style={{ background: 'var(--color-navy)' }}
      >
        <ImageCarousel key={item.id} urls={imageUrls} year={item.year} />
      </div>

      {/* ── Right: Full card ─────────────────────────────── */}
      <div
        className="flex-1 flex flex-col justify-between"
        style={{ background: 'var(--color-cream)', padding: 'clamp(2rem, 5vw, 4rem)' }}
      >
        {/* Top: year + content */}
        <div style={contentStyle}>
          {/* Era / year label */}
          <div className="flex items-center gap-3 mb-6">
            <span
              className="pill pill-dusty"
              style={{ fontSize: '0.7rem', letterSpacing: '0.14em' }}
            >
              {item.year}
            </span>
            <span
              className="text-xs opacity-40 font-semibold uppercase tracking-widest"
              style={{ color: 'var(--color-navy)' }}
            >
              {current + 1} / {items.length}
            </span>
          </div>

          {/* Big year number */}
          <div
            className="heading-display mb-4 select-none"
            style={{
              fontSize: 'clamp(64px, 10vw, 112px)',
              lineHeight: 0.9,
              color: 'var(--color-navy)',
              opacity: 0.08,
              pointerEvents: 'none',
            }}
          >
            {item.year}
          </div>

          {/* Title */}
          <h3
            className="heading-display mb-4"
            style={{
              fontSize: 'clamp(26px, 4vw, 42px)',
              lineHeight: 1.1,
              color: 'var(--color-navy)',
              marginTop: '-0.5em',
            }}
          >
            {item.title}
          </h3>

          {/* Description */}
          {item.description && (
            <p
              className="leading-relaxed"
              style={{
                color: 'var(--color-navy)',
                opacity: 0.65,
                fontSize: '0.975rem',
                maxWidth: 480,
              }}
            >
              {item.description}
            </p>
          )}
        </div>

        {/* Bottom: navigation */}
        <div className="flex items-center gap-4 mt-10">
          {/* Prev */}
          <button
            onClick={prev}
            disabled={current === 0}
            aria-label="Previous"
            className="w-11 h-11 flex items-center justify-center border transition-colors disabled:opacity-25"
            style={{
              borderColor: 'var(--color-navy)',
              color: 'var(--color-navy)',
              background: 'transparent',
            }}
            onMouseEnter={(e) => { if (current > 0) { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-navy)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-cream)' } }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-navy)' }}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Dots */}
          <div className="flex gap-2 flex-1">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to ${items[i].year}`}
                title={items[i].year}
                style={{
                  height: 6,
                  width: i === current ? 28 : 8,
                  background: i === current ? 'var(--color-navy)' : 'rgba(47,71,95,0.2)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'width 0.3s, background 0.3s',
                  flexShrink: 0,
                }}
              />
            ))}
          </div>

          {/* Next */}
          <button
            onClick={next}
            disabled={current === items.length - 1}
            aria-label="Next"
            className="w-11 h-11 flex items-center justify-center border transition-colors disabled:opacity-25"
            style={{
              borderColor: 'var(--color-navy)',
              color: 'var(--color-navy)',
              background: 'transparent',
            }}
            onMouseEnter={(e) => { if (current < items.length - 1) { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-navy)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-cream)' } }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-navy)' }}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
