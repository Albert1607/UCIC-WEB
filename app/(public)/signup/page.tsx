import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getSession } from '@/lib/auth/session'
import SignupClient from './SignupClient'

export const metadata: Metadata = { title: 'Sign Up — UCIC' }

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams
  const session = await getSession()

  if (session) redirect(next || '/my-submissions')

  return <SignupClient next={next} />
}
