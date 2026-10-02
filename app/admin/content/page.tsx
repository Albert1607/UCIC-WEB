import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import ContentEditor from './ContentEditor';

export const dynamic = 'force-dynamic';

const REQUIRED_CONTENT_KEYS: { key: string; label: string; value: string }[] = [
  { key: 'about_image_url', label: 'About Section Image URL', value: '' },
];

export default async function ContentPage() {
  const supabase = await createClient();

  let { data, error } = await supabase
    .from('site_content')
    .select('id, key, value, label')
    .order('key');

  if (error) {
    console.error('Error fetching site_content:', error);
  }

  let content = data ?? [];

  // Self-heal: ensure critical keys like about_image_url exist in the database
  const existingKeys = new Set(content.map((c) => c.key));
  const missing = REQUIRED_CONTENT_KEYS.filter((item) => !existingKeys.has(item.key));

  if (missing.length > 0) {
    try {
      const admin = createAdminClient();
      for (const item of missing) {
        await admin.from('site_content').insert({
          key: item.key,
          label: item.label,
          value: item.value,
          content_type: 'text',
        });
      }
      const refetched = await supabase
        .from('site_content')
        .select('id, key, value, label')
        .order('key');
      if (refetched.data) {
        content = refetched.data;
      }
    } catch (e) {
      console.error('Error auto-inserting missing content keys:', e);
    }
  }

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
