import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/public/og-thumbnail?url=<encoded_url>
 *
 * Tries to extract a thumbnail from:
 * 1. YouTube → use public img.youtube.com (no auth needed)
 * 2. Instagram → use Instagram's public oEmbed endpoint (no token for basic info)
 * 3. Any URL → fetch Open Graph og:image meta tag
 */
export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get('url')
  if (!raw) return NextResponse.json({ error: 'Missing url param' }, { status: 400 })

  try {
    const url = new URL(raw)

    // ── YouTube ──────────────────────────────────────────────
    if (url.hostname.includes('youtube.com') || url.hostname === 'youtu.be') {
      let videoId: string | null = null
      if (url.hostname.includes('youtube.com')) {
        videoId = url.searchParams.get('v')
        if (!videoId && url.pathname.startsWith('/shorts/')) {
          videoId = url.pathname.split('/shorts/')[1]?.split('/')[0]
        }
      } else {
        videoId = url.pathname.slice(1).split('/')[0]
      }
      if (videoId) {
        // Try maxresdefault first, fall back to hqdefault
        const maxRes = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        const hq = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
        // Check if maxres exists (it 404s for some videos)
        try {
          const check = await fetch(maxRes, { method: 'HEAD' })
          return NextResponse.json({ thumbnail: check.ok ? maxRes : hq })
        } catch {
          return NextResponse.json({ thumbnail: hq })
        }
      }
    }

    // ── Instagram ─────────────────────────────────────────────
    if (url.hostname.includes('instagram.com')) {
      // Instagram oEmbed — works without token for public posts
      const oembedUrl = `https://graph.facebook.com/v17.0/instagram_oembed?url=${encodeURIComponent(raw)}&fields=thumbnail_url`
      // Try public (no-token) version first
      const publicOembed = `https://www.instagram.com/oembed/?url=${encodeURIComponent(raw)}`
      try {
        const res = await fetch(publicOembed, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          next: { revalidate: 3600 },
        })
        if (res.ok) {
          const data = await res.json()
          const thumb = data.thumbnail_url
          if (thumb) return NextResponse.json({ thumbnail: thumb })
        }
      } catch {
        // fall through to OG
      }
    }

    // ── Generic Open Graph og:image fallback ──────────────────
    const pageRes = await fetch(raw, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; UCICBot/1.0)',
      },
      next: { revalidate: 3600 },
    })
    if (pageRes.ok) {
      const html = await pageRes.text()
      // Extract og:image
      const match =
        html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
        html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i)
      if (match?.[1]) {
        return NextResponse.json({ thumbnail: match[1] })
      }
    }

    return NextResponse.json({ thumbnail: null })
  } catch (err) {
    console.error('og-thumbnail error:', err)
    return NextResponse.json({ thumbnail: null })
  }
}
