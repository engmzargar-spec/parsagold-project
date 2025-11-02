// frontend/src/app/admin/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

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

interface UserInfo {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: string
  access_grade?: string
  needs_approval: boolean
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [currentTime, setCurrentTime] = useState('')
  const [currentDate, setCurrentDate] = useState('')
  const [gregorianDate, setGregorianDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin/login')
      return
    }

    // بررسی تم ذخیره شده
    const savedTheme = localStorage.getItem('admin_theme')
    setIsDarkMode(savedTheme ? savedTheme === 'dark' : true)
    
    fetchUserInfo()
    fetchStats()
    updateDateTime()
    
    const timer = setInterval(updateDateTime, 1000)
    return () => clearInterval(timer)
  }, [router])

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const adminInfo = localStorage.getItem('admin_info')
      
      if (!token || !adminInfo) {
        console.error('توکن یا اطلاعات کاربر یافت نشد')
        handleLogout()
        return
      }

      // ✅ استفاده از اطلاعات ذخیره شده در localStorage از login
      const userData = JSON.parse(adminInfo)
      
      // ✅ ساخت userInfo از داده‌های ذخیره شده
      const userInfoData: UserInfo = {
        id: userData.id || 1,
        username: userData.username || 'admin',
        email: userData.email || 'admin@parsagold.com',
        first_name: userData.full_name?.split(' ')[0] || 'مدیر',
        last_name: userData.full_name?.split(' ').slice(1).join(' ') || 'سیستم',
        role: userData.role || 'chief',
        access_grade: userData.role || 'chief',
        needs_approval: !(userData.is_approved || true)
      }
      
      setUserInfo(userInfoData)
      
    } catch (error) {
      console.error('Error fetching user info:', error)
      // ❌ خطا رو لاگ کن اما کاربر رو خارج نکن
    }
  }

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
      day: 'numeric',
      weekday: 'long'
    })
    setCurrentDate(jalaliDate)
    
    const gregorian = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
    setGregorianDate(gregorian)
  }

  const toggleTheme = () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)
    localStorage.setItem('admin_theme', newTheme ? 'dark' : 'light')
  }

  const fetchStats = async () => {
    try {
      setTimeout(() => {
        setStats({
          total_users: 156, total_admins: 5, active_users: 142,
          total_trades: 892, total_volume: 125000000000,
          total_profit: 4500000000, total_loss: 1200000000,
          active_tickets: 12, unread_messages: 7, system_health: 'excellent'
        })
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error:', error)
      setLoading(false)
    }
  }

  const handleLogout = () => {
    // ✅ حذف تمام items مربوط به admin
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_username')
    localStorage.removeItem('admin_grade')
    localStorage.removeItem('admin_info')
    router.push('/admin/login')
  }

  const getHealthBadge = (health: string) => {
    const config = {
      excellent: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', text: 'عالی' },
      good: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', text: 'خوب' },
      warning: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', text: 'هشدار' },
      critical: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', text: 'بحرانی' }
    }[health] || { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', text: 'خوب' }
    
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>{config.text}</span>
  }

  const getUserRoleBadge = (role: string, accessGrade?: string) => {
    const roleConfig = {
      'super_admin': { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300', text: 'سوپر ادمین' },
      'admin': { 
        'chief': { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', text: 'مدیر ارشد' },
        'grade1': { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300', text: 'مدیر سطح ۱' },
        'grade2': { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', text: 'مدیر سطح ۲' },
        'grade3': { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', text: 'مدیر سطح ۳' }
      },
      'user': { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300', text: 'کاربر عادی' }
    }

    let config
    if (role === 'admin' && accessGrade) {
      config = roleConfig.admin[accessGrade as keyof typeof roleConfig.admin]
    } else {
      config = roleConfig[role as keyof typeof roleConfig]
    }

    return config ? (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    ) : null
  }

  const formatNumber = (num: number) => new Intl.NumberFormat('fa-IR').format(num)
  const formatCurrency = (amount: number) => new Intl.NumberFormat('fa-IR').format(amount) + ' ریال'

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className={isDarkMode ? 'text-white' : 'text-gray-900'}>در حال بارگذاری...</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} p-4 sm:p-6`}>
      
      {/* هدر دسکتاپ */}
      <div className="hidden lg:flex justify-between items-start lg:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="h-40 w-40 relative">
            <Image
              src="/logo/parsagold-main-logo.png"
              alt="پارسا گلد"
              width={120}
              height={120}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold">پارسا گلد - پنل مدیریت</h1>
            <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>سیستم معاملات طلا، نقره و نفت</p>
            
            {/* نمایش اطلاعات کاربر */}
            {userInfo && (
              <div className={`mt-3 p-3 rounded-lg border ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    {userInfo.first_name[0]}{userInfo.last_name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {userInfo.first_name} {userInfo.last_name}
                      </span>
                      {getUserRoleBadge(userInfo.role, userInfo.access_grade)}
                    </div>
                    <div className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      @{userInfo.username}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* دکمه تغییر تم */}
          <button 
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode 
                ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' 
                : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
            }`}
            aria-label="تغییر تم"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>

          {/* بخش تاریخ و زمان */}
          <div className={`px-4 py-3 rounded-lg border ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } text-center`}>
            <div className="text-2xl font-bold text-blue-500">{currentTime}</div>
            <div className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{currentDate}</div>
            <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{gregorianDate}</div>
          </div>
          
          <div className="flex gap-3">
            <div className={`px-4 py-3 rounded-lg border ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>وضعیت سیستم</div>
              <div className="flex items-center gap-2 mt-1">
                {stats && getHealthBadge(stats.system_health)}
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            <button onClick={handleLogout} className={`px-4 py-3 rounded-lg transition-colors whitespace-nowrap ${
              isDarkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600 text-white'
            }`}>
              خروج از سیستم
            </button>
          </div>
        </div>
      </div>

      {/* هدر موبایل و تبلت */}
      <div className="lg:hidden space-y-4 mb-8">
        {/* ردیف اول موبایل */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 relative">
              <Image
                src="/logo/parsagold-main-logo.png"
                alt="پارسا گلد"
                width={40}
                height={40}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="text-xl font-bold">پارسا گلد</h1>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>پنل مدیریت</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' 
                  : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
              }`}
              aria-label="تغییر تم"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            
            <button onClick={handleLogout} className={`px-3 py-2 rounded-lg transition-colors text-sm ${
              isDarkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600 text-white'
            }`}>
              خروج
            </button>
          </div>
        </div>

        {/* نمایش اطلاعات کاربر در موبایل */}
        {userInfo && (
          <div className={`p-3 rounded-lg border ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {userInfo.first_name[0]}{userInfo.last_name[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm">
                    {userInfo.first_name} {userInfo.last_name}
                  </span>
                  {getUserRoleBadge(userInfo.role, userInfo.access_grade)}
                </div>
                <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  @{userInfo.username}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ردیف دوم موبایل */}
        <div className="grid grid-cols-2 gap-3">
          <div className={`p-3 rounded-lg border ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } text-center`}>
            <div className="text-lg font-bold text-blue-500">{currentTime}</div>
            <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{currentDate}</div>
          </div>
          
          <div className={`p-3 rounded-lg border ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } text-center`}>
            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>وضعیت سیستم</div>
            <div className="flex items-center justify-center gap-2 mt-1">
              {stats && getHealthBadge(stats.system_health)}
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* کارت‌های آمار اصلی */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <StatCard 
          title="کل کاربران" 
          value={stats!.total_users} 
          icon="👥" 
          subtitle={`${stats!.active_users} کاربر فعال`}
          color="blue"
          isDarkMode={isDarkMode}
        />
        <StatCard 
          title="معاملات" 
          value={stats!.total_trades} 
          icon="💹" 
          subtitle={`حجم: ${formatCurrency(stats!.total_volume)}`}
          color="green"
          isDarkMode={isDarkMode}
        />
        <StatCard 
          title="سود خالص" 
          value={formatCurrency(stats!.total_profit - stats!.total_loss)} 
          icon="📈" 
          subtitle={`سود: ${formatCurrency(stats!.total_profit)}`}
          color="purple"
          isDarkMode={isDarkMode}
        />
        <StatCard 
          title="پشتیبانی" 
          value={stats!.active_tickets} 
          icon="🎫" 
          subtitle={`${stats!.unread_messages} پیام جدید`}
          color="yellow"
          isDarkMode={isDarkMode}
        />
      </div>

      {/* منوی ماژول‌ها */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
          title="پشتیبانی" 
          description="مدیریت تیکت‌های پشتیبانی"
          icon="🎫"
          href="/admin/support"
          color="yellow"
          isDarkMode={isDarkMode}
        />
        <ModuleCard 
          title="مانیتورینگ" 
          description="نظارت بر فعالیت‌های سیستم"
          icon="📈"
          href="/admin/monitoring"
          color="purple"
          isDarkMode={isDarkMode}
        />
        <ModuleCard 
          title="سیستم پیام" 
          description="ارسال پیام و اعلان‌ها"
          icon="📨"
          href="/admin/messages"
          color="indigo"
          isDarkMode={isDarkMode}
        />
        <ModuleCard 
          title="گزارشات مالی" 
          description="گزارشات مالی و تراکنش‌ها"
          icon="💰"
          href="/admin/reports"
          color="emerald"
          isDarkMode={isDarkMode}
        />
        <ModuleCard 
          title="تنظیمات سیستم" 
          description="تنظیمات کلی پلتفرم"
          icon="⚙️"
          href="/admin/settings"
          color="gray"
          isDarkMode={isDarkMode}
        />
        <ModuleCard 
          title="لاگ سیستم" 
          description="مشاهده لاگ‌های سیستم"
          icon="📋"
          href="/admin/logs"
          color="red"
          isDarkMode={isDarkMode}
        />
      </div>
    </div>
  )
}

// کامپوننت کارت آمار
function StatCard({ title, value, icon, subtitle, color, isDarkMode }: {
  title: string
  value: string | number
  icon: string
  subtitle: string
  color: string
  isDarkMode: boolean
}) {
  const colorClasses = {
    blue: 'hover:border-blue-500',
    green: 'hover:border-green-500',
    purple: 'hover:border-purple-500',
    yellow: 'hover:border-yellow-500'
  }

  const textColors = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    purple: 'text-purple-500', 
    yellow: 'text-yellow-500'
  }

  return (
    <div className={`p-4 sm:p-6 rounded-lg border transition-colors ${
      isDarkMode 
        ? `bg-gray-800 border-gray-700 ${colorClasses[color as keyof typeof colorClasses]}` 
        : `bg-white border-gray-200 ${colorClasses[color as keyof typeof colorClasses]} shadow-sm`
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{title}</h3>
          <p className={`text-2xl sm:text-3xl font-bold ${textColors[color as keyof typeof textColors]}`}>
            {typeof value === 'number' ? new Intl.NumberFormat('fa-IR').format(value) : value}
          </p>
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
      <div className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{subtitle}</div>
    </div>
  )
}

// کامپوننت کارت ماژول
function ModuleCard({ title, description, icon, href, color, isDarkMode }: {
  title: string
  description: string
  icon: string
  href: string
  color: string
  isDarkMode: boolean
}) {
  const colorClasses = {
    blue: 'hover:border-blue-500',
    green: 'hover:border-green-500',
    yellow: 'hover:border-yellow-500', 
    purple: 'hover:border-purple-500',
    indigo: 'hover:border-indigo-500',
    emerald: 'hover:border-emerald-500',
    gray: 'hover:border-gray-500',
    red: 'hover:border-red-500'
  }

  return (
    <Link href={href} className={`p-4 sm:p-6 rounded-lg border transition-colors block group ${
      isDarkMode 
        ? `bg-gray-800 border-gray-700 ${colorClasses[color as keyof typeof colorClasses]}` 
        : `bg-white border-gray-200 ${colorClasses[color as keyof typeof colorClasses]} shadow-sm hover:shadow-md`
    }`}>
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform">{icon}</div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 truncate">{title}</h3>
          <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} line-clamp-2`}>{description}</p>
        </div>
      </div>
    </Link>
  )
}