// frontend/src/app/admin/layout.tsx
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* بعداً Sidebar و Header اضافه میشه */}
      <main className="p-6">
        {children}
      </main>
    </div>
  )
}