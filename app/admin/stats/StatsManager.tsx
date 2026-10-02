'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SiteStat } from '@/types'

interface Props {
  initialStats: SiteStat[]
}

export default function StatsManager({ initialStats }: Props) {
  const router = useRouter()
  const [stats, setStats] = useState<SiteStat[]>(initialStats)
  const [isEditing, setIsEditing] = useState(false)
  const [currentStat, setCurrentStat] = useState<Partial<SiteStat>>({
    label: '',
    value: '',
  })
  const [saving, setSaving] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const openNewModal = () => {
    setCurrentStat({ label: '', value: '' })
    setIsEditing(true)
  }

  const openEditModal = (s: SiteStat) => {
    setCurrentStat(s)
    setIsEditing(true)
  }

  const closeModal = () => {
    setIsEditing(false)
    setCurrentStat({ label: '', value: '' })
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentStat.label || !currentStat.value) {
      alert('Label and value are required.')
      return
    }

    setSaving(true)
    try {
      const isUpdate = !!currentStat.id
      const url = isUpdate ? `/api/admin/stats/${currentStat.id}` : '/api/admin/stats'
      const method = isUpdate ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentStat),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Failed to save statistic')
      }

      const saved = await res.json()
      if (isUpdate) {
        setStats((prev) => prev.map((s) => (s.id === saved.id ? saved : s)))
      } else {
        setStats((prev) => [...prev, saved])
      }
      closeModal()
      router.refresh()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error saving stat')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/stats/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setStats((prev) => prev.filter((s) => s.id !== id))
      setDeleteConfirmId(null)
      router.refresh()
    } catch {
      alert('Failed to delete stat')
    }
  }

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= stats.length) return

    const reordered = [...stats]
    const temp = reordered[index]
    reordered[index] = reordered[newIndex]
    reordered[newIndex] = temp

    setStats(reordered)

    try {
      await fetch('/api/admin/stats/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: reordered.map((s) => s.id) }),
      })
      router.refresh()
    } catch {
      alert('Failed to save order')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm opacity-60 text-[var(--color-navy)]">
          {stats.length} metrics configured
        </p>
        <button onClick={openNewModal} className="btn-primary !py-2 !px-4 text-xs">
          + Add Stat
        </button>
      </div>

      {stats.length === 0 ? (
        <div className="card-cream p-12 text-center rounded-2xl">
          <p className="opacity-40 italic text-sm text-[var(--color-navy)]">
            No stats created yet. Click &ldquo;+ Add Stat&rdquo; to add your first key figure.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <div
              key={stat.id}
              className="card-cream p-5 rounded-2xl flex flex-col justify-between shadow-card hover:shadow-float transition-all"
            >
              <div>
                <p className="heading-display text-4xl text-[var(--color-navy)] mb-1">
                  {stat.value}
                </p>
                <p className="text-sm font-semibold opacity-70 text-[var(--color-navy)]">
                  {stat.label}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-[var(--color-dusty-blue)]/20">
                <div className="flex items-center gap-1">
                  <button
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, 'up')}
                    className="p-1 text-xs rounded hover:bg-[var(--color-dusty-blue)]/20 text-[var(--color-navy)] disabled:opacity-20"
                    title="Move Left"
                  >
                    ◀
                  </button>
                  <button
                    disabled={idx === stats.length - 1}
                    onClick={() => handleMove(idx, 'down')}
                    className="p-1 text-xs rounded hover:bg-[var(--color-dusty-blue)]/20 text-[var(--color-navy)] disabled:opacity-20"
                    title="Move Right"
                  >
                    ▶
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(stat)}
                    className="px-2.5 py-1 text-xs font-semibold rounded-pill bg-[var(--color-navy)] text-[var(--color-cream)] hover:bg-[var(--color-navy-secondary)]"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(stat.id)}
                    className="px-2.5 py-1 text-xs font-semibold rounded-pill text-[#8b2424] bg-red-100 hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="card-cream w-full max-w-sm rounded-2xl shadow-float p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--color-dusty-blue)]/30 pb-3">
              <h3 className="heading-section text-xl text-[var(--color-navy)]">
                {currentStat.id ? 'Edit Stat' : 'New Stat'}
              </h3>
              <button onClick={closeModal} className="opacity-60 hover:opacity-100">
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="form-label" htmlFor="statValue">Value / Number *</label>
                <input
                  id="statValue"
                  type="text"
                  className="form-input"
                  placeholder="e.g. 200+ or 15"
                  required
                  value={currentStat.value ?? ''}
                  onChange={(e) => setCurrentStat((prev) => ({ ...prev, value: e.target.value }))}
                />
              </div>

              <div>
                <label className="form-label" htmlFor="statLabel">Label *</label>
                <input
                  id="statLabel"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Active Members"
                  required
                  value={currentStat.label ?? ''}
                  onChange={(e) => setCurrentStat((prev) => ({ ...prev, label: e.target.value }))}
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[var(--color-dusty-blue)]/20">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn-secondary !py-2 !px-4 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary !py-2 !px-5 text-xs"
                >
                  {saving ? 'Saving...' : 'Save Stat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="card-cream w-full max-w-sm rounded-2xl shadow-float p-6 space-y-4 text-center">
            <h3 className="heading-section text-xl text-[var(--color-navy)]">
              Delete Statistic?
            </h3>
            <p className="text-sm text-[var(--color-navy)] opacity-70">
              Are you sure you want to remove this metric?
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="btn-secondary !py-2 !px-4 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="btn-danger !py-2 !px-4 text-xs"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
