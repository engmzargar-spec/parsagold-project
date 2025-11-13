'use client'

import { useAuth } from '../../../contexts/AuthContext'
import { useState, useEffect } from 'react'

interface AdminHeaderProps {
  isDarkMode: boolean
  toggleTheme: () => void
  onMenuClick: () => void
}

export default function AdminHeader({ isDarkMode, toggleTheme, onMenuClick }: AdminHeaderProps) {
  const { user, logout } = useAuth()
  const [currentTime, setCurrentTime] = useState('در حال بارگذاری...')

  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date()
        const gregorianDate = now.toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })
        const time = now.toLocaleTimeString('fa-IR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
        const persianDate = now.toLocaleDateString('fa-IR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })
        setCurrentTime(`${persianDate} - ${time} | ${gregorianDate}`)
      } catch (error) {
        setCurrentTime('خطا در بارگذاری زمان')
      }
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className={`border-b transition-colors duration-300 w-full ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700 text-white' 
        : 'bg-white border-gray-200 text-gray-900'
    }`}>
      <div className="flex items-center justify-between px-6 py-4 h-28 w-full">
        
        {/* سمت چپ */}
        <div className="flex items-center flex-1">
          {/* دکمه منو موبایل */}
          <button
            onClick={onMenuClick}
            className={`lg:hidden p-2 rounded-md mr-4 transition-colors ${
              isDarkMode 
                ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* عنوان، خط جداکننده و ساعت */}
          <div className="flex items-center space-x-8 space-x-reverse mr-4">
            {/* عنوان */}
            <div className="min-w-max">
              <h1 className="text-xl font-semibold">پنل مدیریت پارسا گلد</h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                سیستم مدیریت کاربران و محتوا
              </p>
            </div>

            {/* خط جداکننده با فاصله زیاد */}
            <div className={`h-8 w-0.5 mx-4 ${isDarkMode ? 'bg-yellow-600' : 'bg-gray-300'}`}></div>

            {/* ساعت و تاریخ */}
            <div className={`text-xl min-w-max ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <div className="font-medium direction-ltr text-left bg-opacity-20 px-5 py-1 rounded">
                {currentTime}
              </div>
              <div className={`text-xs text-center mt-1 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'}`}>
                ساعت و تاریخ سیستم
              </div>
            </div>
          </div>
        </div>

        {/* سمت راست */}
        <div className="flex items-center space-x-4 space-x-reverse">
          {/* دکمه تغییر تم */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode 
                ? 'text-yellow-400 hover:bg-gray-700' 
                : 'text-amber-600 hover:bg-gray-100'
            }`}
            title={isDarkMode ? 'تغییر به تم روشن' : 'تغییر به تم تاریک'}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>

          {/* اطلاعات کاربر */}
          {user && (
            <div className="flex items-center space-x-5 space-x-reverse">
              <div className="text-right">
                <p className="font-medium">
                  {user.first_name} {user.last_name}
                </p>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {user.role === 'super_admin' ? 'سوپر ادمین' : 'ادمین'}
                </p>
              </div>
              
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                isDarkMode 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {user.first_name?.[0]}{user.last_name?.[0]}
              </div>

              <button
                onClick={logout}
                className={`p-4 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'text-red-400 hover:bg-gray-700' 
                    : 'text-red-600 hover:bg-gray-100'
                }`}
                title="خروج از سیستم"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}