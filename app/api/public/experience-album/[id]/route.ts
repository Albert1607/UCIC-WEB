import { NextRequest, NextResponse } from 'next/server'
import { getAlbumItemsByExperience } from '@/lib/db/queries/experiences'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await getAlbumItemsByExperience(id)
  return NextResponse.json(data)
}
