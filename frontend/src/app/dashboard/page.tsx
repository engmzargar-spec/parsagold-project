// File: frontend/src/app/dashboard/page.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // بررسی وجود کاربر
    const checkAuth = () => {
      const email = sessionStorage.getItem('userEmail');
      const userId = sessionStorage.getItem('userId');
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      
      console.log('🔍 بررسی احراز هویت:', { email, userId, token });
      
      if (!email || !userId || !token) {
        console.log('❌ کاربر لاگین نیست، هدایت به صفحه ورود...');
        router.push('/login');
        return false;
      }
      
      setUserEmail(email);
      setIsLoading(false);
      return true;
    };

    // تأخیر برای اطمینان از لود شدن کامل
    setTimeout(() => {
      checkAuth();
    }, 100);
  }, [router]);

  const handleLogout = () => {
    // پاک کردن تمام اطلاعات کاربر
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('access_token');
    localStorage.removeItem('access_token');
    
    console.log('🚪 کاربر از سیستم خارج شد');
    
    // هدایت به صفحه اصلی
    router.push('/');
  };

  // اگر در حال بررسی هستیم، loading نمایش بده
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">در حال بررسی احراز هویت...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800">
      {/* هدر */}
      <header className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700/50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-black">PG</span>
            </div>
            <h1 className="text-xl font-bold text-white">پارسا گلد</h1>
          </div>
          
          <div className="flex items-center space-x-4 space-x-reverse">
            <span className="text-gray-300">خوش آمدید، {userEmail}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-400 transition-colors"
            >
              خروج
            </button>
          </div>
        </div>
      </header>

      {/* محتوای داشبورد */}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">داشبورد کاربری</h2>
          <p className="text-gray-400">به سیستم معاملات طلای پارسا گلد خوش آمدید</p>
        </div>

        {/* کارت‌های اطلاعات */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-2">موجودی حساب</h3>
            <p className="text-2xl font-bold text-yellow-500">۱,۰۰۰,۰۰۰ تومان</p>
            <p className="text-gray-400 text-sm">اعتبار اولیه</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-2">معاملات فعال</h3>
            <p className="text-2xl font-bold text-green-500">۰</p>
            <p className="text-gray-400 text-sm">در حال حاضر</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-2">سود و زیان</h3>
            <p className="text-2xl font-bold text-blue-500">۰ تومان</p>
            <p className="text-gray-400 text-sm">کل معاملات</p>
          </div>
        </div>

        {/* پیام خوش‌آمدگویی */}
        <div className="bg-gray-800/30 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 text-center">
          <h3 className="text-xl font-semibold text-white mb-4">
            🎉 ثبت‌نام و ورود شما با موفقیت انجام شد!
          </h3>
          <p className="text-gray-300 mb-4">
            اکنون می‌توانید از امکانات سیستم معاملات طلای پارسا گلد استفاده کنید.
          </p>
          <div className="flex justify-center space-x-4 space-x-reverse">
            <button 
              onClick={() => alert('صفحه قیمت‌ها به زودی اضافه می‌شود')}
              className="bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
            >
              مشاهده قیمت‌ها
            </button>
            <button 
              onClick={() => alert('سیستم معاملات به زودی فعال می‌شود')}
              className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-400 transition-colors"
            >
              شروع معامله
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}