import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth/session'
import { getAllContent, updateContentById } from '@/lib/db/queries/content'

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export async function GET() {
  if (!(await getAdminSession())) return unauthorized()
  const data = await getAllContent()
  return NextResponse.json(data)
}
