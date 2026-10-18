'use client'

import { useState } from 'react'
import { NewsItem } from '@/types'
import { createClient } from '@/lib/supabase/client'

interface Props {
  initialItems: NewsItem[]
}

export default function NewsManager({ initialItems }: Props) {
  const [items, setItems] = useState<NewsItem[]>(initialItems)
  const [isAdding, setIsAdding] = useState(false)
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null)
  const [form, setForm] = useState<Partial<NewsItem>>({ title: '', embed_url: '', thumbnail_url: '' })
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [uploadingThumb, setUploadingThumb] = useState(false)

  const handleThumbnailUpload = async (file: File) => {
    setUploadingThumb(true)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `news-thumbnails/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage
        .from('site-images')
        .upload(path, file, { upsert: true })
      if (upErr) throw upErr
      const { data } = supabase.storage.from('site-images').getPublicUrl(path)
      setForm(p => ({ ...p, thumbnail_url: data.publicUrl }))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploadingThumb(false)
    }
  }

  const showMsg = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 4000)
  }

  const openNew = () => {
    setForm({ title: '', embed_url: '', thumbnail_url: '' })
    setIsAdding(true)
    setEditingItem(null)
  }

  const openEdit = (item: NewsItem) => {
    setForm({ ...item })
    setEditingItem(item)
    setIsAdding(true)
  }

  const closeModal = () => {
    setIsAdding(false)
    setEditingItem(null)
    setForm({ title: '', embed_url: '', thumbnail_url: '' })
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.embed_url) { alert('Title and embed URL are required.'); return }
    setSaving(true)
    try {
      const isUpdate = !!editingItem
      const url = isUpdate ? `/api/admin/news/${editingItem!.id}` : '/api/admin/news'
      const method = isUpdate ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title, embed_url: form.embed_url, thumbnail_url: form.thumbnail_url || null }),
      })
      if (!res.ok) throw new Error('Failed to save')
      const saved: NewsItem = await res.json()
      if (isUpdate) {
        setItems((prev) => prev.map((i) => (i.id === saved.id ? saved : i)))
      } else {
        setItems((prev) => [...prev, saved])
      }
      closeModal()
      showMsg('Saved!', 'success')
    } catch (err) {
      showMsg(err instanceof Error ? err.message : 'Error saving', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/admin/news/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setItems((prev) => prev.filter((i) => i.id !== id))
      setDeleteId(null)
      showMsg('Deleted.', 'success')
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
    // Save each reordered item's sort_order
    await Promise.all(reordered.map((item, idx) =>
      fetch(`/api/admin/news/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sort_order: idx }),
      })
    ))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm opacity-60 text-[var(--color-navy)]">{items.length} news item{items.length !== 1 ? 's' : ''}</p>
        <button onClick={openNew} className="btn-primary !py-2 !px-4 text-xs">+ Add News Item</button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-sm font-semibold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' : 'bg-red-50 text-red-800 border border-red-300'}`}>
          {message.text}
        </div>
      )}

      {items.length === 0 ? (
        <div className="card-cream p-12 text-center rounded-2xl">
          <p className="opacity-40 italic text-sm text-[var(--color-navy)]">
            No news items yet. Add YouTube, Instagram, or other embed links here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={item.id} className="card-cream p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-[var(--color-navy)] truncate">{item.title}</p>
                <p className="text-xs opacity-50 text-[var(--color-navy)] truncate mt-0.5">{item.embed_url}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button disabled={idx === 0} onClick={() => handleMove(idx, 'up')} className="p-1 text-xs text-[var(--color-navy)] disabled:opacity-20">▲</button>
                <button disabled={idx === items.length - 1} onClick={() => handleMove(idx, 'down')} className="p-1 text-xs text-[var(--color-navy)] disabled:opacity-20">▼</button>
                <button onClick={() => openEdit(item)} className="px-2.5 py-1 text-xs font-semibold bg-[var(--color-navy)] text-[var(--color-cream)]">Edit</button>
                <button onClick={() => setDeleteId(item.id)} className="px-2.5 py-1 text-xs font-semibold text-[#8b2424] bg-red-100">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="card-cream w-full max-w-lg rounded-2xl shadow-float p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--color-dusty-blue)]/30 pb-3">
              <h3 className="heading-section text-xl text-[var(--color-navy)]">{editingItem ? 'Edit News Item' : 'New News Item'}</h3>
              <button onClick={closeModal} className="opacity-60 hover:opacity-100">✕</button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="form-label">Title *</label>
                <input type="text" className="form-input" required value={form.title ?? ''}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. UCIC Annual Gala 2024 Highlights"
                />
              </div>
              <div>
                <label className="form-label">YouTube / Instagram / Embed URL *</label>
                <input type="url" className="form-input" required value={form.embed_url ?? ''}
                  onChange={(e) => setForm((p) => ({ ...p, embed_url: e.target.value }))}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <p className="form-help">Supported: YouTube watch URLs, YouTube short URLs (youtu.be), or any direct embed-able link.</p>
              </div>
              <div>
                <label className="form-label">
                  Thumbnail Image <span className="font-normal opacity-50 text-xs">(optional — YouTube auto-fetches)</span>
                </label>
                {form.thumbnail_url ? (
                  <div className="relative overflow-hidden rounded-lg group" style={{ height: 120 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={form.thumbnail_url}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setForm(p => ({ ...p, thumbnail_url: '' }))}
                      className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 text-xs font-semibold text-white rounded"
                      style={{ background: 'rgba(139,36,36,0.85)' }}
                    >
                      ✕ Remove
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center gap-3 cursor-pointer px-4 py-3 rounded-xl border-2 border-dashed border-[var(--color-dusty-blue)]/40 hover:border-[var(--color-dusty-blue)] transition-colors"
                    style={{ background: 'rgba(156,182,215,0.07)' }}
                  >
                    <svg className="w-5 h-5 shrink-0" style={{ color: 'var(--color-navy)', opacity: 0.5 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium" style={{ color: 'var(--color-navy)', opacity: 0.65 }}>
                      {uploadingThumb ? 'Uploading…' : 'Click to upload thumbnail image'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingThumb}
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (f) handleThumbnailUpload(f)
                      }}
                    />
                  </label>
                )}
                <p className="form-help mt-1.5">For Instagram posts, upload a screenshot or image. YouTube thumbnails are fetched automatically.</p>
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-[var(--color-dusty-blue)]/20">
                <button type="button" onClick={closeModal} className="btn-secondary !py-2 !px-4 text-xs">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary !py-2 !px-5 text-xs">{saving ? 'Saving…' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="card-cream w-full max-w-sm rounded-2xl shadow-float p-6 space-y-4 text-center">
            <h3 className="heading-section text-xl text-[var(--color-navy)]">Delete News Item?</h3>
            <p className="text-sm text-[var(--color-navy)] opacity-70">This cannot be undone.</p>
            <div className="flex justify-center gap-3 pt-2">
              <button onClick={() => setDeleteId(null)} className="btn-secondary !py-2 !px-4 text-xs">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="btn-danger !py-2 !px-4 text-xs">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
