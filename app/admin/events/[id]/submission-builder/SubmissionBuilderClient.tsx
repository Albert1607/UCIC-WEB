'use client'

import React, { useState, useRef } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Event, SubmissionField, SubmissionFieldType } from '@/types'

const FIELD_LABELS: Record<SubmissionFieldType, string> = {
  short_text: 'Short Text',
  long_text: 'Long Text',
  url: 'URL / Link',
  file_upload: 'File Upload',
}

const FIELD_COLORS: Record<SubmissionFieldType, string> = {
  short_text: 'bg-blue-100 text-blue-700',
  long_text: 'bg-indigo-100 text-indigo-700',
  url: 'bg-green-100 text-green-700',
  file_upload: 'bg-orange-100 text-orange-700',
}

const COMMON_FILE_TYPES = ['pdf', 'zip', 'jpg', 'jpeg', 'png', 'mp4', 'docx', 'pptx', 'xlsx']

function makeField(eventId: string, type: SubmissionFieldType, order: number): SubmissionField {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    event_id: eventId,
    field_type: type,
    label: '',
    help_text: null,
    placeholder: null,
    required: false,
    allowed_file_types: type === 'file_upload' ? ['pdf', 'zip'] : null,
    max_file_size_mb: type === 'file_upload' ? 50 : null,
    sort_order: order,
    created_at: now,
    updated_at: now,
  }
}

function SortableRow({
  field,
  isSelected,
  onSelect,
  onDelete,
}: {
  field: SubmissionField
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
  })
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      onClick={onSelect}
      className={`group flex items-center gap-2 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors select-none ${
        isSelected
          ? 'border-[var(--color-navy)] bg-[var(--color-pale-blue)]'
          : 'border-transparent bg-white hover:border-[var(--color-dusty-blue)] hover:bg-[var(--color-pale-blue)]/60'
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="shrink-0 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 p-0.5 rounded"
        aria-label="Drag to reorder"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4"
        >
          <path d="M7 2a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM7 8.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM7 15a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
        </svg>
      </button>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium truncate ${
            field.label ? 'text-gray-900' : 'text-gray-400 italic'
          }`}
        >
          {field.label || '(No label yet)'}
        </p>
        <span
          className={`inline-block mt-0.5 rounded px-1.5 py-0.5 text-[10px] font-semibold leading-none ${FIELD_COLORS[field.field_type]}`}
        >
          {FIELD_LABELS[field.field_type]}
        </span>
      </div>
      <div
        className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        {confirmDelete ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                onDelete()
                setConfirmDelete(false)
              }}
              className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-red-500 text-white hover:bg-red-600"
            >
              Delete
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            title="Delete field"
            className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-3.5 h-3.5"
            >
              <path
                fillRule="evenodd"
                d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

