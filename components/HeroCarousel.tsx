'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import type { HeroCarouselItem } from '@/types'

interface Props {
  items: HeroCarouselItem[]
}

const IMAGE_DURATION = 6000 // ms

export default function HeroCarousel({ items }: Props) {
  const [current, setCurrent] = useState(0)
  const [fading, setFading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [videoDuration, setVideoDuration] = useState<number | null>(null)

  const count = items.length

  const goTo = (index: number) => {
    if (index === current) return
    setFading(true)
    setTimeout(() => {
      setCurrent(index)
      setFading(false)
      setVideoDuration(null)
    }, 600)
  }

  const next = () => goTo((current + 1) % count)

  // Schedule advance when on image slide or after video ends
  useEffect(() => {
    if (count === 0) return
    const item = items[current]
    if (timerRef.current) clearTimeout(timerRef.current)

    if (item.media_type === 'image') {
      timerRef.current = setTimeout(next, IMAGE_DURATION)
    } else {
      // video — wait for metadata to know duration, fallback 15s
      if (videoDuration !== null) {
        timerRef.current = setTimeout(next, videoDuration * 1000)
      }
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, count, videoDuration])

  if (count === 0) {
    return (
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg, var(--color-navy) 0%, var(--color-dusty-blue) 60%, var(--color-pale-blue) 100%)' }}
      />
    )
  }

  return (
    <div className="absolute inset-0">
      {items.map((item, idx) => (
        <div
          key={item.id}
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            opacity: idx === current ? (fading ? 0 : 1) : 0,
            transitionProperty: 'opacity',
          }}
          aria-hidden={idx !== current}
        >
          {item.media_type === 'video' ? (
            <video
              ref={idx === current ? videoRef : undefined}
              src={item.media_url}
              autoPlay
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              onLoadedMetadata={(e) => {
                if (idx === current) setVideoDuration((e.target as HTMLVideoElement).duration)
              }}
              onEnded={() => {
                if (idx === current) next()
              }}
            />
          ) : (
            <Image
              src={item.media_url}
              alt={`Hero slide ${idx + 1}`}
              fill
              className="img-cover"
              priority={idx === 0}
              sizes="100vw"
            />
          )}
        </div>
      ))}

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(20,35,52,0.70) 0%, rgba(20,35,52,0.18) 32%, rgba(20,35,52,0.50) 65%, rgba(20,35,52,0.92) 100%)',
        }}
      />

      {/* Dots */}
      {count > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className="transition-all duration-300"
              style={{
                width: idx === current ? 24 : 8,
                height: 8,
                background: idx === current ? 'var(--color-cream)' : 'rgba(253,248,217,0.4)',
                border: 'none',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
