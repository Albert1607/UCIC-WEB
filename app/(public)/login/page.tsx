import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getSession } from '@/lib/auth/session'
import LoginClient from './LoginClient'

export const metadata: Metadata = { title: 'Login — UCIC' }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams
  const session = await getSession()

  if (session) redirect(next || '/my-submissions')

  return <LoginClient next={next} />
}
