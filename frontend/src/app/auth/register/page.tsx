// فایل کامل اصلاح شده: D:/parsagold-project/frontend/src/app/auth/register/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import Image from 'next/image';
import { registerUser } from '@/lib/api/auth';
import { useUserAuth } from '@/contexts/UserAuthContext';

// تعریف schema جدید برای ثبت‌نام سریع
import { z } from 'zod';

const quickRegisterSchema = z.object({
  phone: z.string()
    .min(11, 'شماره موبایل باید ۱۱ رقم باشد')
    .max(11, 'شماره موبایل باید ۱۱ رقم باشد')
    .regex(/^09[0-9]{9}$/, 'شماره موبایل معتبر نیست (با 09 شروع شود)'),
  password: z.string()
    .min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'رمز عبور باید شامل حروف بزرگ، کوچک و اعداد باشد'),
  confirm_password: z.string(),
  accept_terms: z.boolean().refine(val => val === true, {
    message: 'لطفاً قوانین و مقررات را بپذیرید'
  })
}).refine((data) => data.password === data.confirm_password, {
  message: "رمز عبور و تکرار آن مطابقت ندارند",
  path: ["confirm_password"],
});

type QuickRegisterFormData = z.infer<typeof quickRegisterSchema>;

// تابع محاسبه قدرت رمز عبور
const calculatePasswordStrength = (password: string) => {
  let score = 0;
  let feedback = [];

  // طول
  if (password.length >= 12) score += 2;
  else if (password.length >= 8) score += 1;
  else feedback.push('کوتاه');

  // تنوع کاراکتر
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const criteriaMet = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
  
  if (criteriaMet === 4) score += 2;
  else if (criteriaMet >= 3) score += 1;
  else feedback.push('تنوع کم');

  // تعیین سطح
  let strength = 'ضعیف';
  let color = 'bg-red-500';

  if (score >= 4) {
    strength = 'خیلی قوی';
    color = 'bg-green-500';
  } else if (score >= 3) {
    strength = 'قوی';
    color = 'bg-green-400';
  } else if (score >= 2) {
    strength = 'متوسط';
    color = 'bg-yellow-500';
  }

  return { strength, color, score, feedback };
};

