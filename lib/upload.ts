// Image upload utility for admin use
// Always call from client components using the browser supabase client

import { createClient } from '@/lib/supabase/client'

export async function uploadImage(
  bucket: string,
  path: string,
  file: File
): Promise<{ url: string | null; error: string | null }> {
  const supabase = createClient()

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    })

  if (uploadError) {
    return { url: null, error: uploadError.message }
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)

  return { url: data.publicUrl, error: null }
}

export function getFileExtension(file: File): string {
  return file.name.split('.').pop() ?? 'bin'
}

export function sanitizeFileName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9.-]/g, '')
}
