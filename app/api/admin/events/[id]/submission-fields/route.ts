import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth/session'
import { getSubmissionFieldsByEvent, replaceSubmissionFields } from '@/lib/db/queries/submissions'
import { SubmissionField } from '@/types'

interface RouteParams {
  params: Promise<{ id: string }>
}

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    if (!(await getAdminSession())) return unauthorized()
    const { id } = await params

    const fields = await getSubmissionFieldsByEvent(id)
    return NextResponse.json(fields ?? [])
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    if (!(await getAdminSession())) return unauthorized()
    const { id } = await params

    const body = await req.json()
    const { fields } = body as { fields: Partial<SubmissionField>[] }
    if (!Array.isArray(fields)) {
      return NextResponse.json({ error: 'Fields must be an array' }, { status: 400 })
    }

    const saved = await replaceSubmissionFields(id, fields)
    return NextResponse.json(saved)
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
