// D:/parsagold-project/frontend/src/components/user/UserSidebar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface UserSidebarProps {
  isDark?: boolean;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onClose?: () => void;
}

export default function UserSidebar({ 
  isDark = true, 
  activeTab = 'overview',
  onTabChange,
  onClose 
}: UserbarProps) {
  const pathname = usePathname();

  const menuItems = [
    { 
      category: 'حساب کاربری',
      items: [
        { id: 'dashboard', label: 'داشبورد', icon: '📊', href: '/user/dashboard' },
        { id: 'profile', label: 'پروفایل', icon: '👤', href: '/user/profile' },
        { id: 'security', label: 'امنیت', icon: '🔒', href: '/user/security' },
      ]
    },
    {
      category: 'امور مالی',
      items: [
        { id: 'wallet', label: 'کیف پول', icon: '💳', href: '/user/wallet' },
        { id: 'portfolio', label: 'پورتفو', icon: '💼', href: '/user/portfolio' },
        { id: 'history', label: 'تاریخچه', icon: '📋', href: '/user/history' },
      ]
    },
    {
      category: 'معاملات',
      items: [
        { id: 'trading', label: 'معاملات', icon: '📈', href: '/user/trading' },
        { id: 'orders', label: 'سفارش‌ها', icon: '🛒', href: '/user/orders' },
      ]
    },
    {
      category: 'پشتیبانی',
      items: [
        { id: 'support', label: 'پشتیبانی', icon: '🎧', href: '/user/support' },
        { id: 'settings', label: 'تنظیمات', icon: '⚙️', href: '/user/settings' },
      ]
    }
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div className={`h-full ${isDark ? 'bg-gray-800' : 'bg-white'} transition-colors duration-300`}>
      {/* هدر سایدبار */}
      <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            منو
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className={`p-1 rounded ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* محتوای منو */}
      <div className="p-4 space-y-6 overflow-y-auto h-[calc(100vh-80px)]">
        {menuItems.map((section, index) => (
          <div key={index}>
            <h3 className={`text-sm font-semibold mb-3 px-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {section.category}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => {
                    onTabChange?.(item.id);
                    onClose?.();
                  }}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                    isActive(item.href)
                      ? isDark 
                        ? 'bg-yellow-500 text-black shadow-lg' 
                        : 'bg-amber-500 text-white shadow-lg'
                      : isDark
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        : 'text-gray-700 hover:bg-amber-100 hover:text-amber-700'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* کارت وضعیت کاربر */}
        <div className={`mt-8 p-4 rounded-lg border ${
          isDark 
            ? 'bg-gray-700/50 border-yellow-500/30' 
            : 'bg-amber-50 border-amber-500/30'
        }`}>
          <div className="text-center">
            <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
              isDark ? 'bg-yellow-500/20' : 'bg-amber-500/20'
            }`}>
              <span className="text-xl">⭐</span>
            </div>
            <h4 className={`font-semibold ${isDark ? 'text-yellow-400' : 'text-amber-600'}`}>
              سطح طلایی
            </h4>
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              برای دسترسی به خدمات کامل، پروفایل خود را تکمیل کنید
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}