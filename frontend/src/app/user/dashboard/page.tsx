// D:/parsagold-project/frontend/src/app/user/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// کامپوننت‌ها
import UserSidebar from '@/components/user/UserSidebar';
import TouchOptimized from '@/components/shared/TouchOptimized';

export default function DashboardPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [touchStart, setTouchStart] = useState<number | null>(null);

  // مدیریت سوایپ برای موبایل
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    // سوایپ چپ به راست برای باز کردن منو
    if (diff > 50) {
      setSidebarOpen(true);
    }
    // سوایپ راست به چپ برای بستن منو
    else if (diff < -50) {
      setSidebarOpen(false);
    }
    
    setTouchStart(null);
  };

  useEffect(() => {
    const checkAuth = () => {
      // اول access_token رو چک کن - این مهم‌تره
      const accessToken = localStorage.getItem('access_token');
      const userPhone = localStorage.getItem('userPhone');
      
      console.log('🔐 بررسی احراز هویت در داشبورد:', { 
        accessToken: accessToken ? '✅ موجود' : '❌ مفقود',
        userPhone: userPhone || '❌ مفقود'
      });
      
      if (!accessToken) {
        console.log('🚫 access_token وجود ندارد، هدایت به ثبت‌نام...');
        router.push('/auth/register');
        return;
      }
      
      // اگر access_token هست، کاربر رو اجازه بده بمونه
      setUserName(userPhone || 'کاربر');
      setIsMounted(true);
      
      // تنظیم تم
      const savedTheme = localStorage.getItem('parsagold-theme');
      if (savedTheme) {
        setIsDark(savedTheme === 'dark');
      }
      
      console.log('✅ احراز هویت موفق، نمایش داشبورد');
    };

    // تاخیر کوچک برای اطمینان از لود شدن localStorage
    setTimeout(checkAuth, 100);
  }, [router]);

  // بقیه کدها بدون تغییر...
  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    localStorage.setItem('parsagold-theme', newIsDark ? 'dark' : 'light');
  };

  const handleLogout = () => {
    if (confirm('آیا مطمئن هستید که می‌خواهید از حساب کاربری خارج شوید؟')) {
      localStorage.clear();
      sessionStorage.clear();
      router.push('/');
    }
  };

  const goToHomePage = () => {
    router.push('/');
  };

  // داده‌های نمونه برای کارت‌ها
  const statsData = {
    balance: 12500000,
    gold: 2.5,
    silver: 100,
    oil: 50,
    profit: 12.5
  };

  const quickActions = [
    { icon: '💰', label: 'واریز وجه', href: '/user/wallet', color: 'green' },
    { icon: '📈', label: 'معامله جدید', href: '/user/trading', color: 'blue' },
    { icon: '👤', label: 'تکمیل پروفایل', href: '/user/profile', color: 'amber' },
    { icon: '💼', label: 'مشاهده پورتفو', href: '/user/portfolio', color: 'purple' },
  ];

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-amber-700 font-semibold">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  // بقیه کدهای return بدون تغییر...
  return (
    <div 
      className={`min-h-screen transition-colors duration-300 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white' 
          : 'bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 text-gray-900'
      }`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      
      {/* هدر */}
      <header className={`sticky top-0 z-40 backdrop-blur-lg border-b transition-colors duration-300 ${
        isDark 
          ? 'bg-gray-800/80 border-yellow-500/30' 
          : 'bg-white/80 border-amber-500/30'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* سمت چپ - لوگو و منو */}
            <div className="flex items-center gap-4">
              {/* دکمه منو برای موبایل */}
              <TouchOptimized
                onClick={() => setSidebarOpen(true)}
                className={`lg:hidden p-2 rounded-lg transition-all ${
                  isDark 
                    ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                    : 'bg-amber-200 hover:bg-amber-300 text-amber-700'
                }`}
                ariaLabel="باز کردن منوی navigation"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </TouchOptimized>

              {/* لوگو */}
              <Link href="/user/dashboard" className="flex items-center gap-3" aria-label="پارسا گلد - بازگشت به داشبورد">
                <div className="w-10 h-10 relative">
                  <Image
                    src="/logo/Parsagold-main-logo.png"
                    alt="لوگوی پارسا گلد - پلتفرم مدیریت سرمایه"
                    fill
                    className="object-contain"
                    priority
                    sizes="40px"
                  />
                </div>
                <div className="hidden sm:block">
                  <h1 className={`text-xl font-bold ${
                    isDark ? 'text-yellow-400' : 'text-amber-600'
                  }`}>
                    پارسا گلد
                  </h1>
                </div>
              </Link>
            </div>

            {/* سمت راست - کنترل‌های کاربر */}
            <div className="flex items-center gap-2">
              
              {/* اطلاعات کاربر */}
              <div className="hidden sm:block text-right">
                <p className={`font-semibold ${
                  isDark ? 'text-yellow-400' : 'text-amber-600'
                }`}>
                  {userName || 'کاربر'}
                </p>
                <p className={`text-xs ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  سطح طلایی
                </p>
              </div>

              {/* دکمه برگشت به صفحه اصلی */}
              <TouchOptimized
                onClick={goToHomePage}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isDark 
                    ? 'bg-gray-700 hover:bg-gray-600 text-green-400' 
                    : 'bg-amber-200 hover:bg-amber-300 text-green-600'
                }`}
                ariaLabel="برگشت به صفحه اصلی سایت"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </TouchOptimized>

              {/* تغییر تم */}
              <TouchOptimized
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isDark 
                    ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                    : 'bg-amber-200 hover:bg-amber-300 text-amber-700'
                }`}
                ariaLabel={isDark ? 'تغییر به تم روشن' : 'تغییر به تم تاریک'}
              >
                {isDark ? '☀️' : '🌙'}
              </TouchOptimized>

              {/* دکمه خروج */}
              <TouchOptimized
                onClick={handleLogout}
                className={`p-2 rounded-lg transition-all ${
                  isDark 
                    ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-500/30' 
                    : 'bg-red-500/20 hover:bg-red-500/30 text-red-600 hover:text-red-700 border border-red-500/30'
                }`}
                ariaLabel="خروج از سیستم"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </TouchOptimized>
            </div>
          </div>
        </div>
      </header>

      {/* محتوای اصلی */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          
          {/* سایدبار */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <UserSidebar isDark={isDark} />
          </aside>

          {/* بخش اصلی محتوا */}
          <section className="flex-1 min-w-0">
            
            {/* کارت خوش آمدگویی */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl p-8 mb-6 text-center ${
                isDark 
                  ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30' 
                  : 'bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-200'
              }`}
            >
              <h1 className="text-3xl font-bold mb-4">🎉 به پارسا گلد خوش آمدید!</h1>
              <p className="text-lg mb-6">ثبت‌نام شما با موفقیت انجام شد و اکنون می‌توانید از خدمات ما استفاده کنید.</p>
              
              <div className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={action.href}
                      className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 ${
                        action.color === 'green' && 'bg-green-500 hover:bg-green-600' ||
                        action.color === 'blue' && 'bg-blue-500 hover:bg-blue-600' ||
                        action.color === 'amber' && 'bg-amber-500 hover:bg-amber-600' ||
                        action.color === 'purple' && 'bg-purple-500 hover:bg-purple-600'
                      } text-white`}
                    >
                      <span>{action.icon}</span>
                      {action.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* کارت‌های آماری */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* کارت موجودی کل */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`rounded-xl p-6 border-2 transition-all duration-300 ${
                  isDark 
                    ? 'bg-gray-800/50 border-yellow-500/40 hover:shadow-lg hover:shadow-yellow-500/20' 
                    : 'bg-white border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/20'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">موجودی کل</h3>
                  <span className="text-2xl">💰</span>
                </div>
                <p className={`text-2xl font-bold mb-2 ${
                  isDark ? 'text-yellow-400' : 'text-amber-600'
                }`}>
                  {statsData.balance.toLocaleString('fa-IR')}
                </p>
                <p className="text-sm opacity-75">تومان</p>
                <div className="flex justify-between items-center mt-3 text-sm">
                  <span className="text-green-400">+{statsData.profit}٪</span>
                  <span className="opacity-75">سود کل</span>
                </div>
              </motion.div>

              {/* کارت طلا */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`rounded-xl p-6 border-2 transition-all duration-300 ${
                  isDark 
                    ? 'bg-gray-800/50 border-yellow-500/40 hover:shadow-lg hover:shadow-yellow-500/20' 
                    : 'bg-white border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/20'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">موجودی طلا</h3>
                  <span className="text-2xl">🥇</span>
                </div>
                <p className={`text-2xl font-bold mb-2 ${
                  isDark ? 'text-yellow-400' : 'text-amber-600'
                }`}>
                  {statsData.gold} گرم
                </p>
                <p className="text-sm opacity-75">طلای ۱۸ عیار</p>
              </motion.div>

              {/* کارت نقره */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`rounded-xl p-6 border-2 transition-all duration-300 ${
                  isDark 
                    ? 'bg-gray-800/50 border-gray-400/40 hover:shadow-lg hover:shadow-gray-500/20' 
                    : 'bg-white border-gray-400/50 hover:shadow-lg hover:shadow-gray-500/20'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">موجودی نقره</h3>
                  <span className="text-2xl">🥈</span>
                </div>
                <p className="text-2xl font-bold mb-2 text-gray-400">
                  {statsData.silver} اونس
                </p>
                <p className="text-sm opacity-75">نقره جهانی</p>
              </motion.div>

              {/* کارت نفت */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={`rounded-xl p-6 border-2 transition-all duration-300 ${
                  isDark 
                    ? 'bg-gray-800/50 border-orange-500/40 hover:shadow-lg hover:shadow-orange-500/20' 
                    : 'bg-white border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/20'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">موجودی نفت</h3>
                  <span className="text-2xl">🛢️</span>
                </div>
                <p className="text-2xl font-bold mb-2 text-orange-400">
                  {statsData.oil} بشکه
                </p>
                <p className="text-sm opacity-75">نفت WTI</p>
              </motion.div>
            </div>

            {/* بخش اقدامات سریع */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className={`rounded-xl p-6 ${
                isDark ? 'bg-gray-800/50' : 'bg-white'
              }`}
            >
              <h2 className="text-xl font-bold mb-6">⚡ اقدامات سریع</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    href={action.href}
                    className={`flex flex-col items-center justify-center p-4 rounded-lg transition-all hover:scale-105 ${
                      isDark 
                        ? 'bg-gray-700 hover:bg-gray-600' 
                        : 'bg-amber-100 hover:bg-amber-200'
                    }`}
                  >
                    <span className="text-2xl mb-2">{action.icon}</span>
                    <span className="font-medium text-center">{action.label}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          </section>
        </div>
      </main>

      {/* منوی موبایل */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-80 z-50 lg:hidden"
            >
              <UserSidebar 
                isDark={isDark}
                onClose={() => setSidebarOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}