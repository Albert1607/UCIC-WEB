import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import SignupClient from './SignupClient'

export const metadata: Metadata = { title: 'Sign Up — UCIC' }

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) redirect(next || '/my-submissions')

  return <SignupClient next={next} />
}
