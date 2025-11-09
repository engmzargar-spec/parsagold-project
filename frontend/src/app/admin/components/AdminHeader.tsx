// frontend/src/app/admin/components/AdminHeader.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface AdminHeaderProps {
  onMenuClick: () => void
  isDarkMode: boolean
  toggleTheme: () => void
}

export default function AdminHeader({ onMenuClick, isDarkMode, toggleTheme }: AdminHeaderProps) {
  const [currentTime, setCurrentTime] = useState('')
  const [currentDate, setCurrentDate] = useState('')
  const [userInfo, setUserInfo] = useState<any>(null)
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsMounted(true)
    
    // بارگذاری اطلاعات کاربر از sessionStorage ✅ تغییر به sessionStorage
    const adminInfo = sessionStorage.getItem('admin_info')
    if (adminInfo) {
      try {
        setUserInfo(JSON.parse(adminInfo))
      } catch (error) {
        console.error('Error parsing admin info:', error)
      }
    }

    updateDateTime()
    const timer = setInterval(updateDateTime, 1000)

    return () => clearInterval(timer)
  }, [])

  const updateDateTime = () => {
    const now = new Date()
    const time = now.toLocaleTimeString('fa-IR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    })
    setCurrentTime(time)
    
    const jalaliDate = now.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    setCurrentDate(jalaliDate)
  }

  const handleLogout = () => {
    // حذف از sessionStorage به جای localStorage ✅ تغییر به sessionStorage
    sessionStorage.removeItem('admin_token')
    sessionStorage.removeItem('admin_info')
    // فقط theme از localStorage پاک میشه چون کاربری نیست
    localStorage.removeItem('admin_theme')
    router.push('/admin/login')
  }

  if (!isMounted) {
    return (
      <header className={`transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gray-800' 
          : 'bg-stone-700 text-white'
      }`}>
        <div className="px-4 sm:px-6 py-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`h-8 w-8 rounded animate-pulse ${
                isDarkMode ? 'bg-gray-700' : 'bg-stone-600'
              }`}></div>
              <div className={`h-4 w-32 rounded animate-pulse ${
                isDarkMode ? 'bg-gray-700' : 'bg-stone-600'
              }`}></div>
            </div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className={`transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-800' 
        : 'bg-stone-700 text-white'
    }`}>
      <div className="px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between">
          {/* سمت چپ - منو و لوگو */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'text-gray-400 hover:bg-gray-700' 
                  : 'text-stone-200 hover:bg-stone-600'
              }`}
              aria-label="منو"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center gap-3">
              <div className="hidden md:block">
                <h1 className={`text-lg font-semibold ${
                  isDarkMode ? 'text-white' : 'text-white'
                }`}>
                  پنل مدیریت پارسا گلد
                </h1>
                <p className={`text-xl ${
                  isDarkMode ? 'text-gray-400' : 'text-stone-200'
                }`}>
                  سیستم معاملات طلا، نقره و نفت
                </p>
              </div>
            </div>
          </div>

          {/* وسط - تاریخ و زمان */}
          <div className="hidden sm:flex items-center gap-4">
            <div className="text-center">
              <div className={`font-bold text-xl ${
                isDarkMode ? 'text-yellow-400' : 'text-stone-100'
              }`}>
                {currentTime}
              </div>
              <div className={`text-xs ${
                isDarkMode ? 'text-gray-400' : 'text-stone-300'
              }`}>
                {currentDate}
              </div>
            </div>
          </div>

          {/* سمت راست - کنترل‌ها */}
          <div className="flex items-center gap-4">
            {/* تغییر تم */}
            <button
              onClick={toggleTheme}
              className={`p-3 rounded-lg transition-all duration-300 hover:scale-110 ${
                isDarkMode 
                  ? 'bg-yellow-500 text-yellow-900 hover:bg-yellow-400' 
                  : 'bg-yellow-600 text-white hover:bg-stone-500'
              }`}
              title={isDarkMode ? 'تغییر به تم روشن' : 'تغییر به تم تیره'}
            >
              {isDarkMode ? (
                // خورشید (تم روشن)
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
                </svg>
              ) : (
                // ماه (تم تیره)
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd"/>
                </svg>
              )}
            </button>

            {/* اطلاعات کاربر */}
            {userInfo && (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className={`font-medium text-sm ${
                    isDarkMode ? 'text-white' : 'text-white'
                  }`}>
                    {userInfo.full_name || 'مدیر سیستم'}
                  </div>
                  <div className={`text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-stone-200'
                  }`}>
                    {userInfo.role === 'chief' ? 'مدیر ارشد' : 'مدیر'}
                  </div>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' 
                    : 'bg-gradient-to-br from-yellow-500 to-stone-600'
                }`}>
                  {(userInfo.full_name?.[0] || 'م')}
                </div>
              </div>
            )}

            {/* دکمه خروج */}
            <button 
              onClick={handleLogout}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                isDarkMode 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-red-600 hover:bg-stone-500 text-white'
              }`}
            >
              خروج
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}