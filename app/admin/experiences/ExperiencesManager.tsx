'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Experience, ExperienceAlbumItem } from '@/types'
import { createClient } from '@/lib/supabase/client'

interface Props {
  initialExperiences: Experience[]
}

// ── Album Manager Modal ──────────────────────────────────────

function AlbumManager({ exp, onClose }: { exp: Experience; onClose: () => void }) {
  const [items, setItems] = useState<ExperienceAlbumItem[]>([])
  const [loaded, setLoaded] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [caption, setCaption] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  // Load album on mount
  useState(() => {
    fetch(`/api/admin/experience-album/${exp.id}`)
      .then((r) => r.json())
      .then((data) => { setItems(data ?? []); setLoaded(true) })
      .catch(() => setLoaded(true))
  })

  const handleAddPhoto = async (file: File) => {
    setUploading(true)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `${exp.id}/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('experience-photos').upload(path, file, { upsert: true })
      if (upErr) throw upErr
      const { data: pub } = supabase.storage.from('experience-photos').getPublicUrl(path)
      const res = await fetch(`/api/admin/experience-album/${exp.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: pub.publicUrl, caption: caption || null }),
      })
      if (!res.ok) throw new Error('Failed to add photo')
      const added = await res.json()
      setItems((prev) => [...prev, added])
      setCaption('')
      if (fileRef.current) fileRef.current.value = ''
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error uploading')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (itemId: string) => {
    await fetch(`/api/admin/experience-album/${exp.id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId }),
    })
    setItems((prev) => prev.filter((i) => i.id !== itemId))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-8 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="card-cream w-full max-w-3xl my-auto shadow-2xl p-6 sm:p-8">
        <div className="flex items-center justify-between border-b border-[var(--color-dusty-blue)]/30 pb-4 mb-6">
          <div>
            <h3 className="heading-section text-2xl text-[var(--color-navy)]">Photo Album</h3>
            <p className="text-xs opacity-60 text-[var(--color-navy)] mt-0.5">{exp.title}</p>
          </div>
          <button onClick={onClose} className="opacity-60 hover:opacity-100 text-xl">✕</button>
        </div>

        {/* Upload */}
        <div className="mb-6 p-4 bg-[var(--color-pale-blue)] border border-[var(--color-dusty-blue)]/30">
          <p className="text-sm font-semibold text-[var(--color-navy)] mb-3">Add Photo</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              className="form-input flex-1"
              placeholder="Caption (optional)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
            <label className="btn-primary !py-2 !px-4 text-sm cursor-pointer shrink-0">
              {uploading ? 'Uploading…' : '+ Upload Photo'}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleAddPhoto(file)
                }}
              />
            </label>
          </div>
        </div>

        {/* Grid */}
        {!loaded ? (
          <p className="text-center italic opacity-50 text-sm py-8 text-[var(--color-navy)]">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-center italic opacity-40 text-sm py-8 text-[var(--color-navy)]">No photos yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {items.map((item) => (
              <div key={item.id} className="relative group overflow-hidden" style={{ aspectRatio: '4/3' }}>
                <Image src={item.image_url} alt={item.caption ?? ''} fill className="object-cover" sizes="300px" />
                {item.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-black/50 text-white text-xs p-1.5">
                    {item.caption}
                  </div>
                )}
                <button
                  onClick={() => handleDelete(item.id)}
                  className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
                  title="Delete photo"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main ExperiencesManager ─────────────────────────────────

export default function ExperiencesManager({ initialExperiences }: Props) {
  const router = useRouter()
  const [items, setItems] = useState<Experience[]>(initialExperiences)
  const [isEditing, setIsEditing] = useState(false)
  const [current, setCurrent] = useState<Partial<Experience>>({ title: '', description: '', year: '', banner_image_url: null })
  const [saving, setSaving] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [albumExp, setAlbumExp] = useState<Experience | null>(null)
  const [uploadingBanner, setUploadingBanner] = useState(false)

  const openNew = () => {
    setCurrent({ title: '', description: '', year: '', banner_image_url: null })
    setIsEditing(true)
  }

  const openEdit = (item: Experience) => {
    setCurrent(item)
    setIsEditing(true)
  }

  const closeModal = () => {
    setIsEditing(false)
    setCurrent({ title: '', description: '', year: '', banner_image_url: null })
  }

  const handleBannerUpload = async (file: File) => {
    setUploadingBanner(true)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `banners/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('experience-photos').upload(path, file, { upsert: true })
      if (upErr) throw upErr
      const { data } = supabase.storage.from('experience-photos').getPublicUrl(path)
      setCurrent((p) => ({ ...p, banner_image_url: data.publicUrl }))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error uploading banner')
    } finally {
      setUploadingBanner(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!current.title) { alert('Title is required.'); return }

    setSaving(true)
    try {
      const isUpdate = !!current.id
      const url = isUpdate ? `/api/admin/experiences/${current.id}` : '/api/admin/experiences'
      const method = isUpdate ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(current),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Failed to save')
      }

      const saved = await res.json()
      if (isUpdate) {
        setItems((prev) => prev.map((i) => (i.id === saved.id ? saved : i)))
      } else {
        setItems((prev) => [...prev, saved])
      }
      closeModal()
      router.refresh()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error saving')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/experiences/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setItems((prev) => prev.filter((i) => i.id !== id))
      setDeleteConfirmId(null)
      router.refresh()
    } catch {
      alert('Failed to delete experience')
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
    await fetch('/api/admin/experiences/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: reordered.map((i) => i.id) }),
    })
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm opacity-60 text-[var(--color-navy)]">
          {items.length} experience{items.length !== 1 ? 's' : ''} listed
        </p>
        <button onClick={openNew} className="btn-primary !py-2 !px-4 text-xs">
          + Add Experience
        </button>
      </div>

      {items.length === 0 ? (
        <div className="card-cream p-12 text-center rounded-2xl">
          <p className="opacity-40 italic text-sm text-[var(--color-navy)]">
            No experiences added yet. These appear on the About page as &ldquo;What We Do&rdquo;.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item, idx) => (
            <div key={item.id} className="card-cream rounded-2xl shadow-card flex flex-col justify-between overflow-hidden">
              {/* Banner preview */}
              {item.banner_image_url ? (
                <div className="relative w-full overflow-hidden" style={{ height: 100 }}>
                  <Image src={item.banner_image_url} alt="" fill className="object-cover" sizes="350px" />
                </div>
              ) : (
                <div className="relative overflow-hidden bg-[var(--color-navy)]" style={{ height: 60 }}>
                  <span className="absolute right-3 bottom-1 heading-display text-5xl opacity-10 text-[var(--color-cream)]">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                </div>
              )}

              <div className="p-5">
                <div className="heading-display text-5xl opacity-10 mb-3" style={{ color: 'var(--color-navy)' }}>
                  {String(idx + 1).padStart(2, '0')}
                </div>
                {item.year && (
                  <span className="pill pill-dusty inline-block mb-2 text-xs">{item.year}</span>
                )}
                <h3 className="font-bold text-base text-[var(--color-navy)] mb-1">{item.title}</h3>
                {item.description && (
                  <p className="text-xs opacity-60 text-[var(--color-navy)] line-clamp-3 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between px-5 pb-4 mt-2 border-t border-[var(--color-dusty-blue)]/20 pt-3">
                <div className="flex items-center gap-1">
                  <button
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, 'up')}
                    className="p-1 text-xs rounded hover:bg-[var(--color-dusty-blue)]/20 text-[var(--color-navy)] disabled:opacity-20"
                  >▲</button>
                  <button
                    disabled={idx === items.length - 1}
                    onClick={() => handleMove(idx, 'down')}
                    className="p-1 text-xs rounded hover:bg-[var(--color-dusty-blue)]/20 text-[var(--color-navy)] disabled:opacity-20"
                  >▼</button>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setAlbumExp(item)}
                    className="px-2 py-1 text-xs font-semibold bg-[var(--color-pale-blue)] text-[var(--color-navy)] border border-[var(--color-dusty-blue)]/40 hover:border-[var(--color-dusty-blue)]"
                  >Photos</button>
                  <button
                    onClick={() => openEdit(item)}
                    className="px-2.5 py-1 text-xs font-semibold bg-[var(--color-navy)] text-[var(--color-cream)] hover:bg-[var(--color-navy-secondary)]"
                  >Edit</button>
                  <button
                    onClick={() => setDeleteConfirmId(item.id)}
                    className="px-2.5 py-1 text-xs font-semibold text-[#8b2424] bg-red-100 hover:bg-red-200"
                  >Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="card-cream w-full max-w-lg rounded-2xl shadow-float p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--color-dusty-blue)]/30 pb-3">
              <h3 className="heading-section text-xl text-[var(--color-navy)]">
                {current.id ? 'Edit Experience' : 'New Experience'}
              </h3>
              <button onClick={closeModal} className="opacity-60 hover:opacity-100">✕</button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="form-label" htmlFor="expTitle">Title *</label>
                <input id="expTitle" type="text" className="form-input" required
                  placeholder="e.g. Cultural Events"
                  value={current.title ?? ''}
                  onChange={(e) => setCurrent((p) => ({ ...p, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="form-label" htmlFor="expYear">Year / Period</label>
                <input id="expYear" type="text" className="form-input"
                  placeholder="e.g. 2023 – Present"
                  value={current.year ?? ''}
                  onChange={(e) => setCurrent((p) => ({ ...p, year: e.target.value }))}
                />
              </div>
              <div>
                <label className="form-label" htmlFor="expDesc">Description</label>
                <textarea id="expDesc" rows={3} className="form-input"
                  placeholder="Brief description..."
                  value={current.description ?? ''}
                  onChange={(e) => setCurrent((p) => ({ ...p, description: e.target.value }))}
                />
              </div>

              {/* Banner image */}
              <div>
                <label className="form-label">Banner Image</label>
                <div className="flex gap-3 items-start">
                  <input
                    type="text"
                    className="form-input flex-1"
                    placeholder="https://... or upload below"
                    value={current.banner_image_url ?? ''}
                    onChange={(e) => setCurrent((p) => ({ ...p, banner_image_url: e.target.value || null }))}
                  />
                  <label className="btn-secondary !py-2 !px-3 text-xs cursor-pointer shrink-0">
                    {uploadingBanner ? 'Uploading…' : 'Upload'}
                    <input type="file" accept="image/*" className="hidden" disabled={uploadingBanner}
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleBannerUpload(f) }}
                    />
                  </label>
                </div>
                {current.banner_image_url && (
                  <div className="mt-2 relative w-full overflow-hidden group" style={{ height: 90 }}>
                    <Image src={current.banner_image_url} alt="Banner preview" fill className="object-cover" sizes="500px" />
                    <button
                      type="button"
                      onClick={() => setCurrent((p) => ({ ...p, banner_image_url: null }))}
                      className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 text-xs font-semibold text-white rounded"
                      style={{ background: 'rgba(139,36,36,0.85)' }}
                      title="Remove banner image"
                    >
                      ✕ Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[var(--color-dusty-blue)]/20">
                <button type="button" onClick={closeModal} className="btn-secondary !py-2 !px-4 text-xs">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary !py-2 !px-5 text-xs">
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="card-cream w-full max-w-sm rounded-2xl shadow-float p-6 space-y-4 text-center">
            <h3 className="heading-section text-xl text-[var(--color-navy)]">Delete Experience?</h3>
            <p className="text-sm text-[var(--color-navy)] opacity-70">This cannot be undone.</p>
            <div className="flex justify-center gap-3 pt-2">
              <button onClick={() => setDeleteConfirmId(null)} className="btn-secondary !py-2 !px-4 text-xs">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirmId)} className="btn-danger !py-2 !px-4 text-xs">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Album manager */}
      {albumExp && <AlbumManager exp={albumExp} onClose={() => setAlbumExp(null)} />}
    </div>
  )
}
