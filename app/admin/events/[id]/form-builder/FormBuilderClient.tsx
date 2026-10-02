'use client'

import React, { useState, useCallback, useRef } from 'react'
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
import type { Event, FormField } from '@/types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FIELD_TYPE_LABELS: Record<FormField['field_type'], string> = {
  short_text: 'Short Text',
  long_text: 'Long Text',
  email: 'Email',
  phone: 'Phone',
  number: 'Number',
  date: 'Date',
  dropdown: 'Dropdown',
  radio: 'Radio',
  checkboxes: 'Checkboxes',
  yes_no: 'Yes / No',
  file_upload: 'File Upload',
  section_header: 'Section Header',
}

const FIELD_TYPE_COLORS: Record<FormField['field_type'], string> = {
  short_text: 'bg-blue-100 text-blue-700',
  long_text: 'bg-indigo-100 text-indigo-700',
  email: 'bg-green-100 text-green-700',
  phone: 'bg-teal-100 text-teal-700',
  number: 'bg-orange-100 text-orange-700',
  date: 'bg-yellow-100 text-yellow-800',
  dropdown: 'bg-purple-100 text-purple-700',
  radio: 'bg-pink-100 text-pink-700',
  checkboxes: 'bg-rose-100 text-rose-700',
  yes_no: 'bg-cyan-100 text-cyan-700',
  file_upload: 'bg-gray-100 text-gray-700',
  section_header: 'bg-[#edf2f5] text-[#2f475f] font-bold',
}

const ADD_FIELD_TYPES: Array<{ type: FormField['field_type']; label: string }> = [
  { type: 'short_text', label: 'Short Text' },
  { type: 'long_text', label: 'Long Text' },
  { type: 'email', label: 'Email' },
  { type: 'phone', label: 'Phone' },
  { type: 'number', label: 'Number' },
  { type: 'date', label: 'Date' },
  { type: 'dropdown', label: 'Dropdown' },
  { type: 'radio', label: 'Radio' },
  { type: 'checkboxes', label: 'Checkboxes' },
  { type: 'yes_no', label: 'Yes / No' },
  { type: 'file_upload', label: 'File Upload' },
]

const PLACEHOLDER_TYPES: Array<FormField['field_type']> = [
  'short_text', 'long_text', 'email', 'phone', 'number', 'date',
]

const OPTIONS_TYPES: Array<FormField['field_type']> = [
  'dropdown', 'radio', 'checkboxes',
]

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function makeNewField(
  eventId: string,
  type: FormField['field_type'],
  sortOrder: number
): FormField {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    event_id: eventId,
    field_type: type,
    label: type === 'section_header' ? 'Section Header' : '',
    help_text: null,
    placeholder: null,
    required: false,
    options: OPTIONS_TYPES.includes(type)
      ? [{ id: crypto.randomUUID(), label: 'Option 1' }]
      : null,
    sort_order: sortOrder,
    created_at: now,
    updated_at: now,
  }
}

// ---------------------------------------------------------------------------
// SortableField row
// ---------------------------------------------------------------------------

interface SortableFieldProps {
  field: FormField
  isSelected: boolean
  onSelect: () => void
  onDuplicate: () => void
  onDelete: () => void
}

