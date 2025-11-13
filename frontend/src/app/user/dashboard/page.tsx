// app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import WorldMarketMap from '@/components/dashboard/WorldMarketMap';

// Types
interface User {
  firstName: string;
  phone: string;
  level: 'طلایی' | 'نقره‌ای' | 'برنزی';
  joinDate: string;
  verified: boolean;
}

interface PortfolioData {
  asset: string;
  amount: number;
  value: number;
  percentage: number;
  color: string;
}

interface WalletHistory {
  date: string;
  balance: number;
  type: 'deposit' | 'withdraw' | 'trade';
}

export default function DashboardPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // تشخیص اندازه صفحه
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Mock data
  const mockUser: User = {
    firstName: 'مهدی',
    phone: '0912xxxxxxx',
    level: 'طلایی',
    joinDate: '۱۴۰۳/۰۷/۰۱',
    verified: true
  };

  const mockPortfolio: PortfolioData[] = [
    { asset: 'طلای جهانی', amount: 2.5, value: 4875000, percentage: 45, color: '#F59E0B' },
    { asset: 'نقره', amount: 100, value: 2350000, percentage: 25, color: '#C0C0C0' },
    { asset: 'نفت WTI', amount: 50, value: 3910000, percentage: 30, color: '#FF6B35' },
  ];

  const mockWalletHistory: WalletHistory[] = [
    { date: '۲۷ مهر', balance: 8000000, type: 'deposit' },
    { date: '۲۶ مهر', balance: 7500000, type: 'withdraw' },
    { date: '۲۵ مهر', balance: 8200000, type: 'trade' },
    { date: '۲۴ مهر', balance: 7800000, type: 'deposit' },
    { date: '۲۳ مهر', balance: 7200000, type: 'trade' },
    { date: '۲۲ مهر', balance: 7000000, type: 'deposit' },
    { date: '۲۱ مهر', balance: 6500000, type: 'withdraw' },
  ];

  // Fetch real data from API
  const { data: userData } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      return mockUser;
    }
  });

  const { data: portfolioData } = useQuery({
    queryKey: ['portfolio'],
    queryFn: async () => {
      return mockPortfolio;
    }
  });

  const { data: walletHistory } = useQuery({
    queryKey: ['walletHistory'],
    queryFn: async () => {
      return mockWalletHistory;
    }
  });

  useEffect(() => {
    setIsMounted(true);
    
    // بررسی تم ذخیره شده - فقط در کلاینت
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('parsagold-theme');
      if (savedTheme) {
        setIsDark(savedTheme === 'dark');
      }
    }
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    if (typeof window !== 'undefined') {
      localStorage.setItem('parsagold-theme', newIsDark ? 'dark' : 'light');
    }
  };

  const handleLogout = () => {
    // پاک کردن کامل تمام اطلاعات کاربر
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
      
      // پاک کردن کوکی‌ها
      document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      console.log('✅ کاربر از سیستم خارج شد - تمام داده‌ها پاک شد');
    }
    
    // هدایت به صفحه اصلی
    router.push('/');
  };

  // کامپوننت نمودار دایره‌ای برای پورتفو
  const PortfolioPieChart = () => {
    if (!portfolioData) return null;

    let currentAngle = 0;
    const totalValue = portfolioData.reduce((sum, item) => sum + item.value, 0);

    return (
      <div className="h-64 relative">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
        >
          {portfolioData.map((item, index) => {
            const percentage = (item.value / totalValue) * 100;
            const angle = (percentage / 100) * 360;
            const largeArcFlag = angle > 180 ? 1 : 0;
            
            const x1 = 50 + 40 * Math.cos(currentAngle * Math.PI / 180);
            const y1 = 50 + 40 * Math.sin(currentAngle * Math.PI / 180);
            const x2 = 50 + 40 * Math.cos((currentAngle + angle) * Math.PI / 180);
            const y2 = 50 + 40 * Math.sin((currentAngle + angle) * Math.PI / 180);
            
            const pathData = [
              `M 50 50`,
              `L ${x1} ${y1}`,
              `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              `Z`
            ].join(' ');
            
            const currentAngleCopy = currentAngle;
            currentAngle += angle;
            
            return (
              <path
                key={index}
                d={pathData}
                fill={item.color}
                stroke={isDark ? "#1f2937" : "#ffffff"}
                strokeWidth="2"
                className="transition-all duration-300 hover:opacity-80 cursor-pointer"
              >
                <title>{item.asset}: {percentage.toFixed(1)}% - {item.value.toLocaleString('fa-IR')} تومان</title>
              </path>
            );
          })}
          
          {/* مرکز دایره */}
          <circle cx="50" cy="50" r="20" fill={isDark ? "#374151" : "#f3f4f6"} />
        </svg>
        
        {/* اطلاعات پورتفو */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            پورتفو
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {(totalValue / 1000000).toFixed(1)}M
          </div>
          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            تومان
          </div>
        </div>
        
        {/* راهنمای رنگ‌ها */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="flex flex-col gap-2">
            {portfolioData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {item.asset}
                  </span>
                </div>
                <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {item.percentage.toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // کامپوننت نمودار خطی برای موجودی کیف پول
  const WalletBalanceChart = () => {
    if (!walletHistory) return null;

    const getLinePath = () => {
      const balances = walletHistory.map(item => item.balance);
      const maxBalance = Math.max(...balances);
      const minBalance = Math.min(...balances);
      const range = maxBalance - minBalance || 1;
      
      const points = balances.map((balance, index) => {
        const x = (index / (balances.length - 1)) * 100;
        const y = 100 - (((balance - minBalance) / range) * 80);
        return `${x},${y}`;
      }).join(' ');
      
      return (
        <polyline
          fill="none"
          stroke="#10B981"
          strokeWidth="2"
          points={points}
          className="transition-all duration-500"
        />
      );
    };

    const currentBalance = walletHistory[walletHistory.length - 1]?.balance || 0;
    const firstBalance = walletHistory[0]?.balance || 0;
    const change = ((currentBalance - firstBalance) / firstBalance) * 100;
    const isPositive = change >= 0;

    return (
      <div className="h-64 relative">
        {/* اطلاعات موجودی فعلی */}
        <div className="absolute top-2 right-2 z-10 text-right">
          <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {currentBalance.toLocaleString('fa-IR')}
          </div>
          <div className={`text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? '📈' : '📉'} {Math.abs(change).toFixed(1)}%
          </div>
          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            تومان
          </div>
        </div>

        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          {/* خطوط راهنما */}
          <line x1="0" y1="20" x2="100" y2="20" stroke={isDark ? "#374151" : "#d1d5db"} strokeWidth="0.5" />
          <line x1="0" y1="40" x2="100" y2="40" stroke={isDark ? "#374151" : "#d1d5db"} strokeWidth="0.5" />
          <line x1="0" y1="60" x2="100" y2="60" stroke={isDark ? "#374151" : "#d1d5db"} strokeWidth="0.5" />
          <line x1="0" y1="80" x2="100" y2="80" stroke={isDark ? "#374151" : "#d1d5db"} strokeWidth="0.5" />
          
          {/* نمودار خطی */}
          {getLinePath()}
          
          {/* نقاط روی نمودار */}
          {walletHistory.map((_, index) => {
            const balances = walletHistory.map(item => item.balance);
            const maxBalance = Math.max(...balances);
            const minBalance = Math.min(...balances);
            const range = maxBalance - minBalance || 1;
            const x = (index / (balances.length - 1)) * 100;
            const y = 100 - (((balances[index] - minBalance) / range) * 80);
            
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="1.5"
                fill="#10B981"
                className="transition-all duration-300 hover:r-2"
              />
            );
          })}
        </svg>
        
        {/* تاریخ‌ها در پایین */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
          {walletHistory.map((item, index) => (
            <div key={index} className={`text-xs transform -translate-x-1/2 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {item.date}
            </div>
          ))}
        </div>

        {/* راهنمای نوع تراکنش */}
        <div className="absolute bottom-8 left-2">
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>واریز</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>برداشت</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>معامله</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // برای جلوگیری از hydration mismatch
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">در حال بارگذاری...</div>
      </div>
    );
  }

  const totalPortfolioValue = portfolioData?.reduce((sum, item) => sum + item.value, 0) || 0;
  const goldValue = portfolioData?.find(item => item.asset === 'طلای جهانی')?.value || 0;
  const silverValue = portfolioData?.find(item => item.asset === 'نقره')?.value || 0;
  const oilValue = portfolioData?.find(item => item.asset === 'نفت WTI')?.value || 0;

  // حالت موبایل
  if (isMobile) {
    return (
      <main className={`min-h-screen font-vazirmatn transition-colors duration-300 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white' 
          : 'bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 text-gray-900'
      }`}>
        {/* هدر موبایل */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`backdrop-blur-lg border-b-2 p-3 transition-colors duration-300 ${
            isDark 
              ? 'bg-gray-800/50 border-yellow-500/40' 
              : 'bg-amber-100/80 border-amber-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            {/* دکمه هامبورگر منو */}
            <button
              onClick={() => setSidebarOpen(true)}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isDark 
                  ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                  : 'bg-amber-200 hover:bg-amber-300 text-amber-700'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* لوگو */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 relative">
                <Image
                  src="/logo/Parsagold-main-logo.png"
                  alt="پارسا گلد"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="text-right">
                <h1 className={`text-lg font-bold ${
                  isDark ? 'text-yellow-400' : 'text-amber-600'
                }`}>
                  پارسا گلد
                </h1>
              </div>
            </div>

            {/* کنترل‌ها */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isDark 
                    ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                    : 'bg-amber-200 hover:bg-amber-300 text-amber-700'
                }`}
              >
                {isDark ? '☀️' : '🌙'}
              </button>
            </div>
          </div>

          {/* اطلاعات کاربر */}
          <div className="mt-3 text-center">
            <p className={`font-semibold ${isDark ? 'text-yellow-400' : 'text-amber-600'}`}>
              خوش آمدید، {userData?.firstName || 'کاربر'}
            </p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              سطح: {userData?.level || 'طلایی'}
            </p>
          </div>
        </motion.header>

        {/* منوی موبایل */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50">
            <div 
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => setSidebarOpen(false)}
            ></div>
            <div className={`absolute right-0 top-0 h-full w-64 transform transition-transform ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}>
              <DashboardSidebar isDark={isDark} onClose={() => setSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* محتوای اصلی موبایل */}
        <div className="p-4 space-y-6">
          {/* کارت موجودی کلی */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl p-4 border-2 transition-colors duration-300 ${
              isDark 
                ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-yellow-500/40' 
                : 'bg-gradient-to-br from-white to-amber-50 border-amber-500/50'
            }`}
          >
            <h3 className={`text-lg font-bold mb-4 text-center ${
              isDark ? 'text-yellow-400' : 'text-amber-600'
            }`}>
              موجودی‌های شما
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>موجودی کل:</span>
                <span className={`font-bold ${isDark ? 'text-yellow-400' : 'text-amber-600'}`}>
                  {totalPortfolioValue.toLocaleString('fa-IR')} تومان
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>موجودی طلا:</span>
                <span className={isDark ? 'text-yellow-400' : 'text-amber-600'}>
                  {goldValue.toLocaleString('fa-IR')} تومان
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>موجودی نقره:</span>
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  {silverValue.toLocaleString('fa-IR')} تومان
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>موجودی نفت:</span>
                <span className={isDark ? 'text-orange-400' : 'text-orange-600'}>
                  {oilValue.toLocaleString('fa-IR')} تومان
                </span>
              </div>
            </div>
          </motion.div>

          {/* نمودار دایره‌ای پورتفو */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`rounded-xl p-4 border-2 transition-colors duration-300 ${
              isDark 
                ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-purple-500/40' 
                : 'bg-gradient-to-br from-white to-amber-50 border-purple-500/50'
            }`}
          >
            <h3 className={`text-lg font-bold mb-4 text-center ${
              isDark ? 'text-purple-400' : 'text-purple-600'
            }`}>
              توزیع پورتفو
            </h3>
            <PortfolioPieChart />
          </motion.div>

          {/* نمودار موجودی کیف پول */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`rounded-xl p-4 border-2 transition-colors duration-300 ${
              isDark 
                ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-green-500/40' 
                : 'bg-gradient-to-br from-white to-amber-50 border-green-500/50'
            }`}
          >
            <h3 className={`text-lg font-bold mb-4 text-center ${
              isDark ? 'text-green-400' : 'text-green-600'
            }`}>
              تاریخچه موجودی
            </h3>
            <WalletBalanceChart />
          </motion.div>
        </div>
      </main>
    );
  }

  // حالت دسکتاپ
  return (
    <main className={`min-h-screen font-vazirmatn transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white' 
        : 'bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 text-gray-900'
    }`}>
      {/* هدر دسکتاپ */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`backdrop-blur-lg border-b-2 p-4 transition-colors duration-300 ${
          isDark 
            ? 'bg-gray-800/50 border-yellow-500/40' 
            : 'bg-amber-100/80 border-amber-500/50'
        }`}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* لوگو و عنوان */}
          <div className="flex items-center gap-3">
            <div className="w-30 h-30 relative">
              <Image
                src="/logo/Parsagold-main-logo.png"
                alt="پارسا گلد"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="text-right">
              <h1 className={`text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${
                isDark 
                  ? 'from-yellow-400 to-amber-500' 
                  : 'from-amber-600 to-orange-600'
              }`}>
                پارسا گلد
              </h1>
              <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                پلتفرم معاملات طلا، نقره و نفت
              </p>
            </div>
          </div>
          
          {/* اطلاعات کاربر و کنترل‌ها */}
          <div className="flex items-center gap-3">
            {/* اطلاعات کاربر */}
            <div className="text-right">
              <p className={`font-semibold ${isDark ? 'text-yellow-400' : 'text-amber-600'}`}>
                خوش آمدید، {userData?.firstName || 'کاربر'}
              </p>
              <p className={`text-l ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                 سطح کاربری: {userData?.level || 'طلایی'}
              </p>
            </div>
            
            {/* دکمه تغییر تم */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all duration-200 border ${
                isDark 
                  ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400 hover:text-yellow-300 border-yellow-500/40' 
                  : 'bg-amber-200 hover:bg-amber-300 text-amber-700 hover:text-amber-800 border-amber-500/40'
              }`}
              title={isDark ? 'تغییر به تم روشن' : 'تغییر به تم تاریک'}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            
            {/* دکمه خروج */}
            <button
              onClick={handleLogout}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                isDark 
                  ? 'bg-red-500/20 hover:bg-red-500/30 border border-red-500/30' 
                  : 'bg-red-500/20 hover:bg-red-500/30 border border-red-500/30'
              }`}
              title="خروج از سیستم"
            >
              <div className="w-5 h-5 relative">
                <Image
                  src="/icons/exit.png"
                  alt="خروج"
                  fill
                  className="object-contain"
                />
              </div>
            </button>
          </div>
        </div>
      </motion.header>

      {/* محتوای اصلی دسکتاپ */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex gap-4">
          {/* منوی سمت چپ */}
          <div className="w-72 flex-shrink-0">
            <DashboardSidebar isDark={isDark} />
          </div>

          {/* بخش اصلی محتوا */}
          <div className="flex-1 min-w-0">
            {/* نقشه بازارهای جهانی - اضافه شده */}
            <WorldMarketMap isDark={isDark} />

            {/* کارت‌های خلاصه وضعیت */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6"
            >
              {/* کارت موجودی کل */}
              <div className={`rounded-xl p-4 border-2 shadow-lg hover:shadow-xl transition-all duration-300 ${
                isDark 
                  ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-yellow-500/40 hover:shadow-yellow-500/20' 
                  : 'bg-gradient-to-br from-white to-amber-50 border-amber-500/50 hover:shadow-amber-500/20'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    موجودی کل
                  </h3>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isDark ? 'bg-yellow-500/20' : 'bg-amber-500/20'
                  }`}>
                    <span className={isDark ? 'text-yellow-400' : 'text-amber-600'}>💰</span>
                  </div>
                </div>
                <p className={`text-xl font-bold ${isDark ? 'text-yellow-400' : 'text-amber-600'}`}>
                  {totalPortfolioValue.toLocaleString('fa-IR')}
                </p>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  تومان
                </p>
                <div className="flex justify-between items-center mt-3 text-xs">
                  <span className="text-green-400">+۱۲.۵٪</span>
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>سود کل</span>
                </div>
              </div>

              {/* کارت موجودی طلا */}
              <div className={`rounded-xl p-4 border-2 shadow-lg hover:shadow-xl transition-all duration-300 ${
                isDark 
                  ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-yellow-500/40 hover:shadow-yellow-500/20' 
                  : 'bg-gradient-to-br from-white to-amber-50 border-amber-500/50 hover:shadow-amber-500/20'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    موجودی طلا
                  </h3>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isDark ? 'bg-yellow-500/20' : 'bg-amber-500/20'
                  }`}>
                    <span className={isDark ? 'text-yellow-400' : 'text-amber-600'}>🥇</span>
                  </div>
                </div>
                <p className={`text-xl font-bold ${isDark ? 'text-yellow-400' : 'text-amber-600'}`}>
                  {goldValue.toLocaleString('fa-IR')}
                </p>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  تومان
                </p>
                <div className="flex justify-between items-center mt-3 text-xs">
                  <span className="text-green-400">۲.۵ گرم</span>
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>مقدار</span>
                </div>
              </div>

              {/* کارت موجودی نقره */}
              <div className={`rounded-xl p-4 border-2 shadow-lg hover:shadow-xl transition-all duration-300 ${
                isDark 
                  ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-400/40 hover:shadow-gray-500/20' 
                  : 'bg-gradient-to-br from-white to-amber-50 border-gray-400/50 hover:shadow-gray-500/20'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    موجودی نقره
                  </h3>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isDark ? 'bg-gray-500/20' : 'bg-gray-500/20'
                  }`}>
                    <span className="text-gray-400">🥈</span>
                  </div>
                </div>
                <p className="text-xl font-bold text-gray-400">
                  {silverValue.toLocaleString('fa-IR')}
                </p>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  تومان
                </p>
                <div className="flex justify-between items-center mt-3 text-xs">
                  <span className="text-blue-400">۱۰۰ اونس</span>
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>مقدار</span>
                </div>
              </div>

              {/* کارت موجودی نفت */}
              <div className={`rounded-xl p-4 border-2 shadow-lg hover:shadow-xl transition-all duration-300 ${
                isDark 
                  ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-orange-500/40 hover:shadow-orange-500/20' 
                  : 'bg-gradient-to-br from-white to-amber-50 border-orange-500/50 hover:shadow-orange-500/20'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    موجودی نفت
                  </h3>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isDark ? 'bg-orange-500/20' : 'bg-orange-500/20'
                  }`}>
                    <span className="text-orange-400">🛢️</span>
                  </div>
                </div>
                <p className="text-xl font-bold text-orange-400">
                  {oilValue.toLocaleString('fa-IR')}
                </p>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  تومان
                </p>
                <div className="flex justify-between items-center mt-3 text-xs">
                  <span className="text-green-400">۵۰ بشکه</span>
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>مقدار</span>
                </div>
              </div>
            </motion.div>

            {/* بخش نمودارها */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* نمودار دایره‌ای پورتفو */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className={`rounded-xl p-6 border-2 shadow-lg hover:shadow-xl transition-all duration-300 ${
                  isDark 
                    ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-purple-500/40 hover:shadow-purple-500/20' 
                    : 'bg-gradient-to-br from-white to-amber-50 border-purple-500/50 hover:shadow-purple-500/20'
                }`}
              >
                <h3 className={`text-lg font-bold mb-4 text-center ${
                  isDark ? 'text-purple-400' : 'text-purple-600'
                }`}>
                  توزیع پورتفو
                </h3>
                <PortfolioPieChart />
              </motion.div>

              {/* نمودار موجودی کیف پول */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className={`rounded-xl p-6 border-2 shadow-lg hover:shadow-xl transition-all duration-300 ${
                  isDark 
                    ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-green-500/40 hover:shadow-green-500/20' 
                    : 'bg-gradient-to-br from-white to-amber-50 border-green-500/50 hover:shadow-green-500/20'
                }`}
              >
                <h3 className={`text-lg font-bold mb-4 text-center ${
                  isDark ? 'text-green-400' : 'text-green-600'
                }`}>
                  تاریخچه موجودی
                </h3>
                <WalletBalanceChart />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}