import { db } from '@/lib/db/client';
import { getAllContent } from '@/lib/db/queries/content';
import ContentEditor from './ContentEditor';

export const dynamic = 'force-dynamic';

const REQUIRED_CONTENT_KEYS: { key: string; label: string; value: string }[] = [
  { key: 'about_image_url', label: 'About Section Image URL', value: '' },
];

export default async function ContentPage() {
  let content = await getAllContent();

  // Self-heal: ensure critical keys like about_image_url exist in the database
  const existingKeys = new Set(content.map((c) => c.key));
  const missing = REQUIRED_CONTENT_KEYS.filter((item) => !existingKeys.has(item.key));

  if (missing.length > 0) {
    try {
      for (const item of missing) {
        await db`
          INSERT INTO site_content (key, label, value, content_type)
          VALUES (${item.key}, ${item.label}, ${item.value}, 'text')
          ON CONFLICT DO NOTHING
        `;
      }
      content = await getAllContent();
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
