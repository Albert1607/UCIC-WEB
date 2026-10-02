import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { ids: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { ids } = body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'ids array is required' }, { status: 400 });
  }

  const admin = createAdminClient();
  const errors: string[] = [];

  await Promise.all(
    ids.map(async (id, index) => {
      const { error } = await admin
        .from('team_members')
        .update({ sort_order: index, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) errors.push(`id=${id}: ${error.message}`);
    })
  );

  if (errors.length > 0) {
    return NextResponse.json({ error: 'Some reorders failed', details: errors }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
