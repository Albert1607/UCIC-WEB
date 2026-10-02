import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('timeline_items')
    .select('*')
    .order('sort_order');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { year: string; title: string; description?: string; sort_order?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { year, title, description, sort_order } = body;
  if (!year || !title) {
    return NextResponse.json({ error: 'year and title are required' }, { status: 400 });
  }

  const admin = createAdminClient();

  let order = sort_order;
  if (order === undefined) {
    const { data: maxData } = await admin
      .from('timeline_items')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
      .single();
    order = ((maxData?.sort_order as number) ?? -1) + 1;
  }

  const { data, error } = await admin
    .from('timeline_items')
    .insert({ year, title, description: description ?? null, sort_order: order })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
