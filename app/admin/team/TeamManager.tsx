'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { TeamMember } from '@/types'
import { createClient } from '@/lib/supabase/client'
import ImageAdjustModal from './ImageAdjustModal'
import {
  TeamCategory,
  ParsedTeamMember,
  parseMemberRole,
  formatMemberRole,
  parseTeamMembers,
  CATEGORY_LABELS,
} from '@/lib/team'

interface Props {
  initialMembers: TeamMember[]
}

export default function TeamManager({ initialMembers }: Props) {
  const router = useRouter()
  const [members, setMembers] = useState<TeamMember[]>(initialMembers)
  const [adminFilter, setAdminFilter] = useState<'ALL' | TeamCategory>('ALL')
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [currentMember, setCurrentMember] = useState<Partial<TeamMember>>({
    name: '',
    role: '',
    bio: '',
    photo_url: '',
  })
  const [formCategory, setFormCategory] = useState<TeamCategory>('HOD')
  const [formDivision, setFormDivision] = useState<string>('')
  const [formTitle, setFormTitle] = useState<string>('President')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [adjustingSrc, setAdjustingSrc] = useState<string | null>(null)

  const openNewModal = () => {
    setCurrentMember({ name: '', role: '', bio: '', photo_url: '' })
    setFormCategory('HOD')
    setFormDivision('')
    setFormTitle('President')
    setIsEditing(true)
  }

  const openEditModal = (m: TeamMember) => {
    setCurrentMember(m)
    const parsed = parseMemberRole(m.role)
    setFormCategory(parsed.category)
    setFormDivision(parsed.division)
    setFormTitle(parsed.title)
    setIsEditing(true)
  }

  const closeModal = () => {
    setIsEditing(false)
    setCurrentMember({ name: '', role: '', bio: '', photo_url: '' })
    setFormCategory('HOD')
    setFormDivision('')
    setFormTitle('')
    setAdjustingSrc(null)
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

  const handleFileSelect = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAdjustingSrc(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleAdjustSave = async (file: File) => {
    setAdjustingSrc(null)
    await handlePhotoUpload(file)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentMember.name || !formTitle.trim()) {
      alert('Name and Title/Position are required.')
      return
    }

    const formattedRole = formatMemberRole(formCategory, formDivision, formTitle)

    setSaving(true)
    try {
      const isUpdate = !!currentMember.id
      const url = isUpdate ? `/api/admin/team/${currentMember.id}` : '/api/admin/team'
      const method = isUpdate ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...currentMember,
          role: formattedRole,
        }),
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

  const parsedList = parseTeamMembers(members)
  const displayedMembers =
    adminFilter === 'ALL'
      ? parsedList
      : parsedList.filter((m) => m.category === adminFilter)

  return (
    <div className="space-y-6">
      {/* Top action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm opacity-60 text-[var(--color-navy)]">
            {members.length} team member{members.length !== 1 ? 's' : ''} listed
          </p>
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <button
              type="button"
              onClick={() => setAdminFilter('ALL')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                adminFilter === 'ALL'
                  ? 'bg-[var(--color-navy)] text-[var(--color-cream)] shadow-sm'
                  : 'bg-white/70 text-[var(--color-navy)] border border-[var(--color-dusty-blue)]/40 hover:bg-white'
              }`}
            >
              All ({members.length})
            </button>
            {(['HOD', 'COORS', 'MEMBER'] as TeamCategory[]).map((cat) => {
              const count = parsedList.filter((m) => m.category === cat).length
              const isActive = adminFilter === cat
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setAdminFilter(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                    isActive
                      ? 'bg-[var(--color-navy)] text-[var(--color-cream)] shadow-sm'
                      : 'bg-white/70 text-[var(--color-navy)] border border-[var(--color-dusty-blue)]/40 hover:bg-white'
                  }`}
                >
                  {cat} ({count})
                </button>
              )
            })}
          </div>
        </div>
        <button onClick={openNewModal} className="btn-primary !py-2 !px-4 text-xs shrink-0 self-start sm:self-auto">
          + Add Member
        </button>
      </div>

      {/* Grid of members — Scaled Down 40% (Compact 5-col on desktop) */}
      {displayedMembers.length === 0 ? (
        <div className="card-cream p-12 text-center rounded-2xl">
          <p className="opacity-40 italic text-sm text-[var(--color-navy)]">
            {members.length === 0
              ? 'No team members added yet. Click "+ Add Member" to begin.'
              : `No team members under category "${adminFilter}".`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {displayedMembers.map((member, idx) => {
            const originalIdx = members.findIndex((m) => m.id === member.id)
            const tagLabel = member.division
              ? `${member.category} · ${member.division}`
              : member.category

            return (
              <div
                key={member.id}
                className="card-cream rounded-xl overflow-hidden border border-[var(--color-dusty-blue)]/30 shadow-card flex flex-col justify-between hover:shadow-float transition-all"
              >
                <div>
                  {/* Photo (Compact 4:5) */}
                  <div className="relative aspect-[4/5] w-full bg-[var(--color-dusty-blue)]/20 overflow-hidden">
                    {member.photo_url ? (
                      <Image
                        src={member.photo_url}
                        alt={member.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex flex-col items-center justify-center p-3 text-center"
                        style={{
                          background:
                            'linear-gradient(135deg, var(--color-dusty-blue) 0%, var(--color-navy) 100%)',
                        }}
                      >
                        <div className="relative w-8 h-8 mb-1 opacity-30">
                          <Image src="/logo-white.png" alt="UCIC" fill className="object-contain" />
                        </div>
                        <span
                          className="text-[9px] uppercase tracking-widest font-semibold opacity-75"
                          style={{ color: 'var(--color-cream)' }}
                        >
                          No Photo
                        </span>
                      </div>
                    )}
                    <div
                      className="absolute inset-x-0 bottom-0 h-4 pointer-events-none"
                      style={{
                        background: 'linear-gradient(to top, var(--color-cream), transparent)',
                      }}
                    />
                  </div>

                  {/* Card Body */}
                  <div className="p-3" style={{ background: 'var(--color-cream)' }}>
                    <div
                      className="text-[9px] font-bold uppercase tracking-wider opacity-60 mb-0.5 truncate"
                      style={{ color: 'var(--color-navy)' }}
                      title={tagLabel}
                    >
                      {tagLabel}
                    </div>
                    <h3
                      className="heading-display text-sm sm:text-base uppercase tracking-wide leading-tight mb-1 truncate"
                      style={{ color: 'var(--color-navy)' }}
                      title={member.name}
                    >
                      {member.name}
                    </h3>
                    <div className="mb-1.5">
                      <span
                        className="text-[10px] pill pill-dusty !py-0.5 !px-2 inline-block font-medium truncate max-w-full"
                        title={member.title}
                      >
                        {member.title}
                      </span>
                    </div>
                    {member.bio && (
                      <p
                        className="text-[11px] leading-snug opacity-65 line-clamp-2"
                        style={{ color: 'var(--color-navy)' }}
                      >
                        {member.bio}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons & Order */}
                <div
                  className="flex items-center justify-between p-2.5 border-t border-[var(--color-dusty-blue)]/20"
                  style={{ background: 'var(--color-cream)' }}
                >
                  <div className="flex items-center gap-1">
                    <button
                      disabled={originalIdx <= 0}
                      onClick={() => handleMove(originalIdx, 'up')}
                      className="p-1 text-[10px] rounded hover:bg-[var(--color-dusty-blue)]/20 text-[var(--color-navy)] disabled:opacity-20"
                      title="Move Up"
                    >
                      ▲
                    </button>
                    <button
                      disabled={originalIdx < 0 || originalIdx >= members.length - 1}
                      onClick={() => handleMove(originalIdx, 'down')}
                      className="p-1 text-[10px] rounded hover:bg-[var(--color-dusty-blue)]/20 text-[var(--color-navy)] disabled:opacity-20"
                      title="Move Down"
                    >
                      ▼
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(member)}
                      className="px-2 py-0.5 text-[11px] font-semibold rounded-pill bg-[var(--color-navy)] text-[var(--color-cream)] hover:bg-[var(--color-navy-secondary)]"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(member.id)}
                      className="px-2 py-0.5 text-[11px] font-semibold rounded-pill text-[#8b2424] bg-red-100 hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="card-cream w-full max-w-md rounded-2xl shadow-float p-6 space-y-4 max-h-[90vh] overflow-y-auto">
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
                  placeholder="e.g. Albert Wijaya"
                  value={currentMember.name ?? ''}
                  onChange={(e) => setCurrentMember((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>

              {/* Category Selector */}
              <div>
                <label className="form-label mb-1.5 block">Category *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['HOD', 'COORS', 'MEMBER'] as TeamCategory[]).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setFormCategory(cat)
                        if (cat === 'HOD' && (!formTitle || formTitle === 'Coordinator' || formTitle === 'Member')) {
                          setFormTitle('President')
                        } else if (cat === 'COORS' && (!formTitle || formTitle === 'President' || formTitle === 'Member')) {
                          setFormTitle('Coordinator')
                        } else if (cat === 'MEMBER' && (!formTitle || formTitle === 'President' || formTitle === 'Coordinator')) {
                          setFormTitle('Member')
                        }
                      }}
                      className={`py-2 px-2 text-xs font-bold rounded-lg border transition-all ${
                        formCategory === cat
                          ? 'bg-[var(--color-navy)] text-[var(--color-cream)] border-[var(--color-navy)] shadow-sm'
                          : 'bg-white/60 text-[var(--color-navy)] border-[var(--color-dusty-blue)]/40 hover:bg-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] opacity-60 text-[var(--color-navy)] mt-1">
                  {formCategory === 'HOD' && 'Head of Department / Executive Board'}
                  {formCategory === 'COORS' && 'Division Coordinator'}
                  {formCategory === 'MEMBER' && 'Division Committee / Member'}
                </p>
              </div>

              {/* Division (For COORS and MEMBER) */}
              {(formCategory === 'COORS' || formCategory === 'MEMBER') && (
                <div>
                  <label className="form-label" htmlFor="memberDivision">Division *</label>
                  <input
                    id="memberDivision"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Creative, Event, Public Relations, Marketing"
                    required
                    value={formDivision}
                    onChange={(e) => setFormDivision(e.target.value)}
                  />
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {['Creative', 'Event', 'Public Relations', 'Marketing', 'Logistics', 'ITS'].map((div) => (
                      <button
                        key={div}
                        type="button"
                        onClick={() => setFormDivision(div)}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-dusty-blue)]/20 hover:bg-[var(--color-dusty-blue)]/40 text-[var(--color-navy)] font-medium"
                      >
                        +{div}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Specific Title / Position */}
              <div>
                <label className="form-label" htmlFor="memberTitle">
                  {formCategory === 'HOD' ? 'Executive Title *' : 'Role / Title *'}
                </label>
                <input
                  id="memberTitle"
                  type="text"
                  className="form-input"
                  placeholder={
                    formCategory === 'HOD'
                      ? 'e.g. President, Vice President, Secretary, Treasurer'
                      : 'e.g. Coordinator, Co-Coordinator, Staff, Member'
                  }
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
                {formCategory === 'HOD' && (
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {['President', 'Vice President', 'Secretary', 'Treasurer', 'Assistant Secretary'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setFormTitle(t)}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-dusty-blue)]/20 hover:bg-[var(--color-dusty-blue)]/40 text-[var(--color-navy)] font-medium"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
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
                <label className="form-label">Photo (Portrait 4:5)</label>
                <div className="flex flex-col gap-3">
                  {currentMember.photo_url ? (
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-20 rounded-lg overflow-hidden shrink-0 border border-slate-700 bg-slate-900 shadow">
                        <Image
                          src={currentMember.photo_url}
                          alt="Photo preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <label className="btn-secondary !py-1.5 !px-3 text-xs cursor-pointer">
                          {uploading ? 'Uploading...' : 'Replace Image'}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={uploading}
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleFileSelect(file)
                              e.target.value = ''
                            }}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => currentMember.photo_url && setAdjustingSrc(currentMember.photo_url)}
                          className="px-3 py-1.5 text-xs font-semibold rounded bg-sky-500/20 text-sky-400 border border-sky-500/40 hover:bg-sky-500/30 transition"
                        >
                          📐 Adjust Crop & Pan
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="btn-secondary !py-2 !px-4 text-xs cursor-pointer inline-flex items-center gap-2 w-fit">
                      {uploading ? 'Uploading...' : 'Choose Image & Adjust'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileSelect(file)
                          e.target.value = ''
                        }}
                      />
                    </label>
                  )}
                  <p className="text-[11px] opacity-60 text-[var(--color-navy)]">
                    Photos can be zoomed and dragged to fit the card layout.
                  </p>
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

      {/* Image Adjuster Modal */}
      {adjustingSrc && (
        <ImageAdjustModal
          imageSrc={adjustingSrc}
          onSave={handleAdjustSave}
          onCancel={() => setAdjustingSrc(null)}
        />
      )}
    </div>
  )
}
