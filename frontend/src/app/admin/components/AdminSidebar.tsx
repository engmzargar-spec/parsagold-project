'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '../../../contexts/AuthContext'
import Image from 'next/image'

interface AdminSidebarProps {
  isDarkMode: boolean
  onClose?: () => void
}

export default function AdminSidebar({ isDarkMode, onClose }: AdminSidebarProps) {
  const pathname = usePathname()
  const { user } = useAuth()

  const menuItems = [
    {
      name: 'داشبورد',
      href: '/admin/dashboard',
      icon: '📊',
      roles: ['super_admin', 'admin', 'chief', 'support', 'viewer']
    },
    {
      name: 'مانیتورینگ سیستم',
      href: '/admin/system-monitoring',
      icon: '📈',
      roles: ['super_admin', 'admin', 'chief', 'support']
    },
    {
      name: 'مدیریت کاربران سایت',
      href: '/admin/user-management',
      icon: '👥',
      roles: ['super_admin', 'admin', 'chief', 'support']
    },
    {
      name: 'مدیریت ادمین ها',
      href: '/admin/admin-management',
      icon: '🛡️',
      roles: ['super_admin', 'chief']
    },
    {
      name: 'مدیریت دسترسی ها',
      href: '/admin/permissions',
      icon: '🔐',
      roles: ['super_admin', 'chief']
    },
    {
      name: 'مدیریت پرسنل',
      href: '/admin/staff-management',
      icon: '👨‍💼',
      roles: ['super_admin', 'chief', 'admin']
    },
    {
      name: 'مدیریت مالی و حسابداری',
      href: '/admin/financial-management',
      icon: '💰',
      roles: ['super_admin', 'chief', 'admin']
    },
    {
      name: 'لاگ های سیستم',
      href: '/admin/audit-logs',
      icon: '📝',
      roles: ['super_admin', 'chief', 'admin']
    },
  ]

  const filteredMenuItems = menuItems.filter(item => 
    user?.role && item.roles.includes(user.role)
  )

  return (
    <div className={`w-64 h-full flex flex-col transition-colors duration-300 border-l-0 ${
      isDarkMode 
        ? 'bg-gray-800 text-white' 
        : 'bg-white text-gray-900'
    }`}>
      {/* هدر سایدبار - ارتفاع برابر با هدر و فقط لوگو */}
      <div className={`border-b h-28 flex items-center justify-center ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        {/* لوگو پارسا گلد - بزرگ و وسط */}
        <div className="w-17 h-17 rounded-lg flex items-center justify-center ">
          <Image 
            src="/logo/Parsagold-main-logo.png"
            alt="ParsaGold Logo"
            width={80}
            height={80}
            className="object-contain"
          />
        </div>
      </div>

      {/* منوی ناوبری */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {filteredMenuItems.map((item) => {
            const isActive = pathname === item.href
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center space-x-3 space-x-reverse p-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? isDarkMode
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-blue-100 text-blue-800 shadow-md'
                      : isDarkMode
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                  
                  {isActive && (
                    <div className={`w-2 h-2 rounded-full ${
                      isDarkMode ? 'bg-yellow-400' : 'bg-blue-600'
                    }`}></div>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* پاورقی سایدبار */}
      <div className={`p-4 border-t ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className={`p-3 rounded-lg ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
        }`}>
          <p className="text-sm font-medium">
            {user?.first_name} {user?.last_name}
          </p>
          <p className={`text-xs ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {user?.role === 'super_admin' ? 'سوپر ادمین' : 
             user?.role === 'chief' ? 'مدیر ارشد' :
             user?.role === 'admin' ? 'ادمین' :
             user?.role === 'support' ? 'پشتیبان' : 'بیننده'}
          </p>
        </div>
      </div>
    </div>
  )
}