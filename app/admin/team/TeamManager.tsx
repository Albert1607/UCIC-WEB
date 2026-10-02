'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { TeamMember } from '@/types'
import { createClient } from '@/lib/supabase/client'

interface Props {
  initialMembers: TeamMember[]
}

export default function TeamManager({ initialMembers }: Props) {
  const router = useRouter()
  const [members, setMembers] = useState<TeamMember[]>(initialMembers)
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [currentMember, setCurrentMember] = useState<Partial<TeamMember>>({
    name: '',
    role: '',
    bio: '',
    photo_url: '',
  })
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const openNewModal = () => {
    setCurrentMember({ name: '', role: '', bio: '', photo_url: '' })
    setIsEditing(true)
  }

  const openEditModal = (m: TeamMember) => {
    setCurrentMember(m)
    setIsEditing(true)
  }

  const closeModal = () => {
    setIsEditing(false)
    setCurrentMember({ name: '', role: '', bio: '', photo_url: '' })
  }

  const handlePhotoUpload = async (file: File) => {
    setUploading(true)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const fileName = `team-${Date.now()}.${ext}`
      const filePath = `members/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('team-photos')
        .upload(filePath, file, { cacheControl: '3600', upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('team-photos').getPublicUrl(filePath)
      setCurrentMember((prev) => ({ ...prev, photo_url: data.publicUrl }))
    } catch {
      alert('Failed to upload photo')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentMember.name || !currentMember.role) {
      alert('Name and role are required.')
      return
    }

    setSaving(true)
    try {
      const isUpdate = !!currentMember.id
      const url = isUpdate ? `/api/admin/team/${currentMember.id}` : '/api/admin/team'
      const method = isUpdate ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentMember),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Failed to save team member')
      }

      const saved = await res.json()
      if (isUpdate) {
        setMembers((prev) => prev.map((m) => (m.id === saved.id ? saved : m)))
      } else {
        setMembers((prev) => [...prev, saved])
      }
      closeModal()
      router.refresh()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error saving team member')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/team/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete member')
      setMembers((prev) => prev.filter((m) => m.id !== id))
      setDeleteConfirmId(null)
      router.refresh()
    } catch {
      alert('Failed to delete team member')
    }
  }

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= members.length) return

    const reordered = [...members]
    const temp = reordered[index]
    reordered[index] = reordered[newIndex]
    reordered[newIndex] = temp

    setMembers(reordered)

    try {
      await fetch('/api/admin/team/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: reordered.map((m) => m.id) }),
      })
      router.refresh()
    } catch {
      alert('Failed to persist order')
    }
  }

  return (
    <div className="space-y-6">
      {/* Top action */}
      <div className="flex justify-between items-center">
        <p className="text-sm opacity-60 text-[var(--color-navy)]">
          {members.length} team member{members.length !== 1 ? 's' : ''} listed
        </p>
        <button onClick={openNewModal} className="btn-primary !py-2 !px-4 text-xs">
          + Add Member
        </button>
      </div>

      {/* Grid of members */}
      {members.length === 0 ? (
        <div className="card-cream p-12 text-center rounded-2xl">
          <p className="opacity-40 italic text-sm text-[var(--color-navy)]">
            No team members added yet. Click &ldquo;+ Add Member&rdquo; to begin.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {members.map((member, idx) => (
            <div
              key={member.id}
              className="card-cream p-5 rounded-2xl flex flex-col justify-between shadow-card hover:shadow-float transition-all"
            >
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 bg-[var(--color-dusty-blue)]/20 border border-[var(--color-dusty-blue)]/40 flex items-center justify-center">
                    {member.photo_url ? (
                      <Image
                        src={member.photo_url}
                        alt={member.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span className="heading-display text-2xl text-[var(--color-navy)] opacity-40">
                        {member.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-base text-[var(--color-navy)] truncate">
                      {member.name}
                    </h3>
                    <p className="text-xs pill pill-dusty inline-block mt-1">
                      {member.role}
                    </p>
                  </div>
                </div>

                {member.bio && (
                  <p className="text-xs opacity-60 text-[var(--color-navy)] line-clamp-3 mb-4 leading-relaxed">
                    {member.bio}
                  </p>
                )}
              </div>

              {/* Action Buttons & Order */}
              <div className="flex items-center justify-between pt-3 border-t border-[var(--color-dusty-blue)]/20">
                <div className="flex items-center gap-1">
                  <button
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, 'up')}
                    className="p-1 text-xs rounded hover:bg-[var(--color-dusty-blue)]/20 text-[var(--color-navy)] disabled:opacity-20"
                    title="Move Up"
                  >
                    ▲
                  </button>
                  <button
                    disabled={idx === members.length - 1}
                    onClick={() => handleMove(idx, 'down')}
                    className="p-1 text-xs rounded hover:bg-[var(--color-dusty-blue)]/20 text-[var(--color-navy)] disabled:opacity-20"
                    title="Move Down"
                  >
                    ▼
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(member)}
                    className="px-2.5 py-1 text-xs font-semibold rounded-pill bg-[var(--color-navy)] text-[var(--color-cream)] hover:bg-[var(--color-navy-secondary)]"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(member.id)}
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
          <div className="card-cream w-full max-w-md rounded-2xl shadow-float p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--color-dusty-blue)]/30 pb-3">
              <h3 className="heading-section text-xl text-[var(--color-navy)]">
                {currentMember.id ? 'Edit Team Member' : 'New Team Member'}
              </h3>
              <button onClick={closeModal} className="opacity-60 hover:opacity-100">
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="form-label" htmlFor="memberName">Name *</label>
                <input
                  id="memberName"
                  type="text"
                  className="form-input"
                  required
                  value={currentMember.name ?? ''}
                  onChange={(e) => setCurrentMember((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div>
                <label className="form-label" htmlFor="memberRole">Role / Title *</label>
                <input
                  id="memberRole"
                  type="text"
                  className="form-input"
                  placeholder="e.g. President, Head of Media"
                  required
                  value={currentMember.role ?? ''}
                  onChange={(e) => setCurrentMember((prev) => ({ ...prev, role: e.target.value }))}
                />
              </div>

              <div>
                <label className="form-label" htmlFor="memberBio">Bio</label>
                <textarea
                  id="memberBio"
                  rows={3}
                  className="form-input"
                  placeholder="Short description..."
                  value={currentMember.bio ?? ''}
                  onChange={(e) => setCurrentMember((prev) => ({ ...prev, bio: e.target.value }))}
                />
              </div>

              <div>
                <label className="form-label">Photo</label>
                <div className="flex items-center gap-3">
                  {currentMember.photo_url && (
                    <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-[var(--color-dusty-blue)]/30">
                      <Image
                        src={currentMember.photo_url}
                        alt="Photo preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <label className="btn-secondary !py-1.5 !px-3 text-xs cursor-pointer">
                    {uploading ? 'Uploading...' : 'Choose Image'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handlePhotoUpload(file)
                      }}
                    />
                  </label>
                </div>
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
                  disabled={saving || uploading}
                  className="btn-primary !py-2 !px-5 text-xs"
                >
                  {saving ? 'Saving...' : 'Save Member'}
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
              Delete Member?
            </h3>
            <p className="text-sm text-[var(--color-navy)] opacity-70">
              Are you sure you want to remove this team member?
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
