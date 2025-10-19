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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* لوگو */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-yellow-500/25"
          >
            <span className="text-2xl font-bold text-black">PG</span>
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">پارسا گلد</h1>
          <p className="text-gray-400">ورود به حساب کاربری</p>
        </div>

        {/* فرم ورود */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-gray-700/50"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                ایمیل
              </label>
              <input
                type="email"
                {...register('email')}
                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                placeholder="example@email.com"
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                رمز عبور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all pr-10"
                  placeholder="رمز عبور"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
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
              className="w-full bg-yellow-500 text-black font-semibold py-3 rounded-lg hover:bg-yellow-400 transition-colors shadow-lg shadow-yellow-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting || loginMutation.isPending ? (
                <span className="flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-black border-t-transparent rounded-full mr-2"
                  />
                  در حال ورود...
                </span>
              ) : (
                'ورود به حساب'
              )}
            </button>
          </form>

          {/* لینک‌های اضافی */}
          <div className="mt-6 space-y-3 text-center">
            <p className="text-gray-400">
              حساب ندارید؟{' '}
              <Link
                href="/register"
                className="text-yellow-400 hover:text-yellow-300 font-semibold underline transition-colors"
              >
                ثبت‌نام کنید
              </Link>
            </p>
            
            <div>
              <Link
                href="/forgot-password"
                className="text-gray-400 hover:text-gray-300 text-sm underline transition-colors"
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
            className="text-xs text-gray-500 underline"
          >
            نمایش وضعیت ذخیره‌سازی (برای دیباگ)
          </button>
        </div>
      </motion.div>
    </div>
  );
}