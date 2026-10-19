import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth/session'
import { reorderTeamMembers } from '@/lib/db/queries/team'

export async function POST(req: NextRequest) {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { ids } = await req.json()
  if (!Array.isArray(ids)) return NextResponse.json({ error: 'ids array is required' }, { status: 400 })
  await reorderTeamMembers(ids)
  return NextResponse.json({ success: true })
}
