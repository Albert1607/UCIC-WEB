'use client'

import { useEffect, useState } from 'react'
import type { NewsItem } from '@/types'

interface Props {
  items: NewsItem[]
  perView?: number
}

function getEmbedUrl(raw: string): string {
  try {
    const url = new URL(raw)
    // YouTube watch → embed
    if (url.hostname.includes('youtube.com') && url.pathname === '/watch') {
      const v = url.searchParams.get('v')
      if (v) return `https://www.youtube.com/embed/${v}`
    }
    // YouTube short URL
    if (url.hostname === 'youtu.be') {
      const v = url.pathname.slice(1)
      if (v) return `https://www.youtube.com/embed/${v}`
    }
    // Instagram reels / post — just embed via blockquote approach not possible in iframe,
    // so we open in a new tab, but show thumbnail
    // For now return as-is for other embeds
    return raw
  } catch {
    return raw
  }
}

function getThumbnail(raw: string, customThumb?: string | null): string | null {
  if (customThumb) return customThumb
  try {
    const url = new URL(raw)
    if (url.hostname.includes('youtube.com') && url.pathname === '/watch') {
      const v = url.searchParams.get('v')
      if (v) return `https://img.youtube.com/vi/${v}/hqdefault.jpg`
    }
    if (url.hostname === 'youtu.be') {
      const v = url.pathname.slice(1)
      if (v) return `https://img.youtube.com/vi/${v}/hqdefault.jpg`
    }
  } catch {
    // ignore
  }
  return null
}

function NewsCard({ item }: { item: NewsItem }) {
  const [playing, setPlaying] = useState(false)
  const [fetchedThumb, setFetchedThumb] = useState<string | null>(null)
  const embedUrl = getEmbedUrl(item.embed_url)
  const isYoutube = embedUrl.includes('youtube.com/embed/')

  // Auto-fetch thumbnail for Instagram / other non-YouTube links
  useEffect(() => {
    if (item.thumbnail_url || isYoutube) return
    let cancelled = false
    fetch(`/api/public/og-thumbnail?url=${encodeURIComponent(item.embed_url)}`)
      .then(r => r.json())
      .then(d => { if (!cancelled && d.thumbnail) setFetchedThumb(d.thumbnail) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [item.embed_url, item.thumbnail_url, isYoutube])

  const thumbnail = item.thumbnail_url
    ?? (isYoutube ? getThumbnail(item.embed_url) : null)
    ?? fetchedThumb

  return (
    <div
      className="card-cream flex flex-col overflow-hidden shrink-0"
      style={{ width: '100%' }}
    >
      {/* Media area */}
      <div className="relative bg-[var(--color-navy)]" style={{ aspectRatio: '16/9' }}>
        {playing && isYoutube ? (
          <iframe
            src={`${embedUrl}?autoplay=1`}
            title={item.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
            style={{ border: 'none' }}
          />
        ) : thumbnail ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbnail}
              alt={item.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              {isYoutube ? (
                <button
                  onClick={() => setPlaying(true)}
                  className="w-14 h-14 flex items-center justify-center bg-[var(--color-cream)] hover:scale-105 transition-transform shadow-lg"
                  aria-label="Play"
                >
                  <svg viewBox="0 0 24 24" fill="var(--color-navy)" className="w-6 h-6 ml-1">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              ) : (
                <a
                  href={item.embed_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-14 h-14 flex items-center justify-center bg-[var(--color-cream)] hover:scale-105 transition-transform shadow-lg"
                  aria-label="Open link"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-navy)" strokeWidth="2" className="w-6 h-6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                  </svg>
                </a>
              )}
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <a
              href={item.embed_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 text-[var(--color-cream)] opacity-80 hover:opacity-100 transition-opacity"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-xs font-semibold">Open Link</span>
            </a>
          </div>
        )}
      </div>

      {/* Title */}
      <div className="p-4">
        <p className="font-semibold text-sm text-[var(--color-navy)] line-clamp-2">
          {item.title}
        </p>
      </div>
    </div>
  )
}

export default function NewsCarousel({ items, perView = 3 }: Props) {
  const [page, setPage] = useState(0)

  if (items.length === 0) return null

  const totalPages = Math.ceil(items.length / perView)
  const startIdx = page * perView
  const visible = items.slice(startIdx, startIdx + perView)

  // Pad to perView for consistent grid
  const padded = [...visible]
  while (padded.length < perView) padded.push(null as unknown as NewsItem)

  return (
    <div className="relative">
      {/* Grid */}
      <div
        className="grid gap-5"
        style={{ gridTemplateColumns: `repeat(${perView}, 1fr)` }}
      >
        {padded.map((item, idx) =>
          item ? (
            <NewsCard key={item.id} item={item} />
          ) : (
            <div key={`pad-${idx}`} className="invisible" />
          )
        )}
      </div>

      {/* Navigation */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="w-10 h-10 flex items-center justify-center border border-[var(--color-navy)] text-[var(--color-navy)] disabled:opacity-30 hover:bg-[var(--color-navy)] hover:text-[var(--color-cream)] transition-colors"
            aria-label="Previous page"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
            </svg>
          </button>
          <div className="flex gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                aria-label={`Page ${i + 1}`}
                style={{
                  width: i === page ? 24 : 8,
                  height: 8,
                  background: i === page ? 'var(--color-navy)' : 'rgba(47,71,95,0.25)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'width 0.3s',
                }}
              />
            ))}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="w-10 h-10 flex items-center justify-center border border-[var(--color-navy)] text-[var(--color-navy)] disabled:opacity-30 hover:bg-[var(--color-navy)] hover:text-[var(--color-cream)] transition-colors"
            aria-label="Next page"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
