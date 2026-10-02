import AdminSidebar from '@/components/admin/AdminSidebar'

// Auth protection is handled entirely by proxy.ts — no double-redirect here.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main
        className="flex-1 overflow-auto pt-14 md:pt-0"
        style={{ background: 'var(--color-pale-blue)' }}
      >
        {children}
      </main>
    </div>
  )
}
