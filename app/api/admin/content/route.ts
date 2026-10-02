import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function PATCH(req: NextRequest) {
  // Auth check
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { updates: { id: string; value: string }[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { updates } = body;
  if (!Array.isArray(updates) || updates.length === 0) {
    return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
  }

  const admin = createAdminClient();
  const errors: string[] = [];

  await Promise.all(
    updates.map(async ({ id, value }) => {
      const { error } = await admin
        .from('site_content')
        .update({ value, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) errors.push(`id=${id}: ${error.message}`);
    })
  );

  if (errors.length > 0) {
    return NextResponse.json({ error: 'Some updates failed', details: errors }, { status: 500 });
  }

  return NextResponse.json({ success: true, count: updates.length });
}
