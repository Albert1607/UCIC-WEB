import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { HeroCarouselItem } from '@/types'
import HeroCarouselManager from './HeroCarouselManager'

export const metadata: Metadata = { title: 'Hero Carousel – Admin' }

export default async function HeroCarouselPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('hero_carousel_items').select('*').order('sort_order')
  const items: HeroCarouselItem[] = data ?? []

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="heading-display text-4xl text-[var(--color-navy)]">Hero Carousel</h1>
        <p className="text-sm opacity-60 mt-1 text-[var(--color-navy)]">
          Manage the dissolve carousel shown at the very top of the homepage. Supports images and videos.
        </p>
      </div>
      <HeroCarouselManager initialItems={items} />
    </div>
  )
}
