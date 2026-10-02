'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Event, FormField, Registration } from '@/types'
import { formatDateTime } from '@/lib/utils'

interface Props {
  event: Event
  fields: FormField[]
  initialRegistrations: Registration[]
}

export default function RegistrantsClient({ event, fields, initialRegistrations }: Props) {
  const router = useRouter()
  const [registrations, setRegistrations] = useState<Registration[]>(initialRegistrations)
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<'created_at' | string>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  // Filter out section headers from data columns
  const questionFields = useMemo(() => {
    return fields.filter((f) => f.field_type !== 'section_header')
  }, [fields])

  // Helper to format answers
  const formatAnswerValue = (val: unknown): string => {
    if (val === null || val === undefined) return '—'
    if (Array.isArray(val)) return val.join(', ')
    if (typeof val === 'boolean') return val ? 'Yes' : 'No'
    if (typeof val === 'object') return JSON.stringify(val)
    return String(val)
  }

  // Filtered and sorted data
  const filteredRegistrations = useMemo(() => {
    let result = [...registrations]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((reg) => {
        if (reg.submitted_email && reg.submitted_email.toLowerCase().includes(q)) return true
        return Object.values(reg.answers || {}).some((v) =>
          formatAnswerValue(v).toLowerCase().includes(q)
        )
      })
    }

    result.sort((a, b) => {
      let valA: string = ''
      let valB: string = ''

      if (sortField === 'created_at') {
        valA = a.created_at
        valB = b.created_at
      } else {
        valA = formatAnswerValue(a.answers?.[sortField])
        valB = formatAnswerValue(b.answers?.[sortField])
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [registrations, search, sortField, sortDirection])

  // Sorting toggle
  const handleSort = (fieldKey: string) => {
    if (sortField === fieldKey) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(fieldKey)
      setSortDirection('asc')
    }
  }

  // Delete registration
  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/registrations/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        alert('Failed to delete registration')
        return
      }
      setRegistrations((prev) => prev.filter((r) => r.id !== id))
      if (selectedRegistration?.id === id) setSelectedRegistration(null)
      setConfirmDeleteId(null)
      router.refresh()
    } catch {
      alert('Network error while deleting registration')
    } finally {
      setDeletingId(null)
    }
  }

  // CSV Export
  const exportToCSV = () => {
    const headers = ['#', 'Registration Date', 'Submitted Email', ...questionFields.map((f) => f.label)]
    const rows = filteredRegistrations.map((reg, index) => {
      const rowData = [
        String(index + 1),
        formatDateTime(reg.created_at),
        reg.submitted_email ?? '',
        ...questionFields.map((f) => {
          const val = reg.answers?.[f.id]
          return formatAnswerValue(val)
        }),
      ]
      // Escape CSV values
      return rowData
        .map((cell) => `"${cell.replace(/"/g, '""')}"`)
        .join(',')
    })

    const csvContent = [headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','), ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${event.slug}-registrants.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const capacity = event.capacity
  const total = registrations.length
  const percent = capacity ? Math.min(100, Math.round((total / capacity) * 100)) : 0

  return (
    <div className="space-y-6">
      {/* Top Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-cream p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-navy)] opacity-60">
            Total Registrants
          </p>
          <p className="heading-display text-4xl text-[var(--color-navy)] mt-1">
            {total}
          </p>
        </div>
        <div className="card-cream p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-navy)] opacity-60">
            Capacity Limit
          </p>
          <p className="heading-display text-4xl text-[var(--color-navy)] mt-1">
            {capacity ? capacity : 'Unlimited'}
          </p>
        </div>
        <div className="card-cream p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-navy)] opacity-60">
            Capacity Filled
          </p>
          <div className="flex items-center gap-3 mt-1">
            <span className="heading-display text-4xl text-[var(--color-navy)]">
              {capacity ? `${percent}%` : 'N/A'}
            </span>
            {capacity && (
              <div className="flex-1 h-3 rounded-full bg-[var(--color-dusty-blue)]/20 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${percent}%`,
                    backgroundColor: percent >= 100 ? '#8b2424' : 'var(--color-navy)',
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            className="form-input !py-2 !pl-9"
            placeholder="Search registrants by any answer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <svg
            className="absolute left-3 top-3 w-4 h-4 opacity-40 text-[var(--color-navy)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* CSV Export Button */}
        <button
          onClick={exportToCSV}
          disabled={filteredRegistrations.length === 0}
          className="btn-primary !py-2 !px-4 text-xs shrink-0 self-start sm:self-auto disabled:opacity-40"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV ({filteredRegistrations.length})
        </button>
      </div>

      {/* Table Container */}
      <div className="card-cream rounded-2xl overflow-hidden shadow-card">
        {filteredRegistrations.length === 0 ? (
          <div className="p-12 text-center text-[var(--color-navy)]">
            <p className="font-semibold text-base">No registrations found</p>
            <p className="text-sm opacity-50 mt-1">
              {search ? 'Try adjusting your search criteria.' : 'Nobody has registered for this event yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[var(--color-navy)] text-[var(--color-cream)] text-xs uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold w-12 text-center">#</th>
                  <th
                    className="py-3 px-4 font-semibold cursor-pointer hover:bg-[var(--color-navy-secondary)] select-none"
                    onClick={() => handleSort('created_at')}
                  >
                    <div className="flex items-center gap-1.5">
                      Submitted At
                      {sortField === 'created_at' && (
                        <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  {questionFields.map((field) => (
                    <th
                      key={field.id}
                      className="py-3 px-4 font-semibold cursor-pointer hover:bg-[var(--color-navy-secondary)] select-none whitespace-nowrap"
                      onClick={() => handleSort(field.id)}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="truncate max-w-[180px]">{field.label}</span>
                        {sortField === field.id && (
                          <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="py-3 px-4 font-semibold text-right sticky right-0 bg-[var(--color-navy)]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-dusty-blue)]/20 text-[var(--color-navy)]">
                {filteredRegistrations.map((reg, idx) => (
                  <tr
                    key={reg.id}
                    className="hover:bg-[var(--color-dusty-blue)]/10 transition-colors"
                  >
                    <td className="py-3 px-4 text-center font-mono text-xs opacity-50">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-xs opacity-75">
                      {formatDateTime(reg.created_at)}
                    </td>
                    {questionFields.map((field) => {
                      const val = reg.answers?.[field.id]
                      return (
                        <td key={field.id} className="py-3 px-4 max-w-[200px] truncate text-xs">
                          {formatAnswerValue(val)}
                        </td>
                      )
                    })}
                    <td className="py-3 px-4 text-right whitespace-nowrap sticky right-0 bg-[var(--color-cream)]">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedRegistration(reg)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-pill bg-[var(--color-navy)] text-[var(--color-cream)] hover:bg-[var(--color-navy-secondary)] transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(reg.id)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-pill text-[#8b2424] bg-red-100 hover:bg-red-200 transition-colors"
                        >
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

      {/* View Single Submission Modal */}
      {selectedRegistration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="card-cream w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl shadow-float p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--color-dusty-blue)]/30 pb-3">
              <div>
                <h3 className="heading-section text-xl text-[var(--color-navy)]">
                  Submission Details
                </h3>
                <p className="text-xs opacity-50 text-[var(--color-navy)] mt-0.5">
                  Submitted on {formatDateTime(selectedRegistration.created_at)}
                </p>
              </div>
              <button
                onClick={() => setSelectedRegistration(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--color-dusty-blue)]/20 text-[var(--color-navy)] hover:bg-[var(--color-dusty-blue)]/40"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {questionFields.map((field) => (
                <div key={field.id} className="p-3.5 rounded-xl bg-white/60 border border-[var(--color-dusty-blue)]/20">
                  <p className="text-xs font-bold text-[var(--color-dusty-blue)] uppercase tracking-wider mb-1">
                    {field.label}
                  </p>
                  <p className="text-sm text-[var(--color-navy)] break-words whitespace-pre-wrap">
                    {formatAnswerValue(selectedRegistration.answers?.[field.id])}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={() => setSelectedRegistration(null)}
                className="btn-primary !py-2 !px-5 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="card-cream w-full max-w-sm rounded-2xl shadow-float p-6 space-y-4 text-center">
            <h3 className="heading-section text-xl text-[var(--color-navy)]">
              Delete Registration?
            </h3>
            <p className="text-sm text-[var(--color-navy)] opacity-70">
              This action cannot be undone. The registrant&apos;s data will be permanently removed.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="btn-secondary !py-2 !px-4 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                disabled={deletingId === confirmDeleteId}
                className="btn-danger !py-2 !px-4 text-xs"
              >
                {deletingId === confirmDeleteId ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
