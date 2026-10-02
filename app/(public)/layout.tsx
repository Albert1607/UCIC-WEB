import { getSiteContent } from '@/lib/content'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const content = await getSiteContent()

  return (
    <>
      <Navbar content={content} />
      <main>{children}</main>
      <Footer content={content} />
    </>
  )
}
