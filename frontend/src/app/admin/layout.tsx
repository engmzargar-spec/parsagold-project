'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { AuthProvider, useAuth } from '../../contexts/AuthContext'
import AdminHeader from './components/AdminHeader'
import AdminSidebar from './components/AdminSidebar'

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const { isAuthenticated, loading, user } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const savedTheme = localStorage.getItem('admin_theme')
    setIsDarkMode(savedTheme === 'dark')
  }, [])

  useEffect(() => {
    if (!loading && !isAuthenticated && pathname !== '/admin/login') {
      router.push('/admin/login')
    }
  }, [isAuthenticated, loading, pathname, router])

  const toggleTheme = () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)
    localStorage.setItem('admin_theme', newTheme ? 'dark' : 'light')
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  if (loading || (!isAuthenticated && pathname !== '/admin/login')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (pathname === '/admin/login') {
    return <div>{children}</div>
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'
    }`}>
      {/* سایدبار برای موبایل */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <div className="flex">
        {/* سایدبار */}
        <div className={`
          fixed lg:static inset-y-0 right-0 z-50 w-64 transform transition-transform duration-300
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0
        `}>
          <AdminSidebar 
            isDarkMode={isDarkMode} 
            onClose={() => setIsSidebarOpen(false)}
          />
        </div>

        {/* محتوای اصلی - اصلاح شده */}
        <div className="flex-1 flex flex-col min-h-screen w-full lg:w-[calc(100%-16rem)]"> {/* تغییر مهم اینجا */}
          <AdminHeader 
            isDarkMode={isDarkMode}
            toggleTheme={toggleTheme}
            onMenuClick={toggleSidebar}
          />
          
          <main className="flex-1 p-6 overflow-auto w-full">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminLayoutContent>
        {children}
      </AdminLayoutContent>
    </AuthProvider>
  )
}