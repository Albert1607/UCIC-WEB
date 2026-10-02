'use client'

import { useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

interface ContentItem {
  id: string
  key: string
  value: string | null
  label: string | null
}

interface Props {
  initialContent: ContentItem[]
}

type SectionCategory = 'Hero' | 'About' | 'Events' | 'Navigation' | 'Footer & Contact' | 'Other'

const FIELD_ORDER: Record<string, number> = {
  // Hero
  hero_headline: 10,
  hero_subheadline: 20,
  hero_cta_label: 30,
  hero_image_url: 40,
  hero_card_title: 50,
  hero_card_subtitle: 60,
  // About
  about_title: 10,
  about_intro: 20,
  about_image_url: 30,
  about_mission_title: 40,
  about_mission: 50,
  about_vision_title: 60,
  about_vision: 70,
  // Events
  events_section_title: 10,
  events_upcoming_label: 20,
  events_past_label: 30,
  latest_activity_title: 40,
  register_button_label: 50,
  register_closed_label: 60,
  register_full_label: 70,
  // Navigation
  nav_home: 10,
  nav_about: 20,
  nav_events: 30,
  nav_contact: 40,
  // Footer & Contact
  footer_tagline: 10,
  footer_description: 20,
  contact_email: 30,
  contact_instagram: 40,
  contact_line: 50,
  scrolling_strip_text: 60,
  // Other
  stats_section_title: 10,
  team_section_title: 20,
}

export default function ContentEditor({ initialContent }: Props) {
  const [content, setContent] = useState<ContentItem[]>(initialContent)
  const [activeTab, setActiveTab] = useState<SectionCategory>('Hero')
  const [saving, setSaving] = useState(false)
  const [uploadingKey, setUploadingKey] = useState<string | null>(null)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const updateValue = (key: string, newValue: string) => {
    setContent((prev) =>
      prev.map((item) => (item.key === key ? { ...item, value: newValue } : item))
    )
  }

  // Categorize keys
  const getCategory = (key: string): SectionCategory => {
    if (key.startsWith('hero_')) return 'Hero'
    if (key.startsWith('about_')) return 'About'
    if (key.startsWith('events_') || key.startsWith('register_') || key.startsWith('latest_activity_')) return 'Events'
    if (key.startsWith('nav_')) return 'Navigation'
    if (key.startsWith('footer_') || key.startsWith('contact_') || key.startsWith('scrolling_strip_')) return 'Footer & Contact'
    return 'Other'
  }

  const categories: SectionCategory[] = ['Hero', 'About', 'Events', 'Navigation', 'Footer & Contact', 'Other']

  // Filter content for active tab and sort logically
  const activeItems = content
    .filter((item) => getCategory(item.key) === activeTab)
    .sort(
      (a, b) =>
        (FIELD_ORDER[a.key] ?? 999) - (FIELD_ORDER[b.key] ?? 999) ||
        a.key.localeCompare(b.key)
    )

  // Save current active tab items or all
  const handleSave = async (itemsToSave?: ContentItem[]) => {
    setSaving(true)
    setMessage(null)
    const targets = itemsToSave || content
    const updates = targets.map((item) => ({
      id: item.id,
      value: item.value ?? '',
    }))

    try {
      const res = await fetch('/api/admin/content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Failed to save content')
      }

      setMessage({ text: 'Changes saved successfully!', type: 'success' })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving changes'
      setMessage({ text: msg, type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  // Upload image handler
  const handleImageUpload = async (key: string, file: File) => {
    setUploadingKey(key)
    setMessage(null)

    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const fileName = `${key}-${Date.now()}.${ext}`
      const filePath = `content/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('site-images')
        .upload(filePath, file, { cacheControl: '3600', upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('site-images').getPublicUrl(filePath)
      updateValue(key, data.publicUrl)
      setMessage({ text: 'Image uploaded! Remember to click Save.', type: 'success' })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error uploading image'
      setMessage({ text: msg, type: 'error' })
    } finally {
      setUploadingKey(null)
    }
  }

  const isMultiline = (key: string) => {
    return (
      key.includes('description') ||
      key.includes('intro') ||
      key.includes('mission') ||
      key.includes('vision') ||
      key.includes('subheadline')
    )
  }

  const isImageField = (key: string) => key.includes('image_url')

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-dusty-blue)]/30 pb-3">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-4 py-2 rounded-pill text-xs font-bold transition-colors ${
                activeTab === cat
                  ? 'bg-[var(--color-navy)] text-[var(--color-cream)]'
                  : 'bg-[var(--color-cream)] text-[var(--color-navy)] border border-[var(--color-dusty-blue)]/40 hover:bg-[var(--color-dusty-blue)]/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSave(activeItems)}
            disabled={saving}
            className="btn-primary !py-2 !px-5 text-xs"
          >
            {saving ? 'Saving...' : `Save ${activeTab}`}
          </button>
          <button
            onClick={() => handleSave(content)}
            disabled={saving}
            className="btn-secondary !py-2 !px-4 text-xs"
          >
            Save All
          </button>
        </div>
      </div>

      {/* Message feedback */}
      {message && (
        <div
          className={`p-4 rounded-xl text-sm font-semibold flex items-center justify-between ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
              : 'bg-red-50 text-red-800 border border-red-300'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="opacity-60 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {/* Content Form Fields */}
      <div className="card-cream p-6 sm:p-8 rounded-2xl shadow-card space-y-6">
        <div className="border-b border-[var(--color-dusty-blue)]/30 pb-3 mb-6">
          <h2 className="heading-section text-2xl text-[var(--color-navy)]">
            {activeTab} Settings
          </h2>
          <p className="text-xs opacity-60 text-[var(--color-navy)] mt-0.5">
            Modify text strings or upload replacement photos for this section.
          </p>
        </div>

        {activeItems.length === 0 ? (
          <p className="opacity-40 italic text-sm text-[var(--color-navy)] py-6 text-center">
            No fields defined under this section.
          </p>
        ) : (
          <div className="space-y-6">
            {activeItems.map((item) => (
              <div key={item.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="form-label !mb-0 font-bold" htmlFor={item.key}>
                    {item.label || item.key}
                  </label>
                  <span className="font-mono text-[10px] text-[var(--color-dusty-blue)] opacity-80">
                    {item.key}
                  </span>
                </div>

                {isImageField(item.key) ? (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <input
                        id={item.key}
                        type="text"
                        className="form-input flex-1"
                        placeholder="https://..."
                        value={item.value ?? ''}
                        onChange={(e) => updateValue(item.key, e.target.value)}
                      />
                      <label className="btn-secondary !py-2 !px-4 text-xs cursor-pointer shrink-0">
                        {uploadingKey === item.key ? 'Uploading...' : 'Upload Image'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingKey === item.key}
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleImageUpload(item.key, file)
                          }}
                        />
                      </label>
                    </div>

                    {item.value && (
                      <div className="flex items-center gap-4">
                        <div className="relative w-48 h-28 rounded-xl overflow-hidden border border-[var(--color-dusty-blue)]/30 bg-[var(--color-navy)]/5 shadow-sm">
                          <Image
                            src={item.value}
                            alt={item.label || 'Image preview'}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => updateValue(item.key, '')}
                          className="btn-secondary !py-1.5 !px-3 text-xs text-red-600 hover:text-red-700 hover:border-red-300"
                        >
                          Remove Image
                        </button>
                      </div>
                    )}
                  </div>
                ) : isMultiline(item.key) ? (
                  <textarea
                    id={item.key}
                    rows={4}
                    className="form-input"
                    value={item.value ?? ''}
                    onChange={(e) => updateValue(item.key, e.target.value)}
                  />
                ) : (
                  <input
                    id={item.key}
                    type="text"
                    className="form-input"
                    value={item.value ?? ''}
                    onChange={(e) => updateValue(item.key, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="pt-4 border-t border-[var(--color-dusty-blue)]/20 flex justify-end">
          <button
            onClick={() => handleSave(activeItems)}
            disabled={saving}
            className="btn-primary !py-2.5 !px-6 text-sm"
          >
            {saving ? 'Saving...' : `Save ${activeTab}`}
          </button>
        </div>
      </div>
    </div>
  )
}
