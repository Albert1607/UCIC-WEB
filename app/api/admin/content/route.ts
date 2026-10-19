import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth/session'
import { updateContentById } from '@/lib/db/queries/content'

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export async function PATCH(req: NextRequest) {
  if (!(await getAdminSession())) return unauthorized()

  let body: { updates: { id: string; value: string }[] }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { updates } = body
  if (!Array.isArray(updates) || updates.length === 0) {
    return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
  }

  const errors: string[] = []
  await Promise.all(
    updates.map(async ({ id, value }) => {
      try { await updateContentById(id, value) }
      catch (e) { errors.push(`id=${id}: ${e}`) }
    })
  )

  if (errors.length > 0) {
    return NextResponse.json({ error: 'Some updates failed', details: errors }, { status: 500 })
  }
  return NextResponse.json({ success: true, count: updates.length })
}
