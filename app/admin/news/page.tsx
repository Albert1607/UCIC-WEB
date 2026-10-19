import type { Metadata } from 'next'
import { getAllNews } from '@/lib/db/queries/news'
import { NewsItem } from '@/types'
import NewsManager from './NewsManager'

export const metadata: Metadata = { title: 'News – Admin' }
export const dynamic = 'force-dynamic'

export default async function NewsPage() {
  const data = await getAllNews()
  const items: NewsItem[] = (data ?? []) as unknown as NewsItem[]

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
