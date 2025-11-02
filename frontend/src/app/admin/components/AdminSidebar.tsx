// frontend/src/app/admin/components/AdminSidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

interface AdminSidebarProps {
  onClose?: () => void
  isDarkMode?: boolean
}

const menuItems = [
  { href: '/admin/dashboard', icon: '📊', label: 'داشبورد', badge: null },
  { href: '/admin/users', icon: '👥', label: 'مدیریت کاربران', badge: null },
  { href: '/admin/admins', icon: '🛡️', label: 'مدیریت ادمین‌ها', badge: null },
  { href: '/admin/trades', icon: '💰', label: 'تراکنش‌ها', badge: null },
  { href: '/admin/reports', icon: '📈', label: 'گزارشات مالی', badge: null },
  { href: '/admin/support', icon: '🎫', label: 'پشتیبانی', badge: '12' },
  { href: '/admin/messages', icon: '📨', label: 'سیستم پیام', badge: '7' },
  { href: '/admin/monitoring', icon: '👁️', label: 'مانیتورینگ', badge: null },
  { href: '/admin/settings', icon: '⚙️', label: 'تنظیمات', badge: null },
  { href: '/admin/logs', icon: '📋', label: 'لاگ سیستم', badge: null },
]

export default function AdminSidebar({ onClose, isDarkMode = true }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <div className={`w-64 h-full flex flex-col  transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-800 ' 
        : 'bg-stone-700  text-white' // ✅ تغییر به قهوه‌ای شکلاتی
    }`}>
      {/* هدر سایدبار */}
      <div className={`p-4.5  transition-colors duration-300 ${
        isDarkMode 
          ? '' 
          : '' // ✅ تغییر به قهوه‌ای تیره‌تر
      }`}>
        <div className="flex flex-col items-center justify-center text-center gap-2">
          <div className="w-25 h-25 relative">
            <Image
              src="/logo/Parsagold-main-logo.png"
              alt="پارسا گلد"
              width={80}
              height={80}
              className="object-contain"
            />
          </div>
         
        </div>
      </div>

      {/* منو */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center justify-between gap-3 p-3 rounded-lg transition-all duration-200 group ${
                isActive
                  ? isDarkMode
                    ? 'bg-yellow-500/20 text-yellow-400 border-r-2 border-yellow-500 shadow-sm'
                    : 'bg-amber-300 text-black border-r-2 border-amber-400 shadow-sm' // ✅ تغییر به قهوه‌ای تیره‌تر
                  : isDarkMode
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    : 'text-amber-100 hover:bg-amber-200 hover:text-black' // ✅ تغییر به قهوه‌ای تیره‌تر
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`text-lg group-hover:scale-110 transition-transform ${
                  isActive && isDarkMode ? 'text-yellow-400' : 
                  isActive && !isDarkMode ? 'text-white' : 'text-amber-100' // ✅ آیکون‌ها روشن‌تر
                }`}>
                  {item.icon}
                </span>
                <span className="font-medium text-sm">{item.label}</span>
              </div>
              
              {item.badge && (
                <span className={`text-xs px-2 py-1 rounded-full min-w-5 text-center ${
                  isDarkMode 
                    ? 'bg-red-600 text-white' 
                    : 'bg-red-400 text-white' // ✅ badge روشن‌تر
                }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* فوتر سایدبار */}
      <div className={`p-4 border-t transition-colors duration-300 ${
        isDarkMode 
          ? 'border-gray-700' 
          : 'border-amber-600' // ✅ تغییر به قهوه‌ای تیره‌تر
      }`}>
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              isDarkMode ? 'bg-green-500' : 'bg-green-300' // ✅ سبز روشن‌تر
            }`}></div>
            <span className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-amber-100' // ✅ متن روشن‌تر
            }`}>
              سیستم فعال
            </span>
          </div>
          <div className={`text-xs ${
            isDarkMode ? 'text-gray-500' : 'text-amber-200' // ✅ متن روشن‌تر
          }`}>
            v2.0.0
          </div>
        </div>
      </div>
    </div>
  )
}