import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth/session'
import { deleteRegistration } from '@/lib/db/queries/registrations'

interface RouteParams {
  params: Promise<{ id: string }>
}

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    if (!(await getAdminSession())) return unauthorized()
    const { id } = await params

    await deleteRegistration(id)
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
