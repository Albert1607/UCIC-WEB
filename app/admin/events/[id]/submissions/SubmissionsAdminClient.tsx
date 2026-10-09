'use client'

import { useState, useMemo } from 'react'
import { Event, SubmissionField, EventSubmission } from '@/types'
import { formatDateTime } from '@/lib/utils'

interface SubmissionWithProfile extends EventSubmission {
  user_profiles: {
    full_name: string | null
    student_id: string | null
    email?: string | null
  } | null
}

interface Props {
  event: Event
  fields: SubmissionField[]
  initialSubmissions: SubmissionWithProfile[]
}

export default function SubmissionsAdminClient({ event, fields, initialSubmissions }: Props) {
  const [submissions, setSubmissions] = useState<SubmissionWithProfile[]>(initialSubmissions)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'submitted' | 'draft'>('all')
  const [selected, setSelected] = useState<SubmissionWithProfile | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [loadingUrl, setLoadingUrl] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let result = [...submissions]
    if (filter !== 'all') result = result.filter(s => s.status === filter)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(s => {
        const name = s.user_profiles?.full_name?.toLowerCase() ?? ''
        const email = s.user_profiles?.email?.toLowerCase() ?? ''
        const sid = s.user_profiles?.student_id?.toLowerCase() ?? ''
        const answers = Object.values(s.answers ?? {}).join(' ').toLowerCase()
        return name.includes(q) || email.includes(q) || sid.includes(q) || answers.includes(q)
      })
    }
    return result
  }, [submissions, search, filter])

  const totalSubmitted = submissions.filter(s => s.status === 'submitted').length
  const totalDraft = submissions.filter(s => s.status === 'draft').length

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/submissions/${id}`, { method: 'DELETE' })
      if (!res.ok) { alert('Failed to delete submission'); return }
      setSubmissions(prev => prev.filter(s => s.id !== id))
      if (selected?.id === id) setSelected(null)
      setConfirmDeleteId(null)
    } catch {
      alert('Network error')
    } finally {
      setDeletingId(null)
    }
  }

  const getSignedUrl = async (path: string) => {
    setLoadingUrl(path)
    try {
      const res = await fetch(`/api/admin/submissions/${selected?.id || 'download'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path }),
      })
      const data = await res.json()
      if (data.signedUrl) window.open(data.signedUrl, '_blank')
      else alert('Could not generate download link')
    } catch {
      alert('Error generating download link')
    } finally {
      setLoadingUrl(null)
    }
  }

  const exportCSV = () => {
    const headers = ['#', 'Name', 'Email', 'Student ID', 'Status', 'Submitted At', ...fields.map(f => f.label)]
    const rows = filtered.map((s, i) => [
      String(i + 1),
      s.user_profiles?.full_name ?? '',
      s.user_profiles?.email ?? '',
      s.user_profiles?.student_id ?? '',
      s.status,
      s.submitted_at ? formatDateTime(s.submitted_at) : '',
      ...fields.map(f => s.answers?.[f.id] ?? ''),
    ])
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${event.slug}-submissions.csv`
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-cream p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-navy)] opacity-60">Total Registered</p>
          <p className="heading-display text-4xl text-[var(--color-navy)] mt-1">{submissions.length}</p>
        </div>
        <div className="card-cream p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-navy)] opacity-60">Submitted</p>
          <p className="heading-display text-4xl text-[var(--color-navy)] mt-1">{totalSubmitted}</p>
        </div>
        <div className="card-cream p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-navy)] opacity-60">Pending (Draft)</p>
          <p className="heading-display text-4xl text-[var(--color-navy)] mt-1">{totalDraft}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {(['all', 'submitted', 'draft'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-pill text-xs font-semibold transition-colors ${filter === f ? 'bg-[var(--color-navy)] text-[var(--color-cream)]' : 'bg-[var(--color-cream)] text-[var(--color-navy)] border border-[var(--color-dusty-blue)]/40'}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-center">
          <input
            type="text" className="form-input !py-2 text-sm"
            placeholder="Search by name, ID, answer…"
            value={search} onChange={e => setSearch(e.target.value)}
          />
          <button onClick={exportCSV} disabled={filtered.length === 0} className="btn-primary !py-2 !px-4 text-xs shrink-0 disabled:opacity-40">
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card-cream rounded-2xl overflow-hidden shadow-card">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-[var(--color-navy)]">
            <p className="font-semibold">No submissions found</p>
            <p className="text-sm opacity-50 mt-1">{search ? 'Try adjusting your search.' : 'No one has submitted yet.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[var(--color-navy)] text-[var(--color-cream)] text-xs uppercase tracking-wider">
                  <th className="py-3 px-4 w-10 text-center">#</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Student ID</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Submitted At</th>
                  <th className="py-3 px-4 text-right sticky right-0 bg-[var(--color-navy)]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-dusty-blue)]/20 text-[var(--color-navy)]">
                {filtered.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-[var(--color-dusty-blue)]/10 transition-colors">
                    <td className="py-3 px-4 text-center font-mono text-xs opacity-50">{idx + 1}</td>
                    <td className="py-3 px-4 font-medium text-sm">
                      <div>
                        <p>{s.user_profiles?.full_name ?? <span className="opacity-40 italic">Unknown</span>}</p>
                        {s.user_profiles?.email && (
                          <p className="text-xs opacity-50 font-normal">{s.user_profiles.email}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs opacity-70">{s.user_profiles?.student_id ?? '—'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.status === 'submitted' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs opacity-70">{s.submitted_at ? formatDateTime(s.submitted_at) : '—'}</td>
                    <td className="py-3 px-4 text-right whitespace-nowrap sticky right-0 bg-[var(--color-cream)]">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setSelected(s)} className="px-2.5 py-1 text-xs font-semibold rounded-pill bg-[var(--color-navy)] text-[var(--color-cream)] hover:opacity-80 transition-opacity">
                          View
                        </button>
                        <button onClick={() => setConfirmDeleteId(s.id)} className="px-2.5 py-1 text-xs font-semibold rounded-pill text-[#8b2424] bg-red-100 hover:bg-red-200 transition-colors">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="card-cream w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl shadow-float p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--color-dusty-blue)]/30 pb-3">
              <div>
                <h3 className="heading-section text-xl text-[var(--color-navy)]">Submission Details</h3>
                <p className="text-xs opacity-60 text-[var(--color-navy)] mt-0.5">
                  {selected.user_profiles?.full_name ?? 'Unknown'}
                  {selected.user_profiles?.email ? ` (${selected.user_profiles.email})` : ''} · {selected.user_profiles?.student_id ? `ID: ${selected.user_profiles.student_id} · ` : ''}{selected.status}
                </p>
              </div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--color-dusty-blue)]/20 text-[var(--color-navy)] hover:bg-[var(--color-dusty-blue)]/40">✕</button>
            </div>

            <div className="space-y-4">
              {fields.map(field => {
                const val = selected.answers?.[field.id]
                const isFile = field.field_type === 'file_upload' && val && val.includes('/')
                return (
                  <div key={field.id} className="p-3.5 rounded-xl bg-white/60 border border-[var(--color-dusty-blue)]/20">
                    <p className="text-xs font-bold text-[var(--color-dusty-blue)] uppercase tracking-wider mb-1">{field.label}</p>
                    {isFile ? (
                      <button
                        onClick={() => getSignedUrl(val)}
                        disabled={loadingUrl === val}
                        className="text-sm text-blue-600 underline hover:text-blue-800 text-left"
                      >
                        {loadingUrl === val ? 'Generating link…' : `📎 ${val.split('/').pop()}`}
                      </button>
                    ) : (
                      <p className="text-sm text-[var(--color-navy)] break-words whitespace-pre-wrap">{val || '—'}</p>
                    )}
                  </div>
                )
              })}
              {fields.length === 0 && (
                <p className="text-sm opacity-50 italic text-center py-4">No submission fields configured.</p>
              )}
            </div>

            <div className="flex justify-end pt-3">
              <button onClick={() => setSelected(null)} className="btn-primary !py-2 !px-5 text-xs">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="card-cream w-full max-w-sm rounded-2xl shadow-float p-6 space-y-4 text-center">
            <h3 className="heading-section text-xl text-[var(--color-navy)]">Delete Submission?</h3>
            <p className="text-sm text-[var(--color-navy)] opacity-70">This cannot be undone. Any uploaded files will also be deleted.</p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button onClick={() => setConfirmDeleteId(null)} className="btn-secondary !py-2 !px-4 text-xs">Cancel</button>
              <button onClick={() => handleDelete(confirmDeleteId)} disabled={deletingId === confirmDeleteId} className="btn-danger !py-2 !px-4 text-xs">
                {deletingId === confirmDeleteId ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
