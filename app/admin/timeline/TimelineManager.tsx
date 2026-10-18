'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { TimelineItem } from '@/types'
import { createClient } from '@/lib/supabase/client'

interface Props {
  initialItems: TimelineItem[]
}

export default function TimelineManager({ initialItems }: Props) {
  const router = useRouter()
  const [items, setItems] = useState<TimelineItem[]>(initialItems)
  const [isEditing, setIsEditing] = useState(false)
  const [current, setCurrent] = useState<Partial<TimelineItem>>({ year: '', title: '', description: '', image_urls: [] })
  const [saving, setSaving] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [uploadingImg, setUploadingImg] = useState(false)

  const openNew = () => {
    setCurrent({ year: '', title: '', description: '', image_urls: [] })
    setIsEditing(true)
  }

  const openEdit = (item: TimelineItem) => {
    setCurrent({ ...item, image_urls: item.image_urls ?? [] })
    setIsEditing(true)
  }

  const closeModal = () => {
    setIsEditing(false)
    setCurrent({ year: '', title: '', description: '', image_urls: [] })
  }

  const handleAddImage = async (file: File) => {
    setUploadingImg(true)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `timeline/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('site-images').upload(path, file, { upsert: true })
      if (upErr) throw upErr
      const { data } = supabase.storage.from('site-images').getPublicUrl(path)
      setCurrent((p) => ({ ...p, image_urls: [...(p.image_urls ?? []), data.publicUrl] }))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error uploading')
    } finally {
      setUploadingImg(false)
    }
  }

  const removeImage = (url: string) => {
    setCurrent((p) => ({ ...p, image_urls: (p.image_urls ?? []).filter((u) => u !== url) }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!current.year || !current.title) {
      alert('Year and title are required.')
      return
    }

    setSaving(true)
    try {
      const isUpdate = !!current.id
      const url = isUpdate ? `/api/admin/timeline/${current.id}` : '/api/admin/timeline'
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
      const res = await fetch(`/api/admin/timeline/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setItems((prev) => prev.filter((i) => i.id !== id))
      setDeleteConfirmId(null)
      router.refresh()
    } catch {
      alert('Failed to delete timeline item')
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
    await fetch('/api/admin/timeline/reorder', {
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
          {items.length} timeline item{items.length !== 1 ? 's' : ''}
        </p>
        <button onClick={openNew} className="btn-primary !py-2 !px-4 text-xs">
          + Add Timeline Item
        </button>
      </div>

      {items.length === 0 ? (
        <div className="card-cream p-12 text-center rounded-2xl">
          <p className="opacity-40 italic text-sm text-[var(--color-navy)]">
            No timeline items added. These appear on the About page as &ldquo;Our Journey&rdquo;.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className="timeline-bar flex items-center gap-5 p-4 rounded-xl"
            >
              <span className="heading-display text-2xl min-w-[72px] text-[var(--color-navy)] opacity-70">
                {item.year}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-[var(--color-navy)]">{item.title}</div>
                {item.description && (
                  <div className="text-xs opacity-60 text-[var(--color-navy)] mt-0.5 line-clamp-1">
                    {item.description}
                  </div>
                )}
                {/* Image thumbnails */}
                {item.image_urls && item.image_urls.length > 0 && (
                  <div className="flex gap-1 mt-2 overflow-x-auto">
                    {item.image_urls.map((url, i) => (
                      <div key={i} className="relative shrink-0 w-12 h-9 overflow-hidden border border-[var(--color-dusty-blue)]/30">
                        <Image src={url} alt="" fill className="object-cover" sizes="48px" />
                      </div>
                    ))}
                    <span className="text-xs opacity-50 self-center ml-1 text-[var(--color-navy)]">
                      {item.image_urls.length} photo{item.image_urls.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
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
                <button
                  onClick={() => openEdit(item)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-pill bg-[var(--color-navy)] text-[var(--color-cream)] hover:bg-[var(--color-navy-secondary)]"
                >Edit</button>
                <button
                  onClick={() => setDeleteConfirmId(item.id)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-pill text-[#8b2424] bg-red-100 hover:bg-red-200"
                >Delete</button>
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
                {current.id ? 'Edit Timeline Item' : 'New Timeline Item'}
              </h3>
              <button onClick={closeModal} className="opacity-60 hover:opacity-100">✕</button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="form-label" htmlFor="tlYear">Year *</label>
                <input id="tlYear" type="text" className="form-input" required
                  placeholder="e.g. 2021"
                  value={current.year ?? ''}
                  onChange={(e) => setCurrent((p) => ({ ...p, year: e.target.value }))}
                />
              </div>
              <div>
                <label className="form-label" htmlFor="tlTitle">Title *</label>
                <input id="tlTitle" type="text" className="form-input" required
                  placeholder="e.g. UCIC Founded"
                  value={current.title ?? ''}
                  onChange={(e) => setCurrent((p) => ({ ...p, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="form-label" htmlFor="tlDesc">Description</label>
                <textarea id="tlDesc" rows={3} className="form-input"
                  placeholder="Optional details..."
                  value={current.description ?? ''}
                  onChange={(e) => setCurrent((p) => ({ ...p, description: e.target.value }))}
                />
              </div>

              {/* Images */}
              <div>
                <label className="form-label">Photos (carousel images for this milestone)</label>
                <div className="flex gap-2 items-center mb-3">
                  <label className="btn-secondary !py-2 !px-3 text-xs cursor-pointer">
                    {uploadingImg ? 'Uploading…' : '+ Add Photo'}
                    <input type="file" accept="image/*" className="hidden" disabled={uploadingImg}
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAddImage(f) }}
                    />
                  </label>
                  <span className="text-xs opacity-50 text-[var(--color-navy)]">
                    {(current.image_urls ?? []).length} photo(s) — auto-dissolve carousel in public view
                  </span>
                </div>
                {(current.image_urls ?? []).length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {(current.image_urls ?? []).map((url, i) => (
                      <div key={i} className="relative w-20 h-14 overflow-hidden border border-[var(--color-dusty-blue)]/30 group">
                        <Image src={url} alt="" fill className="object-cover" sizes="80px" />
                        <button
                          type="button"
                          onClick={() => removeImage(url)}
                          className="absolute top-0.5 right-0.5 w-5 h-5 text-xs bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >×</button>
                      </div>
                    ))}
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
            <h3 className="heading-section text-xl text-[var(--color-navy)]">Delete Timeline Item?</h3>
            <p className="text-sm text-[var(--color-navy)] opacity-70">This cannot be undone.</p>
            <div className="flex justify-center gap-3 pt-2">
              <button onClick={() => setDeleteConfirmId(null)} className="btn-secondary !py-2 !px-4 text-xs">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirmId)} className="btn-danger !py-2 !px-4 text-xs">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
