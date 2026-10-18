'use client'

import { useState, useEffect, useRef, useCallback, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Event } from '@/types'
import HyperlinkButton from './HyperlinkButton'
import { generateSlug } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface EventFormProps {
  initialEvent?: Event
}

type FormData = {
  title: string
  slug: string
  description: string
  date: string
  end_date: string
  location: string
  capacity: string
  deadline: string
  registration_mode: 'none' | 'internal' | 'external'
  external_registration_url: string
  one_submission_per_email: boolean
  cover_image_url: string
  is_published: boolean
  requires_submission: boolean
  submission_deadline: string
  submission_instructions: string
  post_registration_message: string
}

function toLocalDatetimeValue(isoString: string | null | undefined): string {
  if (!isoString) return ''
  // Convert UTC ISO string to GMT+7 (Asia/Jakarta) for datetime-local input
  try {
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return ''
    // Get the date/time parts in Jakarta timezone
    const jakarta = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }))
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${jakarta.getFullYear()}-${pad(jakarta.getMonth() + 1)}-${pad(jakarta.getDate())}T${pad(jakarta.getHours())}:${pad(jakarta.getMinutes())}`
  } catch {
    return ''
  }
}

// ---------------------------------------------------------------------------
// RichTextEditor — lightweight contentEditable toolbar (bold/italic/underline/link)
// ---------------------------------------------------------------------------

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
}

function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [showLinkPopup, setShowLinkPopup] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkText, setLinkText] = useState('')
  const savedRange = useRef<Range | null>(null)

  // Sync initial value into the editor
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }, [onChange])

  const exec = (command: string, value?: string) => {
    editorRef.current?.focus()
    document.execCommand(command, false, value)
    handleInput()
  }

  const saveSelection = () => {
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) {
      savedRange.current = sel.getRangeAt(0).cloneRange()
    }
  }

  const restoreSelection = () => {
    const sel = window.getSelection()
    if (savedRange.current && sel) {
      sel.removeAllRanges()
      sel.addRange(savedRange.current)
    }
  }

  const handleInsertLink = () => {
    const url = linkUrl.trim()
    if (!url) { setShowLinkPopup(false); return }
    restoreSelection()
    const sel = window.getSelection()
    const hasText = sel && !sel.isCollapsed
    if (hasText) {
      exec('createLink', url)
    } else {
      const text = linkText.trim() || url
      const html = `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`
      exec('insertHTML', html)
    }
    setShowLinkPopup(false)
    setLinkUrl('')
    setLinkText('')
  }

  const ToolbarBtn = ({ command, title, children }: { command?: string; title: string; children: React.ReactNode; onClick?: () => void }) => (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); if (command) exec(command) }}
      className="p-1.5 rounded text-gray-600 hover:text-[var(--color-navy)] hover:bg-[var(--color-pale-blue)] transition-colors"
    >
      {children}
    </button>
  )

  return (
    <div className="border border-[var(--color-dusty-blue)]/40 rounded-xl overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-[var(--color-dusty-blue)]/20 bg-[var(--color-pale-blue)]/30">
        <ToolbarBtn command="bold" title="Bold (Ctrl+B)">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M6 4h4.5a3.5 3.5 0 110 7H6V4zm0 7h5a3.5 3.5 0 110 7H6v-7z" /></svg>
        </ToolbarBtn>
        <ToolbarBtn command="italic" title="Italic (Ctrl+I)">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M8 4h6M6 16h6M11 4l-2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>
        </ToolbarBtn>
        <ToolbarBtn command="underline" title="Underline (Ctrl+U)">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M5 4v6a5 5 0 0010 0V4M4 17h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>
        </ToolbarBtn>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        {/* Link button */}
        <div className="relative">
          <button
            type="button"
            title="Insert Link"
            onMouseDown={(e) => { e.preventDefault(); saveSelection(); setShowLinkPopup(v => !v) }}
            className="p-1.5 rounded text-gray-600 hover:text-[var(--color-navy)] hover:bg-[var(--color-pale-blue)] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M12.232 4.232a2.5 2.5 0 013.536 3.536l-1.225 1.224a.75.75 0 001.061 1.06l1.224-1.224a4 4 0 00-5.656-5.656l-3 3a4 4 0 00.225 5.865.75.75 0 00.977-1.138 2.5 2.5 0 01-.142-3.667l3-3z" />
              <path d="M11.603 7.963a.75.75 0 00-.977 1.138 2.5 2.5 0 01.142 3.667l-3 3a2.5 2.5 0 01-3.536-3.536l1.225-1.224a.75.75 0 00-1.061-1.06l-1.224 1.224a4 4 0 105.656 5.656l3-3a4 4 0 00-.225-5.865z" />
            </svg>
          </button>
          {showLinkPopup && (
            <div className="absolute left-0 top-full mt-1 z-30 bg-white border border-gray-200 shadow-lg rounded-lg p-3 w-64 space-y-2">
              <p className="text-xs font-semibold text-gray-600">Insert Link</p>
              <input
                type="text"
                className="form-input text-sm"
                placeholder="Link text (if no selection)"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
              />
              <input
                type="url"
                className="form-input text-sm"
                placeholder="https://..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleInsertLink() }}
                autoFocus
              />
              <div className="flex gap-2">
                <button type="button" onClick={handleInsertLink} disabled={!linkUrl}
                  className="btn-primary !py-1 !px-3 text-xs flex-1 disabled:opacity-50">
                  Insert
                </button>
                <button type="button" onClick={() => setShowLinkPopup(false)}
                  className="btn-secondary !py-1 !px-3 text-xs">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <ToolbarBtn command="removeFormat" title="Clear Formatting">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M5 4h10M8 4l1 12M12 4l-1 12M4 16h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>
        </ToolbarBtn>
      </div>
      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleInput}
        className="min-h-[120px] p-3 text-sm text-[var(--color-navy)] focus:outline-none leading-relaxed"
        style={{ fontFamily: 'inherit' }}
        data-placeholder="Describe the event... Select text to bold/italic/underline, or use the link button to insert clickable links."
      />
      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #aaa;
          pointer-events: none;
        }
      `}</style>
    </div>
  )
}

