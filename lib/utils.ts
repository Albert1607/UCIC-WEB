import { Event } from '@/types'
import type { SupabaseClient } from '@supabase/supabase-js'

export function isEventPast(event: Event): boolean {
  if (!event.date) return false
  return new Date(event.date) < new Date()
}

export function isRegistrationClosed(event: Event): boolean {
  if (event.deadline && new Date(event.deadline) < new Date()) return true
  return false
}

export function formatDate(dateStr: string | null, opts?: Intl.DateTimeFormatOptions): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...opts,
  })
}

export function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function generateSlug(title: string): string {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug || 'event'
}

export async function getUniqueSlug(
  supabase: SupabaseClient,
  baseSlug: string,
  excludeId?: string
): Promise<string> {
  const cleanBase = generateSlug(baseSlug) || 'event'

  let query = supabase
    .from('events')
    .select('slug, id')
    .or(`slug.eq.${cleanBase},slug.like.${cleanBase}-%`)

  if (excludeId) {
    query = query.neq('id', excludeId)
  }

  const { data: existingEvents, error } = await query

  if (error || !existingEvents || existingEvents.length === 0) {
    return cleanBase
  }

  const existingSlugs = new Set(existingEvents.map((e: { slug: string }) => e.slug))
  if (!existingSlugs.has(cleanBase)) {
    return cleanBase
  }

  let counter = 1
  while (existingSlugs.has(`${cleanBase}-${counter}`)) {
    counter++
  }

  return `${cleanBase}-${counter}`
}

export function getSupabaseImageUrl(bucket: string, path: string): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  return `${url}/storage/v1/object/public/${bucket}/${path}`
}
