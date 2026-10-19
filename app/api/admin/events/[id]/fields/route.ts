import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth/session'
import { getFormFieldsByEvent, replaceFormFields } from '@/lib/db/queries/form-fields'
import { updateEvent } from '@/lib/db/queries/events'
import { FormField } from '@/types'

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

    const fields = await getFormFieldsByEvent(id)
    return NextResponse.json(fields ?? [])
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    if (!(await getAdminSession())) return unauthorized()
    const { id } = await params

    const body = await req.json()
    const { fields, email_field_id } = body as {
      fields: Partial<FormField>[]
      email_field_id?: string | null
    }

    if (!Array.isArray(fields)) {
      return NextResponse.json({ error: 'Fields must be an array' }, { status: 400 })
    }

    const savedFields = await replaceFormFields(id, fields)

    if (email_field_id !== undefined) {
      await updateEvent(id, { email_field_id: email_field_id || null })
    }

    return NextResponse.json(savedFields)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
