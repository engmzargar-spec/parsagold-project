'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface DashboardStats {
  total_users: number
  total_admins: number
  active_users: number
  total_trades: number
  total_volume: number
  total_profit: number
  total_loss: number
  active_tickets: number
  unread_messages: number
  system_health: string
}

// کامپوننت StatCard (بدون تغییر)
function StatCard({ 
  title, 
  value, 
  icon, 
  subtitle, 
  color, 
  isDarkMode 
}: {
  title: string
  value: string | number
  icon: string
  subtitle: string
  color: 'blue' | 'green' | 'purple' | 'yellow'
  isDarkMode: boolean
}) {
  const colorClasses = {
    blue: isDarkMode ? 'hover:border-blue-500' : 'hover:border-blue-600',
    green: isDarkMode ? 'hover:border-green-500' : 'hover:border-green-600',
    purple: isDarkMode ? 'hover:border-purple-500' : 'hover:border-purple-600',
    yellow: isDarkMode ? 'hover:border-yellow-500' : 'hover:border-yellow-600'
  }

  const textColors = {
    blue: isDarkMode ? 'text-blue-400' : 'text-blue-600',
    green: isDarkMode ? 'text-green-400' : 'text-green-600',
    purple: isDarkMode ? 'text-purple-400' : 'text-purple-600',
    yellow: isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
  }

  const bgColors = {
    blue: isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50',
    green: isDarkMode ? 'bg-green-500/10' : 'bg-green-50',
    purple: isDarkMode ? 'bg-purple-500/10' : 'bg-purple-50',
    yellow: isDarkMode ? 'bg-yellow-500/10' : 'bg-yellow-50'
  }

  return (
    <div className={`p-6 rounded-lg border transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700 hover:shadow-lg text-white' 
        : 'bg-white border-stone-200 hover:shadow-lg text-gray-900'
    } ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {title}
          </h3>
          <p className={`text-2xl font-bold ${textColors[color]}`}>
            {typeof value === 'number' ? new Intl.NumberFormat('fa-IR').format(value) : value}
          </p>
        </div>
        <div className={`text-2xl p-3 rounded-lg ${bgColors[color]}`}>
          {icon}
        </div>
      </div>
      <div className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        {subtitle}
      </div>
    </div>
  )
}

// کامپوننت ModuleCard (بدون تغییر)
function ModuleCard({ 
  title, 
  description, 
  icon, 
  href, 
  color, 
  isDarkMode 
}: {
  title: string
  description: string
  icon: string
  href: string
  color: 'blue' | 'green' | 'purple' | 'yellow'
  isDarkMode: boolean
}) {
  const colorClasses = {
    blue: isDarkMode ? 'hover:border-blue-500' : 'hover:border-blue-600',
    green: isDarkMode ? 'hover:border-green-500' : 'hover:border-green-600',
    purple: isDarkMode ? 'hover:border-purple-500' : 'hover:border-purple-600',
    yellow: isDarkMode ? 'hover:border-yellow-500' : 'hover:border-yellow-600'
  }

  return (
    <Link 
      href={href}
      className={`p-4 rounded-lg border transition-all duration-300 block group ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-white' 
          : 'bg-white border-stone-200 hover:bg-stone-100 text-gray-900'
      } ${colorClasses[color]}`}
    >
      <div className="flex items-center gap-3">
        <div className={`text-2xl group-hover:scale-110 transition-transform p-2 rounded-lg ${
          isDarkMode ? 'bg-gray-700' : 'bg-stone-100'
        }`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} line-clamp-2`}>
            {description}
          </p>
        </div>
      </div>
    </Link>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const router = useRouter()

  useEffect(() => {
    console.log('🔍 Dashboard - شروع بارگذاری')
    
    // ✅ ساده‌سازی: فقط برای دیباگ چک می‌کنیم، redirect نمی‌دهیم
    // چون AdminLayout قبلاً احراز هویت را بررسی کرده
    const token = localStorage.getItem('admin_token')
    const userData = localStorage.getItem('admin_user')
    
    console.log('📋 وضعیت auth در dashboard:', { 
      token: token ? '✅ موجود' : '❌ مفقود',
      userData: userData ? '✅ موجود' : '❌ مفقود'
    })

    console.log('✅ ادامه فرآیند بارگذاری آمار...')
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      console.log('📊 شروع دریافت آمار...')

      // استفاده از داده‌های نمونه موقت
      setTimeout(() => {
        setStats({
          total_users: 156, 
          total_admins: 5, 
          active_users: 142,
          total_trades: 892, 
          total_volume: 125000000000,
          total_profit: 4500000000, 
          total_loss: 1200000000,
          active_tickets: 12, 
          unread_messages: 7, 
          system_health: 'excellent'
        })
        setLoading(false)
        console.log('✅ آمار بارگذاری شد')
      }, 1000)

    } catch (error) {
      console.error('❌ خطا در دریافت آمار:', error)
      setLoading(false)
    }
  }

  const getHealthBadge = (health: string) => {
    const config = {
      excellent: { 
        color: isDarkMode ? 'bg-green-900/50 text-green-300 border border-green-700' : 'bg-green-100 text-green-800 border border-green-300', 
        text: 'عالی' 
      },
      good: { 
        color: isDarkMode ? 'bg-blue-900/50 text-blue-300 border border-blue-700' : 'bg-blue-100 text-blue-800 border border-blue-300', 
        text: 'خوب' 
      },
      warning: { 
        color: isDarkMode ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-700' : 'bg-yellow-100 text-yellow-800 border border-yellow-300', 
        text: 'هشدار' 
      },
      critical: { 
        color: isDarkMode ? 'bg-red-900/50 text-red-300 border border-red-700' : 'bg-red-100 text-red-800 border border-red-300', 
        text: 'بحرانی' 
      }
    }[health] || { 
      color: isDarkMode ? 'bg-blue-900/50 text-blue-300 border border-blue-700' : 'bg-blue-100 text-blue-800 border border-blue-300', 
      text: 'خوب' 
    }

    return <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>{config.text}</span>
  }

  const formatCurrency = (amount: number) => new Intl.NumberFormat('fa-IR').format(amount) + ' ریال'

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        <div className="flex flex-col items-center gap-3">
          <div className={`w-8 h-8 border-4 rounded-full animate-spin ${
            isDarkMode 
              ? 'border-yellow-500 border-t-transparent' 
              : 'border-amber-600 border-t-transparent'
          }`}></div>
          <div className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
            در حال بارگذاری آمار...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-full transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      <div className={`border-2 transition-colors duration-300 ${
        isDarkMode ? 'border-gray-600 bg-gray-900/30' : 'border-stone-300 bg-stone-50'
      } m-0 p-6 min-h-screen`}>

        <div className="mb-8">
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            داشبورد مدیریت
          </h1>
          <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            خلاصه‌ای از فعالیت‌ها و آمار سیستم
          </p>
        </div>

        {/* کارت‌های آمار */}
        {stats && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              <StatCard 
                title="کل کاربران" 
                value={stats.total_users} 
                icon="👥" 
                subtitle={`${stats.active_users} کاربر فعال`}
                color="blue"
                isDarkMode={isDarkMode}
              />
              <StatCard 
                title="معاملات" 
                value={stats.total_trades} 
                icon="💹" 
                subtitle={`حجم: ${formatCurrency(stats.total_volume)}`}
                color="green"
                isDarkMode={isDarkMode}
              />
              <StatCard 
                title="سود خالص" 
                value={formatCurrency(stats.total_profit - stats.total_loss)} 
                icon="📈" 
                subtitle={`سود: ${formatCurrency(stats.total_profit)}`}
                color="purple"
                isDarkMode={isDarkMode}
              />
              <StatCard 
                title="پشتیبانی" 
                value={stats.active_tickets} 
                icon="🎫" 
                subtitle={`${stats.unread_messages} پیام جدید`}
                color="yellow"
                isDarkMode={isDarkMode}
              />
            </div>

            {/* وضعیت سیستم */}
            <div className={`rounded-lg border p-6 mb-8 transition-colors duration-300 ${
              isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-stone-200 text-gray-900'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    وضعیت سیستم
                  </h3>
                  <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    بررسی سلامت کلی پلتفرم
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {getHealthBadge(stats.system_health)}
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${
                      isDarkMode ? 'bg-green-500' : 'bg-green-600'
                    }`}></div>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      آنلاین
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* دسترسی سریع */}
        <div>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            دسترسی سریع
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ModuleCard 
              title="مدیریت کاربران" 
              description="مدیریت کاربران عادی سیستم"
              icon="👥"
              href="/admin/users"
              color="blue"
              isDarkMode={isDarkMode}
            />
            <ModuleCard 
              title="مدیریت ادمین‌ها" 
              description="مدیریت دسترسی‌های مدیریتی"
              icon="🛡️"
              href="/admin/admins"
              color="green"
              isDarkMode={isDarkMode}
            />
            <ModuleCard 
              title="تراکنش‌ها" 
              description="مشاهده و مدیریت تراکنش‌ها"
              icon="💰"
              href="/admin/trades"
              color="yellow"
              isDarkMode={isDarkMode}
            />
            <ModuleCard 
              title="گزارشات مالی" 
              description="گزارشات مالی و آماری"
              icon="📈"
              href="/admin/reports"
              color="purple"
              isDarkMode={isDarkMode}
            />
          </div>
        </div>
      </div>
    </div>
  )
}