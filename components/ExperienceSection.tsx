'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import type { Experience, ExperienceAlbumItem } from '@/types'

interface ExperienceWithAlbum extends Experience {
  album?: ExperienceAlbumItem[]
}

interface Props {
  experiences: Experience[]
}

function AlbumModal({ exp, onClose }: { exp: ExperienceWithAlbum; onClose: () => void }) {
  const [album, setAlbum] = useState<ExperienceAlbumItem[]>(exp.album ?? [])
  const [loading, setLoading] = useState(!exp.album)
  const [lightbox, setLightbox] = useState<string | null>(null)

  useEffect(() => {
    if (exp.album) return
    setLoading(true)
    fetch(`/api/public/experience-album/${exp.id}`)
      .then((r) => r.json())
      .then((data) => setAlbum(data ?? []))
      .catch(() => setAlbum([]))
      .finally(() => setLoading(false))
  }, [exp.id, exp.album])

  // Trap scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-8 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="card-cream w-full max-w-4xl my-auto shadow-2xl overflow-hidden">
        {/* Banner */}
        {exp.banner_image_url && (
          <div className="relative w-full" style={{ height: 220 }}>
            <Image src={exp.banner_image_url} alt={exp.title} fill className="object-cover" sizes="900px" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(20,35,52,0.85) 100%)' }} />
            <div className="absolute bottom-0 left-0 p-6">
              <h2 className="heading-display text-4xl text-[var(--color-cream)]">{exp.title}</h2>
              {exp.year && <span className="pill pill-cream mt-2 inline-block">{exp.year}</span>}
            </div>
            <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center bg-black/40 text-white hover:bg-black/60 transition-colors" aria-label="Close">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
        )}

        <div className="p-6 sm:p-8">
          {/* No banner → show title here */}
          {!exp.banner_image_url && (
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="heading-display text-4xl text-[var(--color-navy)]">{exp.title}</h2>
                {exp.year && <span className="pill pill-dusty mt-2 inline-block">{exp.year}</span>}
              </div>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 shrink-0" aria-label="Close">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>
          )}

          {/* Description */}
          {exp.description && (
            <p className="text-base leading-relaxed opacity-70 mb-8" style={{ color: 'var(--color-navy)' }}>
              {exp.description}
            </p>
          )}

          {/* Album */}
          {loading ? (
            <p className="text-center opacity-50 italic py-8 text-sm" style={{ color: 'var(--color-navy)' }}>
              Loading photos…
            </p>
          ) : album.length > 0 ? (
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wider opacity-50 mb-4" style={{ color: 'var(--color-navy)' }}>
                Photo Album
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {album.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setLightbox(item.image_url)}
                    className="relative overflow-hidden group"
                    style={{ aspectRatio: '4/3' }}
                  >
                    <Image
                      src={item.image_url}
                      alt={item.caption ?? ''}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="300px"
                    />
                    {item.caption && (
                      <div className="absolute inset-x-0 bottom-0 bg-black/50 text-white text-xs p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.caption}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center opacity-40 italic py-4 text-sm" style={{ color: 'var(--color-navy)' }}>
              No photos for this event yet.
            </p>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/90"
          onClick={() => setLightbox(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox}
            alt="Full size"
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 text-white opacity-70 hover:opacity-100"
            aria-label="Close lightbox"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-8 h-8">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

function ExperienceCard({ exp, index }: { exp: Experience; index: number }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative group overflow-hidden rounded-2xl shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-navy)]"
        style={{ aspectRatio: '4/3' }}
      >
        {/* Background image */}
        {exp.banner_image_url ? (
          <Image
            src={exp.banner_image_url}
            alt={exp.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="400px"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'var(--color-navy)' }}
          >
            <span className="heading-display text-7xl opacity-15 text-[var(--color-cream)]">
              {String(index + 1).padStart(2, '0')}
            </span>
          </div>
        )}

        {/* Gradient overlay — always visible at bottom */}
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(to top, rgba(20,35,52,0.85) 0%, rgba(20,35,52,0.2) 50%, transparent 100%)',
          }}
        />

        {/* Text */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
          {exp.year && (
            <span
              className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded mb-2"
              style={{ background: 'rgba(253,248,217,0.85)', color: 'var(--color-navy)' }}
            >
              {exp.year}
            </span>
          )}
          <h3 className="font-bold text-base leading-tight" style={{ color: 'var(--color-cream)' }}>
            {exp.title}
          </h3>
          {exp.description && (
            <p
              className="text-xs mt-1 line-clamp-2 opacity-0 group-hover:opacity-80 transition-opacity duration-300 leading-relaxed"
              style={{ color: 'var(--color-cream)' }}
            >
              {exp.description}
            </p>
          )}
          <span
            className="inline-flex items-center gap-1 text-xs mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-semibold"
            style={{ color: 'rgba(253,248,217,0.9)' }}
          >
            View Photos
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
              <path d="M3 5a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
              <path d="M8.5 3.5a.5.5 0 00-1 0V5H6a.5.5 0 000 1h1.5v1.5a.5.5 0 001 0V6H10a.5.5 0 000-1H8.5V3.5z" />
            </svg>
          </span>
        </div>
      </button>

      {open && <AlbumModal exp={exp} onClose={() => setOpen(false)} />}
    </>
  )
}

export default function ExperienceSection({ experiences }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {experiences.map((exp, i) => (
        <ExperienceCard key={exp.id} exp={exp} index={i} />
      ))}
    </div>
  )
}
