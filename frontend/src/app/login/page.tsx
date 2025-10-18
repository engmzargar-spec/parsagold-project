// frontend/src/app/login/page.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';

// Schema validation با Zod
const loginSchema = z.object({
  email: z.string().email('ایمیل معتبر وارد کنید'),
  password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
  captcha: z.string().length(6, 'کد امنیتی باید ۶ کاراکتر باشد'),
});

type LoginFormData = z.infer<typeof loginSchema>;

// تابع تولید کپچا
function generateCaptcha() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// آیکون‌های SVG ساده
const HomeIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const ArrowPathIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const { login, loading } = useAuth();
  
  const [captchaCode, setCaptchaCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    setCaptchaCode(generateCaptcha());
  }, []);

  const onSubmit = async (data: LoginFormData) => {
    setError('');
    setSuccess('');

    // بررسی کپچا
    if (data.captcha.toUpperCase() !== captchaCode.toUpperCase()) {
      setError('کد امنیتی نادرست است');
      setCaptchaCode(generateCaptcha());
      setValue('captcha', '');
      return;
    }

    try {
      await login({
        email: data.email,
        password: data.password,
      });
      
      setSuccess('ورود با موفقیت انجام شد');
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
      
    } catch (error: any) {
      setError(error.response?.data?.detail || 'خطا در ورود به سیستم');
      setCaptchaCode(generateCaptcha());
      setValue('captcha', '');
    }
  };

  const refreshCaptcha = () => {
    setCaptchaCode(generateCaptcha());
    setValue('captcha', '');
  };

  return (
    <main dir="rtl" className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-br from-gray-900 to-black text-white">
      <Link href="/" className="absolute top-6 right-6 text-yellow-400 hover:text-yellow-300 flex items-center gap-2 z-50">
        <HomeIcon />
        <span className="hidden md:inline text-sm">خانه</span>
      </Link>

      <div className="flex flex-col md:flex-row-reverse items-stretch justify-center max-w-5xl w-full">
        <div className="w-full md:w-1/2 bg-gray-900 bg-opacity-70 rounded-2xl shadow-xl p-6 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-yellow-400 mb-6 text-center">ورود به حساب کاربری</h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* ایمیل */}
            <div>
              <input
                type="email"
                placeholder="آدرس ایمیل"
                {...register('email')}
                className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white placeholder-gray-400 text-right focus:outline-none focus:ring-2 focus:ring-yellow-500 border border-gray-700"
              />
              {errors.email && (
                <p className="text-red-400 text-sm text-right mt-2">{errors.email.message}</p>
              )}
            </div>

            {/* رمز عبور */}
            <div>
              <input
                type="password"
                placeholder="رمز عبور"
                {...register('password')}
                className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white placeholder-gray-400 text-right focus:outline-none focus:ring-2 focus:ring-yellow-500 border border-gray-700"
              />
              {errors.password && (
                <p className="text-red-400 text-sm text-right mt-2">{errors.password.message}</p>
              )}
              <div className="text-right text-xs text-gray-400 mt-2">
                <Link href="/forgot-password" className="hover:text-yellow-400 transition-colors">
                  فراموشی رمز عبور؟
                </Link>
              </div>
            </div>

            {/* کپچا */}
            <div className="space-y-3">
              <input
                type="text"
                placeholder="کد امنیتی"
                {...register('captcha')}
                className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white placeholder-gray-400 text-right focus:outline-none focus:ring-2 focus:ring-yellow-500 border border-gray-700"
              />
              {errors.captcha && (
                <p className="text-red-400 text-sm text-right mt-2">{errors.captcha.message}</p>
              )}
              
              <div className="flex items-center gap-3">
                <span className="flex-1 text-lg font-mono bg-gray-800 px-4 py-3 rounded-xl tracking-widest text-yellow-400 text-center border border-gray-700">
                  {captchaCode}
                </span>
                <button
                  type="button"
                  onClick={refreshCaptcha}
                  className="p-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition border border-gray-700"
                  title="تغییر کد امنیتی"
                >
                  <ArrowPathIcon />
                </button>
              </div>
            </div>

            {/* دکمه ورود */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-yellow-500 text-black font-semibold rounded-xl shadow-md hover:bg-yellow-400 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'در حال ورود...' : 'ورود'}
            </button>

            {/* لینک ثبت نام */}
            <div className="text-center text-sm text-gray-400">
              <span>حساب کاربری ندارید؟ </span>
              <Link href="/register" className="text-yellow-400 hover:text-yellow-300 transition-colors">
                ثبت نام کنید
              </Link>
            </div>

            {/* پیغام‌ها */}
            {error && <p className="text-red-400 text-sm text-right mt-2">{error}</p>}
            {success && <p className="text-green-400 text-sm text-right mt-2">{success}</p>}
          </form>
        </div>

        {/* بخش لوگو - با handshake.png */}
        <div className="w-full md:w-1/2 bg-gray-800 rounded-2xl shadow-xl flex items-center justify-center p-8 mt-6 md:mt-0 md:ml-6">
          <Image 
            src="/icons/handshake.png" 
            alt="ParsaGold Logo" 
            width={240} 
            height={240} 
            className="max-w-full h-auto drop-shadow-lg" 
            priority
          />
        </div>
      </div>
    </main>
  );
}