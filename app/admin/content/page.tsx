import { createClient } from '@/lib/supabase/server';
import ContentEditor from './ContentEditor';

export const dynamic = 'force-dynamic';

export default async function ContentPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('site_content')
    .select('id, key, value, label')
    .order('key');

  if (error) {
    console.error('Error fetching site_content:', error);
  }

  const content = data ?? [];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="heading-display mb-2" style={{ color: 'var(--color-navy)' }}>
        Site Content
      </h1>
      <p className="text-sm mb-8" style={{ color: 'var(--color-navy-secondary)' }}>
        Manage all text content displayed on the public site.
      </p>
      <ContentEditor initialContent={content} />
    </div>
  );
}
