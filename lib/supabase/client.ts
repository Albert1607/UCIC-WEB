import { createBrowserClient } from '@supabase/ssr'

// Browser client — safe for use in Client Components
// Uses the publishable key (anon key) — never the service role key
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