function SortableField({
  field,
  isSelected,
  onSelect,
  onDuplicate,
  onDelete,
}: SortableFieldProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  }

  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`group flex items-center gap-2 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors select-none ${
        isSelected
          ? 'border-[--color-navy] bg-[--color-pale-blue]'
          : 'border-transparent bg-white hover:border-[--color-dusty-blue] hover:bg-[--color-pale-blue]/60'
      }`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="shrink-0 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 p-0.5 rounded"
        aria-label="Drag to reorder"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path d="M7 2a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM7 8.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM7 15a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
        </svg>
      </button>

      {/* Label + type badge */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${field.label ? 'text-gray-900' : 'text-gray-400 italic'}`}>
          {field.label || '(No label)'}
        </p>
        <span className={`inline-block mt-0.5 rounded px-1.5 py-0.5 text-[10px] font-semibold leading-none ${FIELD_TYPE_COLORS[field.field_type]}`}>
          {FIELD_TYPE_LABELS[field.field_type]}
        </span>
      </div>

      {/* Actions */}
      <div
        className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Duplicate */}
        <button
          onClick={onDuplicate}
          title="Duplicate"
          className="p-1 rounded text-gray-400 hover:text-[--color-navy] hover:bg-[--color-pale-blue]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
            <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
          </svg>
        </button>

        {/* Delete */}
        {confirmDelete ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() => { onDelete(); setConfirmDelete(false) }}
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
            title="Delete"
            className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// FormPreview
// ---------------------------------------------------------------------------

function FormPreview({ fields }: { fields: FormField[] }) {
  return (
    <div className="space-y-5">
      {fields.map((field) => {
        if (field.field_type === 'section_header') {
          return (
            <div key={field.id} className="pt-2 pb-1 border-b-2 border-[--color-dusty-blue]">
              <h3 className="heading-section text-[--color-navy]">{field.label || 'Section Header'}</h3>
              {field.help_text && <p className="form-help mt-1">{field.help_text}</p>}
            </div>
          )
        }

        return (
          <div key={field.id} className="space-y-1">
            <label className="form-label">
              {field.label || <span className="italic text-gray-400">(No label)</span>}
              {field.required && <span className="ml-1 text-red-500">*</span>}
            </label>
            {field.help_text && <p className="form-help">{field.help_text}</p>}

            {/* Input preview */}
            {(field.field_type === 'short_text' || field.field_type === 'email' || field.field_type === 'phone' || field.field_type === 'number') && (
              <input
                type="text"
                disabled
                placeholder={field.placeholder ?? ''}
                className="form-input opacity-60 cursor-not-allowed"
              />
            )}
            {field.field_type === 'long_text' && (
              <textarea
                disabled
                placeholder={field.placeholder ?? ''}
                className="form-input resize-none h-24 opacity-60 cursor-not-allowed"
              />
            )}
            {field.field_type === 'date' && (
              <input type="date" disabled className="form-input opacity-60 cursor-not-allowed" />
            )}
            {field.field_type === 'dropdown' && (
              <select disabled className="form-input opacity-60 cursor-not-allowed">
                <option value="">{field.placeholder || 'Select an option…'}</option>
                {field.options?.map((opt) => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
            )}
            {(field.field_type === 'radio' || field.field_type === 'checkboxes') && (
              <div className="space-y-1.5 pl-1">
                {(field.options ?? []).map((opt) => (
                  <label key={opt.id} className="flex items-center gap-2 text-sm text-gray-700 cursor-not-allowed">
                    <input
                      type={field.field_type === 'radio' ? 'radio' : 'checkbox'}
                      disabled
                      className="h-4 w-4 accent-[--color-navy]"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            )}
            {field.field_type === 'yes_no' && (
              <div className="flex gap-4 pl-1">
                {['Yes', 'No'].map((v) => (
                  <label key={v} className="flex items-center gap-2 text-sm text-gray-700 cursor-not-allowed">
                    <input type="radio" disabled className="h-4 w-4 accent-[--color-navy]" />
                    {v}
                  </label>
                ))}
              </div>
            )}
            {field.field_type === 'file_upload' && (
              <div className="flex items-center justify-center w-full h-20 rounded-lg border-2 border-dashed border-[--color-dusty-blue] bg-[--color-pale-blue] text-sm text-gray-400 cursor-not-allowed">
                Click or drag to upload a file
              </div>
            )}
          </div>
        )
      })}
      {fields.length === 0 && (
        <p className="text-center text-gray-400 py-12 italic">
          No fields yet. Add fields using the toolbar above.
        </p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// FieldEditor
// ---------------------------------------------------------------------------

interface FieldEditorProps {
  field: FormField
  onChange: (updated: FormField) => void
  emailFieldId: string | null
  onEmailFieldChange: (id: string | null) => void
  showEmailSelect: boolean
  allEmailFields: FormField[]
}

function FieldEditor({
  field,
  onChange,
  emailFieldId,
  onEmailFieldChange,
  showEmailSelect,
  allEmailFields,
}: FieldEditorProps) {
  const update = (patch: Partial<FormField>) => onChange({ ...field, ...patch })

  const addOption = () => {
    const existing = field.options ?? []
    update({ options: [...existing, { id: crypto.randomUUID(), label: '' }] })
  }

  const updateOption = (idx: number, label: string) => {
    const opts = [...(field.options ?? [])]
    opts[idx] = { ...opts[idx], label }
    update({ options: opts })
  }

  const removeOption = (idx: number) => {
    const opts = [...(field.options ?? [])]
    opts.splice(idx, 1)
    update({ options: opts })
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-[--color-navy] text-sm uppercase tracking-wide">
        Edit Field — <span className={`rounded px-1.5 py-0.5 ${FIELD_TYPE_COLORS[field.field_type]}`}>{FIELD_TYPE_LABELS[field.field_type]}</span>
      </h3>

      {/* Label */}
      <div>
        <label className="form-label">
          Label {field.field_type !== 'section_header' && <span className="text-red-500">*</span>}
        </label>
        <input
          type="text"
          className="form-input"
          value={field.label}
          onChange={(e) => update({ label: e.target.value })}
          placeholder="Enter field label…"
        />
      </div>

      {/* Help text */}
      <div>
        <label className="form-label">Help Text</label>
        <input
          type="text"
          className="form-input"
          value={field.help_text ?? ''}
          onChange={(e) => update({ help_text: e.target.value || null })}
          placeholder="Optional description shown below the label"
        />
      </div>

      {/* Placeholder (applicable types only) */}
      {PLACEHOLDER_TYPES.includes(field.field_type) && (
        <div>
          <label className="form-label">Placeholder</label>
          <input
            type="text"
            className="form-input"
            value={field.placeholder ?? ''}
            onChange={(e) => update({ placeholder: e.target.value || null })}
            placeholder="Placeholder text…"
          />
        </div>
      )}

      {/* Required */}
      {field.field_type !== 'section_header' && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={field.required}
            onClick={() => update({ required: !field.required })}
            className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-200 focus:outline-none ${
              field.required ? 'bg-[--color-navy]' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 mt-0.5 ${
                field.required ? 'translate-x-4' : 'translate-x-0.5'
              }`}
            />
          </button>
          <label className="form-label mb-0 cursor-pointer" onClick={() => update({ required: !field.required })}>
            Required field
          </label>
        </div>
      )}

      {/* Options (dropdown / radio / checkboxes) */}
      {OPTIONS_TYPES.includes(field.field_type) && (
        <div>
          <label className="form-label">Options</label>
          <div className="space-y-2">
            {(field.options ?? []).map((opt, idx) => (
              <div key={opt.id} className="flex items-center gap-2">
                <span className="text-gray-400 text-sm w-5 text-right">{idx + 1}.</span>
                <input
                  type="text"
                  className="form-input"
                  value={opt.label}
                  onChange={(e) => updateOption(idx, e.target.value)}
                  placeholder={`Option ${idx + 1}`}
                />
                <button
                  onClick={() => removeOption(idx)}
                  className="shrink-0 p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50"
                  title="Remove option"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addOption}
            className="mt-2 text-sm text-[--color-navy] hover:underline flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            Add option
          </button>
        </div>
      )}

      {/* Email field selector */}
      {showEmailSelect && field.field_type === 'email' && (
        <div className="rounded-lg border border-[--color-dusty-blue] bg-[--color-pale-blue] p-3">
          <label className="form-label">Duplicate Submission Email Field</label>
          <p className="form-help mb-2">
            This event has "one submission per email" enabled. Select which email field is used to detect duplicates.
          </p>
          <select
            className="form-input"
            value={emailFieldId ?? ''}
            onChange={(e) => onEmailFieldChange(e.target.value || null)}
          >
            <option value="">— None —</option>
            {allEmailFields.map((f) => (
              <option key={f.id} value={f.id}>{f.label || f.id}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// CopyFromEventModal
// ---------------------------------------------------------------------------

interface OtherEvent {
  id: string
  title: string
  slug: string
}

interface CopyFromEventModalProps {
  currentEventId: string
  onCopy: (fields: FormField[]) => void
  onClose: () => void
}

function CopyFromEventModal({ currentEventId, onCopy, onClose }: CopyFromEventModalProps) {
  const [events, setEvents] = useState<OtherEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedId, setSelectedId] = useState<string>('')
  const [fetched, setFetched] = useState(false)
  const [copying, setCopying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadEvents = useCallback(async () => {
    if (fetched) return
    setLoading(true)
    try {
      const res = await fetch('/api/admin/events')
      if (!res.ok) throw new Error('Failed to load events')
      const data: OtherEvent[] = await res.json()
      setEvents(data.filter((e) => e.id !== currentEventId))
      setFetched(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [fetched, currentEventId])

  React.useEffect(() => { loadEvents() }, [loadEvents])

  const handleCopy = async () => {
    if (!selectedId) return
    setCopying(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/events/${selectedId}/fields`)
      if (!res.ok) throw new Error('Failed to load fields from selected event')
      const data: FormField[] = await res.json()
      const now = new Date().toISOString()
      const mapped = data.map((f, idx) => ({
        ...f,
        id: crypto.randomUUID(),
        event_id: currentEventId,
        sort_order: idx,
        created_at: now,
        updated_at: now,
      }))
      onCopy(mapped)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setCopying(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="card-cream w-full max-w-md rounded-xl shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="heading-section text-[--color-navy]">Copy From Event</h2>
          <button onClick={onClose} className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Select an event to copy its form fields into this form. This will <strong>append</strong> the copied fields after existing fields.
        </p>

        {loading && <p className="text-sm text-gray-500 py-4 text-center">Loading events…</p>}
        {error && <p className="form-error mb-3">{error}</p>}

        {!loading && events.length === 0 && fetched && (
          <p className="text-sm text-gray-400 italic text-center py-4">No other events found.</p>
        )}

        {!loading && events.length > 0 && (
          <div className="space-y-1 max-h-56 overflow-y-auto border border-gray-200 rounded-lg p-2 mb-4">
            {events.map((ev) => (
              <label
                key={ev.id}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                  selectedId === ev.id
                    ? 'bg-[--color-pale-blue] border border-[--color-navy]'
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <input
                  type="radio"
                  name="copy-event"
                  value={ev.id}
                  checked={selectedId === ev.id}
                  onChange={() => setSelectedId(ev.id)}
                  className="h-4 w-4 accent-[--color-navy]"
                />
                <span className="text-sm font-medium text-gray-800">{ev.title}</span>
              </label>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button
            onClick={handleCopy}
            disabled={!selectedId || copying}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {copying ? 'Copying…' : 'Copy Fields'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main FormBuilderClient
// ---------------------------------------------------------------------------

export default function FormBuilderClient({
  event,
  initialFields,
}: {
  event: Event
  initialFields: FormField[]
}) {
  const [fields, setFields] = useState<FormField[]>(initialFields)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [showCopyModal, setShowCopyModal] = useState(false)
  const [emailFieldId, setEmailFieldId] = useState<string | null>(event.email_field_id)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const addMenuRef = useRef<HTMLDivElement>(null)

  const isDisabled = event.registration_mode !== 'internal'

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // Close add menu on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) {
        setShowAddMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selectedField = fields.find((f) => f.id === selectedId) ?? null
  const emailFields = fields.filter((f) => f.field_type === 'email')

  // Drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setFields((prev) => {
      const oldIndex = prev.findIndex((f) => f.id === active.id)
      const newIndex = prev.findIndex((f) => f.id === over.id)
      return arrayMove(prev, oldIndex, newIndex).map((f, i) => ({
        ...f,
        sort_order: i,
      }))
    })
  }

  // Add field
  const addField = (type: FormField['field_type']) => {
    const newField = makeNewField(event.id, type, fields.length)
    setFields((prev) => [...prev, newField])
    setSelectedId(newField.id)
    setShowAddMenu(false)
    setShowPreview(false)
  }

  // Duplicate field
  const duplicateField = (id: string) => {
    const idx = fields.findIndex((f) => f.id === id)
    if (idx === -1) return
    const orig = fields[idx]
    const dup: FormField = {
      ...orig,
      id: crypto.randomUUID(),
      label: orig.label ? `${orig.label} (copy)` : '',
      sort_order: idx + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setFields((prev) => {
      const next = [...prev]
      next.splice(idx + 1, 0, dup)
      return next.map((f, i) => ({ ...f, sort_order: i }))
    })
    setSelectedId(dup.id)
  }

  // Delete field
  const deleteField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id).map((f, i) => ({ ...f, sort_order: i })))
    if (selectedId === id) setSelectedId(null)
  }

  // Update field
  const updateField = (updated: FormField) => {
    setFields((prev) => prev.map((f) => (f.id === updated.id ? updated : f)))
  }

  // Copy from event — append
  const handleCopyFields = (copied: FormField[]) => {
    setFields((prev) => {
      const merged = [
        ...prev,
        ...copied.map((f, i) => ({ ...f, sort_order: prev.length + i })),
      ]
      return merged
    })
  }

  // Save
  const handleSave = async () => {
    setSaving(true)
    setSaveStatus('idle')
    try {
      const payload = fields.map((f, i) => ({ ...f, sort_order: i }))
      const res = await fetch(`/api/admin/events/${event.id}/fields`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: payload }),
      })
      if (!res.ok) throw new Error('Save failed')

      // If one_submission_per_email, also save emailFieldId
      if (event.one_submission_per_email) {
        await fetch(`/api/admin/events/${event.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email_field_id: emailFieldId }),
        })
      }

      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch {
      setSaveStatus('error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={`${isDisabled ? 'pointer-events-none opacity-60' : ''}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {/* Add Field dropdown */}
        <div className="relative" ref={addMenuRef}>
          <button
            onClick={() => setShowAddMenu((v) => !v)}
            className="btn-primary flex items-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            Add Field
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
          </button>
          {showAddMenu && (
            <div className="absolute left-0 top-full mt-1 z-30 w-48 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden py-1">
              {ADD_FIELD_TYPES.map(({ type, label }) => (
                <button
                  key={type}
                  onClick={() => addField(type)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-[--color-pale-blue] text-gray-800 flex items-center gap-2"
                >
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${FIELD_TYPE_COLORS[type]}`}>
                    {FIELD_TYPE_LABELS[type]}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Section header */}
        <button
          onClick={() => addField('section_header')}
          className="btn-secondary flex items-center gap-1.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M3.5 2A1.5 1.5 0 002 3.5V5c0 1.149.15 2.263.43 3.326a13.022 13.022 0 009.244 9.244c1.063.28 2.177.43 3.326.43h1.5a1.5 1.5 0 001.5-1.5v-1.148a1.5 1.5 0 00-1.175-1.465l-3.223-.716a1.5 1.5 0 00-1.767 1.052l-.267.933c-.117.41-.555.643-.95.48a11.542 11.542 0 01-6.254-6.254c-.163-.395.07-.833.48-.95l.933-.267a1.5 1.5 0 001.052-1.767l-.716-3.223A1.5 1.5 0 004.648 2H3.5z" />
          </svg>
          Add Section
        </button>

        {/* Preview toggle */}
        <button
          onClick={() => { setShowPreview((v) => !v); setSelectedId(null) }}
          className={`btn-secondary flex items-center gap-1.5 ${showPreview ? 'bg-[--color-pale-blue] text-[--color-navy]' : ''}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
            <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41z" clipRule="evenodd" />
          </svg>
          {showPreview ? 'Close Preview' : 'Preview'}
        </button>

        {/* Copy from event */}
        <button
          onClick={() => setShowCopyModal(true)}
          className="btn-secondary flex items-center gap-1.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
            <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
          </svg>
          Copy from Event
        </button>

        <div className="flex-1" />

        {/* Save button */}
        <div className="flex items-center gap-3">
          {saveStatus === 'saved' && (
            <span className="text-green-600 text-sm font-medium flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
              Saved
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-red-600 text-sm font-medium">Save failed — try again</span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Saving…
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
                  <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
                </svg>
                Save Form
              </>
            )}
          </button>
        </div>
      </div>

      {/* One-submission email field selector (shown in toolbar area) */}
      {event.one_submission_per_email && emailFields.length > 0 && (
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-[--color-dusty-blue] bg-[--color-pale-blue] px-4 py-2.5">
          <span className="text-sm font-medium text-[--color-navy] shrink-0">
            Email field for duplicate detection:
          </span>
          <select
            className="form-input flex-1"
            value={emailFieldId ?? ''}
            onChange={(e) => setEmailFieldId(e.target.value || null)}
          >
            <option value="">— None —</option>
            {emailFields.map((f) => (
              <option key={f.id} value={f.id}>{f.label || f.id}</option>
            ))}
          </select>
        </div>
      )}

      {/* Main 2-panel layout */}
      <div className="flex gap-4 min-h-[600px]">
        {/* LEFT: Field list */}
        <div className="w-72 shrink-0 flex flex-col gap-2 bg-white rounded-xl border border-gray-200 p-3 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1 mb-1">
            {fields.length} field{fields.length !== 1 ? 's' : ''}
          </p>
          {fields.length === 0 && (
            <p className="text-sm text-gray-400 italic text-center py-8 px-2">
              No fields yet. Use the toolbar to add fields.
            </p>
          )}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
              {fields.map((field) => (
                <SortableField
                  key={field.id}
                  field={field}
                  isSelected={selectedId === field.id}
                  onSelect={() => { setSelectedId(field.id); setShowPreview(false) }}
                  onDuplicate={() => duplicateField(field.id)}
                  onDelete={() => deleteField(field.id)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        {/* RIGHT: Editor or Preview */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 p-5 overflow-y-auto">
          {showPreview ? (
            <div>
              <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-200">
                <h2 className="heading-section text-[--color-navy]">Live Preview</h2>
                <span className="pill pill-dusty">Read-only</span>
              </div>
              <FormPreview fields={fields} />
            </div>
          ) : selectedField ? (
            <FieldEditor
              field={selectedField}
              onChange={updateField}
              emailFieldId={emailFieldId}
              onEmailFieldChange={setEmailFieldId}
              showEmailSelect={event.one_submission_per_email}
              allEmailFields={emailFields}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 gap-3 py-20">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor" className="w-16 h-16 text-[--color-dusty-blue]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
              <p className="font-medium text-gray-500">Select a field to edit it</p>
              <p className="text-sm text-gray-400">Or click "Preview" to see the form as users will see it.</p>
            </div>
          )}
        </div>
      </div>

      {/* Copy from event modal */}
      {showCopyModal && (
        <CopyFromEventModal
          currentEventId={event.id}
          onCopy={handleCopyFields}
          onClose={() => setShowCopyModal(false)}
        />
      )}
    </div>
  )
}
