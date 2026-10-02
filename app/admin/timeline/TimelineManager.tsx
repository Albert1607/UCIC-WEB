'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TimelineItem } from '@/types'

interface Props {
  initialItems: TimelineItem[]
}

export default function TimelineManager({ initialItems }: Props) {
  const router = useRouter()
  const [items, setItems] = useState<TimelineItem[]>(initialItems)
  const [isEditing, setIsEditing] = useState(false)
  const [current, setCurrent] = useState<Partial<TimelineItem>>({ year: '', title: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const openNew = () => {
    setCurrent({ year: '', title: '', description: '' })
    setIsEditing(true)
  }

  const openEdit = (item: TimelineItem) => {
    setCurrent(item)
    setIsEditing(true)
  }

  const closeModal = () => {
    setIsEditing(false)
    setCurrent({ year: '', title: '', description: '' })
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
          <div className="card-cream w-full max-w-md rounded-2xl shadow-float p-6 space-y-4">
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