export default function QuickRegisterPage() {
  const router = useRouter();
  const { setUserFromRegistration } = useUserAuth(); // تغییر به تابع جدید
  const [isDarkMode, setIsDarkMode] = React.useState(true);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<QuickRegisterFormData>({
    resolver: zodResolver(quickRegisterSchema),
  });

  const passwordValue = watch('password');
  const passwordStrength = passwordValue ? calculatePasswordStrength(passwordValue) : null;

  // مدیریت تغییر تم
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      console.log('✅ ثبت‌نام موفق:', data);
      
      // ذخیره اطلاعات کاربر
      const accessToken = data.access_token;
      const userPhone = data.user?.phone || watch('phone');
      const userId = data.user?.id || 'unknown';

      console.log('💾 اطلاعات دریافت شد:', {
        userPhone,
        userId,
        accessToken
      });

      // استفاده از تابع جدید setUserFromRegistration
      const success = setUserFromRegistration(accessToken, userPhone, userId.toString());
      
      if (success) {
        console.log('✅ UserAuthContext با موفقیت به روز شد');
        
        // نمایش پیام موفقیت
        alert('🎉 ثبت‌نام با موفقیت انجام شد! در حال انتقال به داشبورد...');
        
        // هدایت به صفحه داشبورد
        setTimeout(() => {
          router.push('/user/dashboard');
          router.refresh();
        }, 1000);
      } else {
        console.error('❌ خطا در به روزرسانی UserAuthContext');
        // با این حال اطلاعات در localStorage ذخیره شده، پس هدایت کن
        alert('🎉 ثبت‌نام با موفقیت انجام شد! در حال انتقال به داشبورد...');
        setTimeout(() => {
          router.push('/user/dashboard');
          router.refresh();
        }, 1000);
      }
    },
    onError: (error: any) => {
      console.error('❌ خطا در ثبت‌نام:', error);
      alert(error.message || 'خطا در ثبت‌نام. لطفاً دوباره تلاش کنید.');
    },
  });

  const onSubmit = async (data: QuickRegisterFormData) => {
    try {
      console.log('📝 داده‌های فرم:', data);
      await registerMutation.mutateAsync(data);
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
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
            </svg>
          ) : (
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
              sizes="(max-width: 768px) 96px, 128px"
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
            ثبت‌نام سریع
          </motion.p>
        </div>

        {/* فرم ثبت‌نام */}
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
            {/* شماره موبایل */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                شماره موبایل
              </label>
              <input
                type="tel"
                {...register('phone')}
                className={`w-full px-3 py-2 text-base rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 transition-all border ${
                  isDarkMode 
                    ? 'bg-gray-700/50 border-gray-600 text-white focus:ring-yellow-500 focus:border-transparent' 
                    : 'bg-white border-amber-200 text-gray-900 focus:ring-amber-500 focus:border-amber-300'
                }`}
                placeholder="09123456789"
                maxLength={11}
              />
              {errors.phone && (
                <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>
              )}
            </div>

            {/* رمز عبور */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                رمز عبور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className={`w-full px-3 py-2 text-base rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 transition-all border pr-10 ${
                    isDarkMode 
                      ? 'bg-gray-700/50 border-gray-600 text-white focus:ring-yellow-500 focus:border-transparent' 
                      : 'bg-white border-amber-200 text-gray-900 focus:ring-amber-500 focus:border-amber-300'
                  }`}
                  placeholder="رمز عبور قوی انتخاب کنید"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                    isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
              )}
              
              {/* نمایش قدرت رمز عبور */}
              {passwordValue && passwordStrength && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      قدرت رمز عبور:
                    </span>
                    <span className={`text-xs font-medium ${
                      passwordStrength.strength === 'خیلی قوی' ? 'text-green-400' :
                      passwordStrength.strength === 'قوی' ? 'text-green-400' :
                      passwordStrength.strength === 'متوسط' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {passwordStrength.strength}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded ${
                          level <= passwordStrength.score
                            ? passwordStrength.color
                            : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* تکرار رمز عبور */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                تکرار رمز عبور
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirm_password')}
                  className={`w-full px-3 py-2 text-base rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 transition-all border pr-10 ${
                    isDarkMode 
                      ? 'bg-gray-700/50 border-gray-600 text-white focus:ring-yellow-500 focus:border-transparent' 
                      : 'bg-white border-amber-200 text-gray-900 focus:ring-amber-500 focus:border-amber-300'
                  }`}
                  placeholder="رمز عبور را تکرار کنید"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                    isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.confirm_password && (
                <p className="text-red-400 text-xs mt-1">{errors.confirm_password.message}</p>
              )}
            </div>

            {/* قوانین و مقررات */}
            <div className="flex items-start space-x-3 space-x-reverse">
              <input
                type="checkbox"
                {...register('accept_terms')}
                className={`mt-1 rounded focus:ring-2 focus:ring-offset-2 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 focus:ring-yellow-500' 
                    : 'bg-white border-amber-200 focus:ring-amber-500'
                }`}
              />
              <label className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <span>قوانین و مقررات </span>
                <Link 
                  href="/terms" 
                  className={`underline hover:no-underline ${
                    isDarkMode ? 'text-yellow-400' : 'text-amber-600'
                  }`}
                >
                  پارسا گلد
                </Link>
                <span> را می‌پذیرم</span>
              </label>
            </div>
            {errors.accept_terms && (
              <p className="text-red-400 text-xs mt-1">{errors.accept_terms.message}</p>
            )}

            {/* دکمه ثبت‌نام */}
            <button
              type="submit"
              disabled={isSubmitting || registerMutation.isPending}
              className={`w-full font-semibold py-3 rounded-lg transition-colors shadow-lg text-base disabled:opacity-50 disabled:cursor-not-allowed ${
                isDarkMode 
                  ? 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-yellow-500/25' 
                  : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/25'
              }`}
            >
              {isSubmitting || registerMutation.isPending ? (
                <span className="flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className={`w-5 h-5 border-2 rounded-full mr-2 ${
                      isDarkMode 
                        ? 'border-black border-t-transparent' 
                        : 'border-white border-t-transparent'
                    }`}
                  />
                  در حال ثبت‌نام...
                </span>
              ) : (
                'ثبت‌نام و ورود به پنل'
              )}
            </button>
          </form>

          {/* لینک ورود */}
          <div className="mt-6 text-center">
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              قبلاً حساب دارید؟{' '}
              <Link 
                href="/auth/login" 
                className={`font-semibold hover:underline ${
                  isDarkMode ? 'text-yellow-400' : 'text-amber-600'
                }`}
              >
                وارد شوید
              </Link>
            </p>
          </div>
        </motion.div>

        {/* اطلاعات راهنما */}
        <div className="mt-4 text-center">
          <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
            💡 پس از ثبت‌نام، می‌توانید اطلاعات پروفایل خود را در داشبورد تکمیل کنید
          </p>
        </div>
      </motion.div>
    </div>
  );
}