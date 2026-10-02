import type { Metadata } from 'next'
import { Barlow_Condensed, Inter, Playfair_Display } from 'next/font/google'
import './globals.css'

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-heading',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'UCIC | Universitas Ciputra International Community',
    template: '%s | UCIC',
  },
  description:
    'Universitas Ciputra International Community — connecting students across the globe.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(
      'https://jvcvbgcaltqhtabxahdg.supabase.co',
      'https://ucic.ciputra.ac.id'
    ) ?? 'http://localhost:3000'
  ),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${barlowCondensed.variable} ${inter.variable} ${playfairDisplay.variable}`}
    >
      <body className="min-h-screen bg-[#edf2f5] stripe-bg">{children}</body>
    </html>
  )
}
