import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth/session'
import { reorderTimelineItems } from '@/lib/db/queries/timeline'

export async function POST(req: NextRequest) {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { ids } = await req.json()
  if (!Array.isArray(ids)) return NextResponse.json({ error: 'ids array is required' }, { status: 400 })
  await reorderTimelineItems(ids)
  return NextResponse.json({ success: true })
}
