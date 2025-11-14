// components/dashboard/DashboardSidebar.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface DashboardSidebarProps {
  isDark: boolean;
}

export default function DashboardSidebar({ isDark }: DashboardSidebarProps) {
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    profile: false,
    wallet: false,
    portfolio: false,
    trading: false
  });

  const toggleMenu = (menu: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const menuItems = [
    {
      id: 'profile',
      title: '👤 پروفایل کاربری',
      icon: '👤',
      submenus: [
        { title: 'مشخصات کاربر', href: '/dashboard/profile' },
        { title: 'احراز هویت', href: '/dashboard/verification' },
        { title: 'تغییر رمز عبور', href: '/dashboard/change-password' },
        { title: 'فعالسازی رمز دو عاملی', href: '/dashboard/2fa' },
        { title: 'ثبت حساب بانکی', href: '/dashboard/bank-accounts' }
      ]
    },
    {
      id: 'wallet',
      title: '💰 کیف پول',
      icon: '💰',
      submenus: [
        { title: 'واریز', href: '/dashboard/deposit' },
        { title: 'برداشت', href: '/dashboard/withdraw' },
        { title: 'تاریخچه تراکنش‌ها', href: '/dashboard/transactions' }
      ]
    },
    {
      id: 'portfolio',
      title: '📊 ایجاد پورتفو',
      icon: '📊',
      submenus: [
        { title: 'پورتفوی طلا', href: '/dashboard/gold-portfolio' },
        { title: 'پورتفوی نقره', href: '/dashboard/silver-portfolio' },
        { title: 'پورتفوی نفت', href: '/dashboard/oil-portfolio' }
      ]
    },
    {
      id: 'trading',
      title: '📈 سیستم معاملات',
      icon: '📈',
      submenus: [
        { title: 'معاملات بازار (واقعی)', href: '/trading/live' },
        { title: 'معاملات دمو', href: '/trading/demo' },
        { title: 'تاریخچه معاملات', href: '/trading/history' }
      ]
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`w-full rounded-2xl border p-4 lg:p-6 h-fit sticky top-4 transition-colors duration-300 ${
        isDark 
          ? 'bg-gradient-to-b from-gray-800 to-gray-900 border-yellow-500/20' 
          : 'bg-gradient-to-b from-white to-amber-50 border-amber-500/30'
      }`}
    >
      <h3 className={`text-lg lg:text-xl font-bold mb-4 lg:mb-6 text-center border-b pb-3 lg:pb-4 transition-colors duration-300 ${
        isDark 
          ? 'text-yellow-400 border-yellow-500/30' 
          : 'text-amber-600 border-amber-500/30'
      }`}>
        منوی کاربری
      </h3>
      
      <div className="space-y-2">
        {menuItems.map((item) => (
          <div key={item.id} className={`border-b last:border-b-0 transition-colors duration-300 ${
            isDark ? 'border-gray-700/50' : 'border-amber-200/50'
          }`}>
            <button
              onClick={() => toggleMenu(item.id)}
              className={`w-full flex items-center justify-between p-3 text-right rounded-lg transition-all duration-200 group ${
                isDark 
                  ? 'hover:bg-gray-700/50' 
                  : 'hover:bg-amber-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{item.icon}</span>
                <span className={`font-semibold transition-colors duration-300 group-hover:text-yellow-400 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {item.title}
                </span>
              </div>
              <motion.span
                animate={{ rotate: openMenus[item.id] ? 180 : 0 }}
                className={isDark ? 'text-gray-400' : 'text-gray-600'}
              >
                ▼
              </motion.span>
            </button>
            
            <motion.div
              initial={false}
              animate={{ 
                height: openMenus[item.id] ? 'auto' : 0,
                opacity: openMenus[item.id] ? 1 : 0
              }}
              className="overflow-hidden"
            >
              <div className="pb-2 pl-4 lg:pl-6 space-y-1">
                {item.submenus.map((submenu, index) => (
                  <Link
                    key={index}
                    href={submenu.href}
                    className={`block py-2 px-3 lg:px-4 text-sm rounded-lg transition-all duration-200 border-l-2 text-xs lg:text-sm ${
                      isDark
                        ? 'text-gray-300 hover:text-yellow-400 hover:bg-gray-700/30 border-transparent hover:border-yellow-400'
                        : 'text-gray-700 hover:text-amber-600 hover:bg-amber-100 border-transparent hover:border-amber-400'
                    }`}
                  >
                    {submenu.title}
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        ))}
      </div>

      {/* دکمه‌های شورت کات معاملات */}
      <div className="mt-4 lg:mt-6 space-y-2 lg:space-y-3">
        <Link
          href="/trading/live"
          className={`w-full font-bold py-2 lg:py-3 px-3 lg:px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 text-sm lg:text-base ${
            isDark
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
              : 'bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white'
          }`}
        >
          🚀 ورود به سیستم معاملات
        </Link>
        <Link
          href="/trading/demo"
          className={`w-full font-bold py-2 lg:py-3 px-3 lg:px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 text-sm lg:text-base ${
            isDark
              ? 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white'
              : 'bg-gradient-to-r from-blue-400 to-cyan-500 hover:from-blue-500 hover:to-cyan-600 text-white'
          }`}
        >
          🎯 ورود به معاملات دمو
        </Link>
      </div>
    </motion.div>
  );
}