'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { HeroCarouselItem } from '@/types'
import { createClient } from '@/lib/supabase/client'

interface Props {
  initialItems: HeroCarouselItem[]
}

export default function HeroCarouselManager({ initialItems }: Props) {
  const [items, setItems] = useState<HeroCarouselItem[]>(initialItems)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const showMsg = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 4000)
  }

  const handleUpload = async (file: File) => {
    setUploading(true)
    try {
      const supabase = createClient()
      const isVideo = file.type.startsWith('video/')
      const ext = file.name.split('.').pop()
      const path = `${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('hero-carousel').upload(path, file, { upsert: true })
      if (upErr) throw upErr
      const { data } = supabase.storage.from('hero-carousel').getPublicUrl(path)

      const res = await fetch('/api/admin/hero-carousel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ media_url: data.publicUrl, media_type: isVideo ? 'video' : 'image' }),
      })
      if (!res.ok) throw new Error('Failed to save')
      const saved: HeroCarouselItem = await res.json()
      setItems((prev) => [...prev, saved])
      showMsg('Media added to carousel!', 'success')
      if (fileRef.current) fileRef.current.value = ''
    } catch (err) {
      showMsg(err instanceof Error ? err.message : 'Upload failed', 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/admin/hero-carousel/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setItems((prev) => prev.filter((i) => i.id !== id))
      showMsg('Removed from carousel.', 'success')
    }
  }

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= items.length) return
    const reordered = [...items]
    const temp = reordered[index]
    reordered[index] = reordered[newIndex]
    reordered[newIndex] = temp
    setItems(reordered)
    await fetch('/api/admin/hero-carousel', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: reordered.map((i) => i.id) }),
    })
  }

  return (
    <div className="space-y-6">
      {/* Upload */}
      <div className="card-cream p-6 rounded-2xl">
        <h3 className="font-semibold text-[var(--color-navy)] mb-3">Add Media to Carousel</h3>
        <p className="text-sm opacity-60 text-[var(--color-navy)] mb-4">
          Upload images (JPG, PNG, WebP) or videos (MP4, WebM). Images show for 6 seconds; videos play their full duration. Items dissolve between each other.
        </p>
        <label className="btn-primary !py-2.5 !px-5 cursor-pointer inline-flex">
          {uploading ? 'Uploading…' : '+ Upload Image / Video'}
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleUpload(file)
            }}
          />
        </label>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-xl text-sm font-semibold ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' : 'bg-red-50 text-red-800 border border-red-300'
        }`}>
          {message.text}
        </div>
      )}

      {/* Items grid */}
      {items.length === 0 ? (
        <div className="card-cream p-12 text-center rounded-2xl">
          <p className="opacity-40 italic text-sm text-[var(--color-navy)]">
            No carousel items yet. Upload images or videos above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, idx) => (
            <div key={item.id} className="card-cream overflow-hidden">
              {/* Preview */}
              <div className="relative bg-[var(--color-navy)]" style={{ aspectRatio: '16/9' }}>
                {item.media_type === 'video' ? (
                  <video src={item.media_url} muted className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <Image src={item.media_url} alt={`Slide ${idx + 1}`} fill className="object-cover" sizes="400px" />
                )}
                {/* Type badge */}
                <div className="absolute top-2 left-2">
                  <span className={`pill text-[10px] ${item.media_type === 'video' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {item.media_type === 'video' ? '▶ Video' : '🖼 Image'}
                  </span>
                </div>
              </div>
              <div className="p-3 flex items-center justify-between">
                <span className="text-xs opacity-50 text-[var(--color-navy)]">
                  {idx === 0 ? 'First slide' : `Slide ${idx + 1}`}
                </span>
                <div className="flex items-center gap-1">
                  <button disabled={idx === 0} onClick={() => handleMove(idx, 'up')} className="p-1 text-xs text-[var(--color-navy)] disabled:opacity-20 hover:bg-[var(--color-pale-blue)]">▲</button>
                  <button disabled={idx === items.length - 1} onClick={() => handleMove(idx, 'down')} className="p-1 text-xs text-[var(--color-navy)] disabled:opacity-20 hover:bg-[var(--color-pale-blue)]">▼</button>
                  <button onClick={() => handleDelete(item.id)} className="px-2 py-0.5 text-xs font-semibold text-[#8b2424] bg-red-100 hover:bg-red-200">Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