function FieldEditor({
  field,
  onChange,
}: {
  field: SubmissionField
  onChange: (f: SubmissionField) => void
}) {
  const up = (patch: Partial<SubmissionField>) => onChange({ ...field, ...patch })

  const toggleFileType = (ext: string) => {
    const current = field.allowed_file_types ?? []
    up({
      allowed_file_types: current.includes(ext)
        ? current.filter((t) => t !== ext)
        : [...current, ext],
    })
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-[var(--color-navy)] text-sm uppercase tracking-wide">
        Edit —{' '}
        <span className={`rounded px-1.5 py-0.5 ${FIELD_COLORS[field.field_type]}`}>
          {FIELD_LABELS[field.field_type]}
        </span>
      </h3>

      <div>
        <label className="form-label">
          Label <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          className="form-input"
          value={field.label}
          onChange={(e) => up({ label: e.target.value })}
          placeholder="Enter field label…"
        />
      </div>

      <div>
        <label className="form-label">Help Text</label>
        <input
          type="text"
          className="form-input"
          value={field.help_text ?? ''}
          onChange={(e) => up({ help_text: e.target.value || null })}
          placeholder="Optional description shown below the field…"
        />
      </div>

      {(field.field_type === 'short_text' || field.field_type === 'url') && (
        <div>
          <label className="form-label">Placeholder</label>
          <input
            type="text"
            className="form-input"
            value={field.placeholder ?? ''}
            onChange={(e) => up({ placeholder: e.target.value || null })}
            placeholder="Placeholder text…"
          />
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={field.required}
          onClick={() => up({ required: !field.required })}
          className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ${
            field.required ? 'bg-[var(--color-navy)]' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 mt-0.5 ${
              field.required ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </button>
        <label
          className="form-label mb-0 cursor-pointer"
          onClick={() => up({ required: !field.required })}
        >
          Required field
        </label>
      </div>

      {field.field_type === 'file_upload' && (
        <div className="space-y-3">
          <div>
            <label className="form-label">Allowed File Types</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {COMMON_FILE_TYPES.map((ext) => {
                const checked = (field.allowed_file_types ?? []).includes(ext)
                return (
                  <button
                    key={ext}
                    type="button"
                    onClick={() => toggleFileType(ext)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
                      checked
                        ? 'bg-[var(--color-navy)] text-[var(--color-cream)] border-[var(--color-navy)]'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-[var(--color-dusty-blue)]'
                    }`}
                  >
                    .{ext}
                  </button>
                )
              })}
            </div>
            <p className="form-help mt-1">Leave all unchecked to allow any file type.</p>
          </div>
          <div>
            <label className="form-label">Max File Size (MB)</label>
            <input
              type="number"
              min={1}
              max={500}
              className="form-input"
              value={field.max_file_size_mb ?? 50}
              onChange={(e) => up({ max_file_size_mb: Number(e.target.value) || 50 })}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default function SubmissionBuilderClient({
  event,
  initialFields,
}: {
  event: Event
  initialFields: SubmissionField[]
}) {
  const [fields, setFields] = useState<SubmissionField[]>(initialFields)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const menuRef = useRef<HTMLDivElement>(null)

  const isDisabled = !event.requires_submission

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowAddMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selectedField = fields.find((f) => f.id === selectedId) ?? null

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    setFields((prev) => {
      const oldIdx = prev.findIndex((f) => f.id === active.id)
      const newIdx = prev.findIndex((f) => f.id === over.id)
      return arrayMove(prev, oldIdx, newIdx).map((f, i) => ({ ...f, sort_order: i }))
    })
  }

  const addField = (type: SubmissionFieldType) => {
    const f = makeField(event.id, type, fields.length)
    setFields((prev) => [...prev, f])
    setSelectedId(f.id)
    setShowAddMenu(false)
  }

  const deleteField = (id: string) => {
    setFields((prev) =>
      prev.filter((f) => f.id !== id).map((f, i) => ({ ...f, sort_order: i }))
    )
    if (selectedId === id) setSelectedId(null)
  }

  const updateField = (updated: SubmissionField) => {
    setFields((prev) => prev.map((f) => (f.id === updated.id ? updated : f)))
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveStatus('idle')
    try {
      const res = await fetch(`/api/admin/events/${event.id}/submission-fields`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: fields.map((f, i) => ({ ...f, sort_order: i })) }),
      })
      if (!res.ok) throw new Error('Save failed')
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch {
      setSaveStatus('error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={isDisabled ? 'pointer-events-none opacity-50' : ''}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setShowAddMenu((v) => !v)}
            className="btn-primary flex items-center gap-1.5"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            Add Field
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-3.5 h-3.5"
            >
              <path
                fillRule="evenodd"
                d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          {showAddMenu && (
            <div className="absolute left-0 top-full mt-1 z-30 w-48 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden py-1">
              {(Object.entries(FIELD_LABELS) as [SubmissionFieldType, string][]).map(
                ([type, label]) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => addField(type)}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--color-pale-blue)] text-gray-800 flex items-center gap-2"
                  >
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${FIELD_COLORS[type]}`}
                    >
                      {label}
                    </span>
                  </button>
                )
              )}
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {saveStatus === 'saved' && (
            <span className="text-sm text-green-600 font-medium">✓ Saved</span>
          )}
          {saveStatus === 'error' && (
            <span className="text-sm text-red-600 font-medium">Save failed — try again</span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn-primary disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {/* Builder layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Fields list */}
        <div className="lg:col-span-3 card-cream rounded-2xl p-4 min-h-[300px]">
          {fields.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center">
              <p className="text-gray-400 italic text-sm">
                No fields yet. Click &quot;Add Field&quot; to get started.
              </p>
              <p className="text-gray-300 text-xs mt-2">
                Drag to reorder · Click to edit
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={fields.map((f) => f.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-1.5">
                  {fields.map((f) => (
                    <SortableRow
                      key={f.id}
                      field={f}
                      isSelected={f.id === selectedId}
                      onSelect={() => setSelectedId(f.id)}
                      onDelete={() => deleteField(f.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* Field editor panel */}
        <div className="lg:col-span-2">
          {selectedField ? (
            <div className="card-cream rounded-2xl p-5 sticky top-24">
              <FieldEditor field={selectedField} onChange={updateField} />
            </div>
          ) : (
            <div className="card-cream rounded-2xl p-5 flex flex-col items-center justify-center min-h-[200px] text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-8 h-8 text-gray-300 mb-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
                />
              </svg>
              <p className="text-sm text-gray-400 italic">Select a field to edit its settings</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
