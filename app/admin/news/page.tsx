import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { NewsItem } from '@/types'
import NewsManager from './NewsManager'

export const metadata: Metadata = { title: 'News – Admin' }

export default async function NewsPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('news_items').select('*').order('sort_order')
  const items: NewsItem[] = data ?? []

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="heading-display text-4xl text-[var(--color-navy)]">News & Updates</h1>
        <p className="text-sm opacity-60 mt-1 text-[var(--color-navy)]">
          Add YouTube, Instagram Reels, or other embedded video links shown as a carousel on the homepage.
          The number of cards per view is controlled in Content → <code className="text-xs bg-[var(--color-pale-blue)] px-1">news_carousel_per_view</code>.
        </p>
      </div>
      <NewsManager initialItems={items} />
    </div>
  )
}