export default function EventForm({ initialEvent }: EventFormProps) {

  const router = useRouter()
  const isEditing = !!initialEvent
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(isEditing)

  const [form, setForm] = useState<FormData>({
    title: initialEvent?.title ?? '',
    slug: initialEvent?.slug ?? '',
    description: initialEvent?.description ?? '',
    date: toLocalDatetimeValue(initialEvent?.date),
    end_date: toLocalDatetimeValue(initialEvent?.end_date),
    location: initialEvent?.location ?? '',
    capacity: initialEvent?.capacity != null ? String(initialEvent.capacity) : '',
    deadline: toLocalDatetimeValue(initialEvent?.deadline),
    registration_mode: initialEvent?.registration_mode ?? 'none',
    external_registration_url: initialEvent?.external_registration_url ?? '',
    one_submission_per_email: initialEvent?.one_submission_per_email ?? false,
    cover_image_url: initialEvent?.cover_image_url ?? '',
    is_published: initialEvent?.is_published ?? false,
    requires_submission: initialEvent?.requires_submission ?? false,
    submission_deadline: toLocalDatetimeValue(initialEvent?.submission_deadline),
    submission_instructions: initialEvent?.submission_instructions ?? '',
    post_registration_message: initialEvent?.post_registration_message ?? '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageUploading, setImageUploading] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugManuallyEdited && form.title) {
      setForm(prev => ({ ...prev, slug: generateSlug(form.title) }))
    }
  }, [form.title, slugManuallyEdited])

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target
    const key = target.name as keyof FormData
    const value =
      target instanceof HTMLInputElement && target.type === 'checkbox'
        ? target.checked
        : target.value
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const handleSlugChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSlugManuallyEdited(true)
    setForm(prev => ({ ...prev, slug: e.target.value }))
  }

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImageUploading(true)
    setImageError(null)

    try {
      const supabase = createClient()
      // Use a temporary ID for new events, or the real event id for existing
      const bucket = 'event-covers'
      const eventFolder = initialEvent?.id ?? `tmp-${Date.now()}`
      const ext = file.name.split('.').pop()
      const filename = `${Date.now()}.${ext}`
      const path = `events/${eventFolder}/${filename}`

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path)
      setForm(prev => ({ ...prev, cover_image_url: urlData.publicUrl }))
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'Image upload failed')
    } finally {
      setImageUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const payload: Record<string, unknown> = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        description: form.description.trim() || null,
        date: form.date ? new Date(form.date).toISOString() : null,
        end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
        location: form.location.trim() || null,
        capacity: form.capacity !== '' ? Number(form.capacity) : null,
        deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
        registration_mode: form.registration_mode,
        external_registration_url:
          form.registration_mode === 'external'
            ? (form.external_registration_url.trim() || null)
            : null,
        one_submission_per_email:
          form.registration_mode === 'internal'
            ? form.one_submission_per_email
            : false,
        cover_image_url: form.cover_image_url || null,
        is_published: form.is_published,
        requires_submission: form.requires_submission,
        submission_deadline: form.submission_deadline
          ? new Date(form.submission_deadline).toISOString()
          : null,
        submission_instructions: form.submission_instructions.trim() || null,
        post_registration_message: form.post_registration_message.trim() || null,
      }

      let res: Response
      if (isEditing) {
        res = await fetch(`/api/admin/events/${initialEvent!.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch('/api/admin/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? `Request failed with status ${res.status}`)
      }

      const data = await res.json()
      const eventId = data?.id ?? data?.event?.id ?? initialEvent?.id
      if (eventId) {
        router.push(`/admin/events/${eventId}`)
        router.refresh()
      } else {
        router.push('/admin/events')
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info Card */}
      <div className="card-cream rounded-2xl p-6 space-y-5">
        <h2 className="heading-section text-[var(--color-navy)]">Basic Information</h2>

        {/* Title */}
        <div>
          <label className="form-label" htmlFor="title">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Community Night 2025"
            className="form-input"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="form-label" htmlFor="slug">
            Slug <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-[var(--color-navy)] opacity-50 text-sm shrink-0">events/</span>
            <input
              id="slug"
              name="slug"
              type="text"
              required
              value={form.slug}
              onChange={handleSlugChange}
              placeholder="community-night-2025"
              className="form-input flex-1"
            />
          </div>
          <p className="form-help">Auto-generated from title. Edit to customise the URL.</p>
        </div>

        {/* Description – rich text editor */}
        <div>
          <label className="form-label">Description</label>
          <RichTextEditor
            value={form.description}
            onChange={(val) => setForm(prev => ({ ...prev, description: val }))}
          />
        </div>
      </div>

      {/* Date & Location Card */}
      <div className="card-cream rounded-2xl p-6 space-y-5">
        <h2 className="heading-section text-[var(--color-navy)]">Date & Location</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Start Date */}
          <div>
            <label className="form-label" htmlFor="date">Start Date & Time</label>
            <input
              id="date"
              name="date"
              type="datetime-local"
              value={form.date}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="form-label" htmlFor="end_date">End Date & Time</label>
            <input
              id="end_date"
              name="end_date"
              type="datetime-local"
              value={form.end_date}
              onChange={handleChange}
              className="form-input"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="form-label" htmlFor="location">Location</label>
          <input
            id="location"
            name="location"
            type="text"
            value={form.location}
            onChange={handleChange}
            placeholder="e.g. UC Campus, Room 301"
            className="form-input"
          />
        </div>
      </div>

      {/* Registration Card */}
      <div className="card-cream rounded-2xl p-6 space-y-5">
        <h2 className="heading-section text-[var(--color-navy)]">Registration</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Capacity */}
          <div>
            <label className="form-label" htmlFor="capacity">Capacity</label>
            <input
              id="capacity"
              name="capacity"
              type="number"
              min={1}
              value={form.capacity}
              onChange={handleChange}
              placeholder="Leave blank for unlimited"
              className="form-input"
            />
            <p className="form-help">Maximum number of registrants.</p>
          </div>

          {/* Deadline */}
          <div>
            <label className="form-label" htmlFor="deadline">Registration Deadline</label>
            <input
              id="deadline"
              name="deadline"
              type="datetime-local"
              value={form.deadline}
              onChange={handleChange}
              className="form-input"
            />
          </div>
        </div>

        {/* Registration Mode */}
        <div>
          <label className="form-label" htmlFor="registration_mode">Registration Mode</label>
          <select
            id="registration_mode"
            name="registration_mode"
            value={form.registration_mode}
            onChange={handleChange}
            className="form-input"
          >
            <option value="none">None — no registration required</option>
            <option value="internal">Internal Form — use UCIC form builder</option>
            <option value="external">External Link — redirect to external URL</option>
          </select>
        </div>

        {/* External URL (conditional) */}
        {form.registration_mode === 'external' && (
          <div>
            <label className="form-label" htmlFor="external_registration_url">
              External Registration URL <span className="text-red-500">*</span>
            </label>
            <input
              id="external_registration_url"
              name="external_registration_url"
              type="url"
              value={form.external_registration_url}
              onChange={handleChange}
              required={form.registration_mode === 'external'}
              placeholder="https://forms.google.com/…"
              className="form-input"
            />
          </div>
        )}

        {/* One submission per email (conditional) */}
        {form.registration_mode === 'internal' && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--color-pale-blue)]">
            <input
              id="one_submission_per_email"
              name="one_submission_per_email"
              type="checkbox"
              checked={form.one_submission_per_email}
              onChange={handleChange}
              className="mt-0.5 h-4 w-4 rounded border-[var(--color-dusty-blue)] accent-[var(--color-navy)] shrink-0"
            />
            <div>
              <label htmlFor="one_submission_per_email" className="form-label mb-0 cursor-pointer">
                One submission per email
              </label>
              <p className="form-help mt-0.5">
                Prevent the same email address from registering more than once.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Cover Image Card */}
      {/* Post-Registration Message Card */}
      <div className="card-cream rounded-2xl p-6 space-y-5">
        <div>
          <h2 className="heading-section text-[var(--color-navy)]">Post-Registration Message</h2>
          <p className="form-help mt-1">
            Shown to participants after they successfully register. Perfect for WhatsApp group
            links, important reminders, or next steps.
          </p>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <label className="form-label !mb-0" htmlFor="post_registration_message">
              Message
            </label>
            <HyperlinkButton
              targetId="post_registration_message"
              currentValue={form.post_registration_message}
              onInsert={(newVal) => setForm((prev) => ({ ...prev, post_registration_message: newVal }))}
            />
          </div>
          <textarea
            id="post_registration_message"
            name="post_registration_message"
            rows={4}
            value={form.post_registration_message}
            onChange={handleChange}
            placeholder={`e.g.\n🎉 Selamat sudah mendaftar!\nJoin grup WA: https://wa.me/...`}
            className="form-input resize-none"
          />
          <p className="form-help">Leave blank to show the default success message. Use the 🔗 button to insert clickable links.</p>
        </div>
      </div>

      {/* Submission Settings Card */}
      <div className="card-cream rounded-2xl p-6 space-y-5">
        <h2 className="heading-section text-[var(--color-navy)]">Submission Settings</h2>

        {/* Toggle */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--color-pale-blue)]">
          <button
            type="button"
            role="switch"
            aria-checked={form.requires_submission}
            onClick={() =>
              setForm((prev) => ({ ...prev, requires_submission: !prev.requires_submission }))
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 mt-0.5 ${
              form.requires_submission
                ? 'bg-[var(--color-navy)]'
                : 'bg-[var(--color-dusty-blue)]/40'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                form.requires_submission ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <div>
            <p className="form-label mb-0">Requires Submission</p>
            <p className="form-help mt-0.5">
              Participants must submit their work after registering (e.g. competition entries).
              They will need to log in to register.
            </p>
          </div>
        </div>

        {form.requires_submission && (
          <>
            <div>
              <label className="form-label" htmlFor="submission_deadline">
                Submission Deadline
              </label>
              <input
                id="submission_deadline"
                name="submission_deadline"
                type="datetime-local"
                value={form.submission_deadline}
                onChange={handleChange}
                className="form-input"
              />
              <p className="form-help">
                Leave blank for no deadline. Separate from the registration deadline.
              </p>
            </div>

            <div>
              <label className="form-label" htmlFor="submission_instructions">
                Instructions for Participants
              </label>
              <textarea
                id="submission_instructions"
                name="submission_instructions"
                rows={3}
                value={form.submission_instructions}
                onChange={handleChange}
                placeholder="Describe what participants should submit and how…"
                className="form-input resize-none"
              />
              <p className="form-help">Shown on the submission page.</p>
            </div>

            <div className="p-4 rounded-xl border border-[var(--color-dusty-blue)]/30 bg-white/40">
              <p className="text-sm font-semibold text-[var(--color-navy)]">
                📋 Submission Form Builder
              </p>
              <p className="form-help mt-1">
                After saving, go to the <strong>Submission Builder</strong> tab to configure what
                participants must submit (files, links, text fields).
              </p>
            </div>
          </>
        )}
      </div>

      {/* Cover Image Card */}
      <div className="card-cream rounded-2xl p-6 space-y-4">
        <h2 className="heading-section text-[var(--color-navy)]">Cover Image</h2>

        {/* Current / preview image */}
        {form.cover_image_url && (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={form.cover_image_url}
              alt="Event cover preview"
              className="w-full max-h-56 object-cover rounded-xl border border-[var(--color-dusty-blue)]/30"
            />
            <button
              type="button"
              onClick={() => setForm(prev => ({ ...prev, cover_image_url: '' }))}
              className="absolute top-2 right-2 bg-white/90 hover:bg-white text-red-600 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shadow"
              aria-label="Remove image"
            >
              ×
            </button>
          </div>
        )}

        {/* File input */}
        <div>
          <label className="form-label" htmlFor="cover_image_file">
            {form.cover_image_url ? 'Replace Image' : 'Upload Image'}
          </label>
          <input
            id="cover_image_file"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="block w-full text-sm text-[var(--color-navy)] opacity-80
              file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
              file:text-sm file:font-semibold file:bg-[var(--color-dusty-blue)]/20
              file:text-[var(--color-navy)] hover:file:bg-[var(--color-dusty-blue)]/30
              file:cursor-pointer cursor-pointer"
            disabled={imageUploading}
          />
          {imageUploading && (
            <p className="form-help mt-2 flex items-center gap-2">
              <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Uploading…
            </p>
          )}
          {imageError && <p className="form-error mt-1">{imageError}</p>}
          <p className="form-help">Recommended: 1200×630px, JPG or PNG, max 5 MB.</p>
        </div>
      </div>

      {/* Publish Settings Card */}
      <div className="card-cream rounded-2xl p-6">
        <div className="flex items-start gap-3">
          {/* Toggle switch */}
          <button
            type="button"
            role="switch"
            aria-checked={form.is_published}
            onClick={() => setForm(prev => ({ ...prev, is_published: !prev.is_published }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 mt-0.5
              ${form.is_published ? 'bg-[var(--color-navy)]' : 'bg-[var(--color-dusty-blue)]/40'}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform
                ${form.is_published ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
          <div>
            <p className="form-label mb-0">
              {form.is_published ? 'Published' : 'Draft'}
            </p>
            <p className="form-help mt-0.5">
              {form.is_published
                ? 'This event is visible to the public.'
                : 'This event is hidden from the public.'}
            </p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4">
          <p className="form-error text-sm">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pb-8">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="btn-secondary order-2 sm:order-1"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || imageUploading}
          className="btn-primary order-1 sm:order-2 flex items-center justify-center gap-2"
        >
          {isSubmitting && (
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          )}
          {isSubmitting
            ? isEditing ? 'Saving…' : 'Creating…'
            : isEditing ? 'Save Changes' : 'Create Event'}
        </button>
      </div>
    </form>
  )
}
