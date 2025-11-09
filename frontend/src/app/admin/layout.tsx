// frontend/src/app/admin/layout.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import AdminSidebar from './components/AdminSidebar'
import AdminHeader from './components/AdminHeader'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(true)
  
  const router = useRouter()
  const pathname = usePathname()

  // 🔄 بارگذاری وضعیت تم از localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('admin-theme')
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark')
    }
  }, [])

  // 💾 ذخیره وضعیت تم در localStorage
  useEffect(() => {
    localStorage.setItem('admin-theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  // 🔄 تابع تغییر تم
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  useEffect(() => {
    console.log('🔍 AdminLayout mounted - Path:', pathname)
    
    // اگر در صفحه login هستیم، Layout مدیریتی نشان نده
    if (pathname === '/admin/login') {
      console.log('🎯 Login page detected - skipping admin layout')
      setIsAuthenticated(false)
      setLoading(false)
      return
    }

    // ✅ اصلاح: بررسی ساده و مستقیم بدون تاخیر
    const token = localStorage.getItem('admin_token')
    const userData = localStorage.getItem('admin_user')
    
    console.log('🔑 Auth check:', { 
      token: token ? `Exists (${token.substring(0, 10)}...)` : 'No token', 
      userData: userData ? 'Exists' : 'No user data',
      pathname 
    })
    
    if (!token || !userData) {
      console.log('❌ Missing auth data, redirecting to login')
      // ✅ اصلاح: فقط یکبار redirect کنیم
      setTimeout(() => {
        router.push('/admin/login')
      }, 100)
      return
    }
    
    try {
      // بررسی valid بودن user data
      const user = JSON.parse(userData)
      console.log('✅ User data valid, role:', user.role)
      
      setIsAuthenticated(true)
      setLoading(false)
    } catch (error) {
      console.error('❌ Error parsing user data:', error)
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
      setTimeout(() => {
        router.push('/admin/login')
      }, 100)
    }
  }, [router, pathname])

  // اگر در صفحه login هستیم، فقط children را نمایش بده (بدون Layout مدیریتی)
  if (pathname === '/admin/login') {
    console.log('🎯 Rendering login page without admin layout')
    return <>{children}</>
  }

  if (loading) {
    console.log('⏳ Showing loading state for path:', pathname)
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white' 
          : 'bg-gradient-to-br from-amber-100 via-amber-50 to-amber-100 text-gray-900'
      }`}>
        <div className="flex flex-col items-center gap-3">
          <div className={`w-8 h-8 border-4 rounded-full animate-spin ${
            isDarkMode 
              ? 'border-yellow-500 border-t-transparent' 
              : 'border-amber-600 border-t-transparent'
          }`}></div>
          <div className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
            در حال بارگذاری...
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    console.log('🚫 User not authenticated for path:', pathname)
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white' 
          : 'bg-gradient-to-br from-amber-100 via-amber-50 to-amber-100 text-gray-900'
      }`}>
        <div className="flex flex-col items-center gap-3">
          <div className={`w-8 h-8 border-4 rounded-full animate-spin ${
            isDarkMode 
              ? 'border-yellow-500 border-t-transparent' 
              : 'border-amber-600 border-t-transparent'
          }`}></div>
          <div className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
            در حال انتقال به صفحه ورود...
          </div>
        </div>
      </div>
    )
  }

  console.log('🏠 Rendering full admin layout for path:', pathname)
  return (
    <div className={`flex h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white' 
        : 'bg-gradient-to-br from-amber-100 via-amber-50 to-amber-100 text-gray-900'
    }`}>
      {/* سایدبار برای دسکتاپ */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <AdminSidebar isDarkMode={isDarkMode} />
      </div>

      {/* سایدبار برای موبایل */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div 
            className={`fixed inset-0 transition-opacity ${
              isDarkMode 
                ? 'bg-gray-900 bg-opacity-80' 
                : 'bg-amber-900 bg-opacity-50'
            }`}
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex">
            <AdminSidebar 
              isDarkMode={isDarkMode} 
              onClose={() => setSidebarOpen(false)} 
            />
          </div>
        </div>
      )}

      {/* محتوای اصلی */}
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        <AdminHeader 
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
        
        {/* محتوای داینامیک */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none transition-colors duration-300">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}