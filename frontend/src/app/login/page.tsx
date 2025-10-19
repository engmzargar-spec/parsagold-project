// File: frontend/src/app/login/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { loginUser } from '@/lib/api/auth';
import Image from 'next/image';

// تعریف ساده schema
import { z } from 'zod';

const loginSchema = z.object({
  email: z
    .string()
    .email('ایمیل معتبر نیست')
    .min(5, 'ایمیل باید حداقل ۵ کاراکتر باشد'),
  password: z.string().min(1, 'رمز عبور الزامی است'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [isDarkMode, setIsDarkMode] = React.useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // مدیریت تغییر تم
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      console.log('✅ پاسخ سرور در onSuccess:', data);
      
      // بررسی ساختار response بک‌اند
      let userEmail = '';
      let userId = '';
      let accessToken = '';

      // حالت ۱: اگر response استاندارد FastAPI هست
      if (data.access_token) {
        accessToken = data.access_token;
        userEmail = data.email || data.username || credentials.email;
        userId = data.user_id || data.id || 'unknown';
      }
      // حالت ۲: اگر response ساده‌تر هست
      else if (data.token) {
        accessToken = data.token;
        userEmail = data.email || credentials.email;
        userId = data.userId || data.id || 'unknown';
      }
      // حالت ۳: اگر response کاملاً متفاوت هست
      else {
        console.warn('⚠️ ساختار response ناشناخته:', data);
        // سعی می‌کنیم از ایمیل فرم استفاده کنیم
        userEmail = credentials.email;
        userId = 'generated_' + Date.now();
        accessToken = 'dummy_token_' + Date.now();
      }

      // ذخیره اطلاعات
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('userEmail', userEmail);
      localStorage.setItem('userId', userId);

      sessionStorage.setItem('access_token', accessToken);
      sessionStorage.setItem('userEmail', userEmail);
      sessionStorage.setItem('userId', userId);

      console.log('💾 اطلاعات ذخیره شد:', {
        userEmail,
        userId,
        accessToken: accessToken ? 'موجود' : 'مفقود'
      });

      // نمایش پیام موفقیت
      alert('ورود با موفقیت انجام شد! در حال انتقال به داشبورد...');
      
      // هدایت به صفحه داشبورد با تأخیر
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
      
    },
    onError: (error: any) => {
      console.error('❌ خطا در ورود:', error);
      alert(error.message || 'خطا در ورود. لطفاً دوباره تلاش کنید.');
    },
  });

  // ذخیره credentials برای استفاده در onSuccess
  const [credentials, setCredentials] = React.useState<LoginFormData>({ email: '', password: '' });

  const onSubmit = async (data: LoginFormData) => {
    try {
      console.log('📝 داده‌های فرم:', data);
      setCredentials(data); // ذخیره credentials
      console.log('🚀 در حال ارسال به سرور...');
      
      await loginMutation.mutateAsync(data);
      
    } catch (error) {
      console.error('❌ خطا در ارسال فرم:', error);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white' 
        : 'bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 text-gray-900'
    }`}>
      
      {/* دکمه‌های بالای صفحه */}
      <div className="fixed top-4 right-4 z-50 flex gap-2 md:top-6 md:right-6">
        {/* دکمه برگشت به صفحه اصلی */}
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          onClick={() => router.push('/')}
          className={`p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 ${
            isDarkMode 
              ? 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-yellow-500/25' 
              : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/25'
          }`}
          title="بازگشت به صفحه اصلی"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </motion.button>

        {/* دکمه تغییر تم */}
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          onClick={toggleTheme}
          className={`p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 ${
            isDarkMode 
              ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400 shadow-gray-700/25' 
              : 'bg-amber-200 hover:bg-amber-300 text-amber-700 shadow-amber-200/25'
          }`}
          title={isDarkMode ? 'تغییر به تم روشن' : 'تغییر به تم تیره'}
        >
          {isDarkMode ? (
            // خورشید (تم روشن)
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
            </svg>
          ) : (
            // ماه (تم تیره)
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd"/>
            </svg>
          )}
        </motion.button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-auto"
      >
        {/* هدر با لوگو */}
        <div className="text-center mb-6 md:mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-4 relative"
          >
            <Image
              src="/logo/Parsagold-main-logo.png"
              alt="پارسا گلد"
              fill
              className="object-contain"
              priority
            />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`text-2xl md:text-3xl font-bold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            پارسا گلد
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}
          >
            ورود به حساب کاربری
          </motion.p>
        </div>

        {/* فرم ورود */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`backdrop-blur-lg rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl border transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gray-800/50 border-gray-700/50' 
              : 'bg-white/80 border-amber-200/50'
          }`}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 md:space-y-4">
            <div>
              <label className={`block text-xs md:text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                ایمیل
              </label>
              <input
                type="email"
                {...register('email')}
                className={`w-full px-2 md:px-3 py-2 text-sm md:text-base rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 transition-all border ${
                  isDarkMode 
                    ? 'bg-gray-700/50 border-gray-600 text-white focus:ring-yellow-500 focus:border-transparent' 
                    : 'bg-white border-amber-200 text-gray-900 focus:ring-amber-500 focus:border-amber-300'
                }`}
                placeholder="example@email.com"
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className={`block text-xs md:text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                رمز عبور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className={`w-full px-2 md:px-3 py-2 text-sm md:text-base rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 transition-all border pr-10 ${
                    isDarkMode 
                      ? 'bg-gray-700/50 border-gray-600 text-white focus:ring-yellow-500 focus:border-transparent' 
                      : 'bg-white border-amber-200 text-gray-900 focus:ring-amber-500 focus:border-amber-300'
                  }`}
                  placeholder="رمز عبور"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 transition-colors text-sm ${
                    isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || loginMutation.isPending}
              className={`w-full font-semibold py-2 md:py-3 rounded-lg transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base ${
                isDarkMode 
                  ? 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-yellow-500/25' 
                  : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/25'
              }`}
            >
              {isSubmitting || loginMutation.isPending ? (
                <span className="flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className={`w-4 h-4 md:w-5 md:h-5 border-2 rounded-full mr-2 ${
                      isDarkMode 
                        ? 'border-black border-t-transparent' 
                        : 'border-white border-t-transparent'
                    }`}
                  />
                  در حال ورود...
                </span>
              ) : (
                'ورود به حساب'
              )}
            </button>
          </form>

          {/* لینک‌های اضافی */}
          <div className="mt-4 md:mt-6 space-y-2 md:space-y-3 text-center">
            <p className={`text-xs md:text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              حساب ندارید؟{' '}
              <Link
                href="/register"
                className={`font-semibold underline transition-colors ${
                  isDarkMode ? 'text-yellow-400 hover:text-yellow-300' : 'text-amber-600 hover:text-amber-500'
                }`}
              >
                ثبت‌نام کنید
              </Link>
            </p>
            
            <div>
              <Link
                href="/forgot-password"
                className={`text-xs md:text-sm underline transition-colors ${
                  isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                رمز عبور خود را فراموش کرده‌اید؟
              </Link>
            </div>
          </div>
        </motion.div>

        {/* اطلاعات دیباگ */}
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              console.log('🔍 وضعیت فعلی localStorage:', {
                access_token: localStorage.getItem('access_token'),
                userEmail: localStorage.getItem('userEmail'),
                userId: localStorage.getItem('userId')
              });
              console.log('🔍 وضعیت فعلی sessionStorage:', {
                access_token: sessionStorage.getItem('access_token'),
                userEmail: sessionStorage.getItem('userEmail'),
                userId: sessionStorage.getItem('userId')
              });
            }}
            className={`text-xs underline ${
              isDarkMode ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            نمایش وضعیت ذخیره‌سازی (برای دیباگ)
          </button>
        </div>
      </motion.div>
    </div>
  );
}