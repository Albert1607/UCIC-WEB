import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth/session'
import { reorderExperiences } from '@/lib/db/queries/experiences'

export async function POST(req: NextRequest) {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { ids } = await req.json()
  if (!Array.isArray(ids)) return NextResponse.json({ error: 'ids array is required' }, { status: 400 })
  await reorderExperiences(ids)
  return NextResponse.json({ success: true })
}
