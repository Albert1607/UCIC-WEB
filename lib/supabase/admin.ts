import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Admin client — ONLY for server-side use (Route Handlers, Server Actions)
// Uses the SERVICE ROLE KEY — bypasses RLS — NEVER expose to browser
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
