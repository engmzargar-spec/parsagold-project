// File: frontend/src/app/register/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { registerUser } from '@/lib/api/auth';
import { registerSchema, type RegisterFormData } from '@/lib/validations/registerSchema';
import { countries } from '@/lib/countries';
import Image from 'next/image';

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(1);
  const [isDarkMode, setIsDarkMode] = React.useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    watch,
    setValue,
    trigger,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      countryCode: '+98',
      os: typeof navigator !== 'undefined' ? navigator.platform : '',
    },
    mode: 'onChange',
  });

  // مدیریت تغییر تم
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // دریافت موقعیت جغرافیایی
  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue('latitude', position.coords.latitude);
          setValue('longitude', position.coords.longitude);
        },
        (error) => {
          console.log('خطا در دریافت موقعیت:', error);
        }
      );
    }
  }, [setValue]);

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      console.log('✅ ثبت‌نام موفقیت‌آمیز:', data);
      
      // ذخیره اطلاعات کاربر در localStorage برای ماندگاری
      if (data.id) {
        localStorage.setItem('userId', data.id.toString());
        sessionStorage.setItem('userId', data.id.toString());
      }
      if (data.email) {
        localStorage.setItem('userEmail', data.email);
        sessionStorage.setItem('userEmail', data.email);
      }
      
      console.log('💾 اطلاعات کاربر ذخیره شد:', {
        userId: data.id,
        email: data.email
      });
      
      // نمایش پیام موفقیت
      alert('ثبت‌نام با موفقیت انجام شد! لطفاً وارد شوید.');
      
      // هدایت به صفحه ورود
      router.push('/login');
    },
    onError: (error: any) => {
      console.error('❌ خطا در ثبت‌نام:', error);
      alert(error.message || 'خطا در ثبت‌نام. لطفاً دوباره تلاش کنید.');
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      console.log('📝 داده‌های فرم:', data);
      
      // اول validation رو چک کن
      const isFormValid = await trigger();
      if (!isFormValid) {
        console.log('❌ فرم معتبر نیست');
        alert('لطفاً تمام فیلدها را به درستی پر کنید');
        return;
      }

      console.log('🚀 در حال ارسال به سرور...');
      await registerMutation.mutateAsync(data);
      
    } catch (error) {
      console.error('❌ خطا در ارسال فرم:', error);
    }
  };

  const nextStep = async () => {
    // validation مخصوص هر مرحله
    let fieldsToValidate: (keyof RegisterFormData)[] = [];
    
    if (currentStep === 1) {
      fieldsToValidate = ['firstName', 'lastName', 'email', 'nationalCode'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['phone', 'password', 'confirmPassword'];
    }
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(prev => prev + 1);
    } else {
      alert('لطفاً فیلدهای این مرحله را به درستی پر کنید');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
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
            ایجاد حساب کاربری جدید
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
          {/* نشانگر مراحل */}
          <div className="flex justify-center mb-4 md:mb-6">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-semibold transition-colors ${
                    currentStep >= step
                      ? isDarkMode 
                        ? 'bg-yellow-500 text-black' 
                        : 'bg-amber-600 text-white'
                      : isDarkMode 
                        ? 'bg-gray-600 text-gray-300' 
                        : 'bg-amber-200 text-amber-600'
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-4 md:w-8 h-1 mx-1 md:mx-2 transition-colors ${
                      currentStep > step 
                        ? isDarkMode ? 'bg-yellow-500' : 'bg-amber-600'
                        : isDarkMode ? 'bg-gray-600' : 'bg-amber-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 md:space-y-4">
            {/* Step 1: اطلاعات شخصی */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-3 md:space-y-4"
              >
                <h3 className={`text-base md:text-lg font-semibold mb-2 md:mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  اطلاعات شخصی
                </h3>
                
                <div className="grid grid-cols-2 gap-2 md:gap-4">
                  <div>
                    <label className={`block text-xs md:text-sm font-medium mb-1 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      نام
                    </label>
                    <input
                      type="text"
                      {...register('firstName')}
                      className={`w-full px-2 md:px-3 py-2 text-sm md:text-base rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 transition-all border ${
                        isDarkMode 
                          ? 'bg-gray-700/50 border-gray-600 text-white focus:ring-yellow-500 focus:border-transparent' 
                          : 'bg-white border-amber-200 text-gray-900 focus:ring-amber-500 focus:border-amber-300'
                      }`}
                      placeholder="نام"
                    />
                    {errors.firstName && (
                      <p className="text-red-400 text-xs mt-1">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-xs md:text-sm font-medium mb-1 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      نام خانوادگی
                    </label>
                    <input
                      type="text"
                      {...register('lastName')}
                      className={`w-full px-2 md:px-3 py-2 text-sm md:text-base rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 transition-all border ${
                        isDarkMode 
                          ? 'bg-gray-700/50 border-gray-600 text-white focus:ring-yellow-500 focus:border-transparent' 
                          : 'bg-white border-amber-200 text-gray-900 focus:ring-amber-500 focus:border-amber-300'
                      }`}
                      placeholder="نام خانوادگی"
                    />
                    {errors.lastName && (
                      <p className="text-red-400 text-xs mt-1">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

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
                    شماره ملی
                  </label>
                  <input
                    type="text"
                    {...register('nationalCode')}
                    className={`w-full px-2 md:px-3 py-2 text-sm md:text-base rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 transition-all border ${
                      isDarkMode 
                        ? 'bg-gray-700/50 border-gray-600 text-white focus:ring-yellow-500 focus:border-transparent' 
                        : 'bg-white border-amber-200 text-gray-900 focus:ring-amber-500 focus:border-amber-300'
                    }`}
                    placeholder="۱۲۳۴۵۶۷۸۹۰"
                  />
                  {errors.nationalCode && (
                    <p className="text-red-400 text-xs mt-1">{errors.nationalCode.message}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={nextStep}
                  className={`w-full font-semibold py-2 md:py-3 rounded-lg transition-colors shadow-lg text-sm md:text-base ${
                    isDarkMode 
                      ? 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-yellow-500/25' 
                      : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/25'
                  }`}
                >
                  ادامه
                </button>
              </motion.div>
            )}

            {/* Step 2: اطلاعات تماس و امنیتی */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-3 md:space-y-4"
              >
                <h3 className={`text-base md:text-lg font-semibold mb-2 md:mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  اطلاعات تماس و امنیتی
                </h3>

                <div>
                  <label className={`block text-xs md:text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    شماره تلفن
                  </label>
                  <div className="flex gap-2">
                    <select
                      {...register('countryCode')}
                      className={`w-20 md:w-24 px-1 md:px-2 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 border ${
                        isDarkMode 
                          ? 'bg-gray-700/50 border-gray-600 text-white focus:ring-yellow-500' 
                          : 'bg-white border-amber-200 text-gray-900 focus:ring-amber-500'
                      }`}
                    >
                      {countries.map((country) => (
                        <option key={country.code} value={country.dial_code}>
                          {country.flag} {country.dial_code}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      {...register('phone')}
                      className={`flex-1 px-2 md:px-3 py-2 text-sm md:text-base rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 transition-all border ${
                        isDarkMode 
                          ? 'bg-gray-700/50 border-gray-600 text-white focus:ring-yellow-500 focus:border-transparent' 
                          : 'bg-white border-amber-200 text-gray-900 focus:ring-amber-500 focus:border-amber-300'
                      }`}
                      placeholder="۹۱۲۳۴۵۶۷۸۹"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>
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
                      placeholder="رمز عبور قوی"
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

                <div>
                  <label className={`block text-xs md:text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    تکرار رمز عبور
                  </label>
                  <input
                    type="password"
                    {...register('confirmPassword')}
                    className={`w-full px-2 md:px-3 py-2 text-sm md:text-base rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 transition-all border ${
                      isDarkMode 
                        ? 'bg-gray-700/50 border-gray-600 text-white focus:ring-yellow-500 focus:border-transparent' 
                        : 'bg-white border-amber-200 text-gray-900 focus:ring-amber-500 focus:border-amber-300'
                    }`}
                    placeholder="تکرار رمز عبور"
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={prevStep}
                    className={`flex-1 font-semibold py-2 md:py-3 rounded-lg transition-colors text-sm md:text-base ${
                      isDarkMode 
                        ? 'bg-gray-600 hover:bg-gray-500 text-white' 
                        : 'bg-amber-200 hover:bg-amber-300 text-amber-700'
                    }`}
                  >
                    بازگشت
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className={`flex-1 font-semibold py-2 md:py-3 rounded-lg transition-colors shadow-lg text-sm md:text-base ${
                      isDarkMode 
                        ? 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-yellow-500/25' 
                        : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/25'
                    }`}
                  >
                    ادامه
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: تأیید نهایی */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-3 md:space-y-4"
              >
                <h3 className={`text-base md:text-lg font-semibold mb-2 md:mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  تأیید نهایی
                </h3>

                <div className={`rounded-lg p-3 md:p-4 space-y-2 text-sm md:text-base ${
                  isDarkMode ? 'bg-gray-700/30' : 'bg-amber-100/50'
                }`}>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>نام کامل:</span>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{watch('firstName')} {watch('lastName')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>ایمیل:</span>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{watch('email')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>شماره تلفن:</span>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{watch('countryCode')} {watch('phone')}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-2 space-x-reverse">
                  <input
                    type="checkbox"
                    {...register('agreeToTerms')}
                    className={`w-4 h-4 mt-1 rounded focus:ring-2 flex-shrink-0 ${
                      isDarkMode 
                        ? 'text-yellow-500 bg-gray-700 border-gray-600 focus:ring-yellow-500' 
                        : 'text-amber-600 bg-white border-amber-300 focus:ring-amber-500'
                    }`}
                  />
                  <label className={`text-xs md:text-sm leading-relaxed ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <span>با </span>
                    <Link 
                      href="/terms" 
                      className={`underline transition-colors ${
                        isDarkMode ? 'text-yellow-400 hover:text-yellow-300' : 'text-amber-600 hover:text-amber-500'
                      }`}
                    >
                      قوانین و مقررات
                    </Link>
                    <span> پارسا گلد موافقم</span>
                  </label>
                </div>
                {errors.agreeToTerms && (
                  <p className="text-red-400 text-xs mt-1">{errors.agreeToTerms.message}</p>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={prevStep}
                    className={`flex-1 font-semibold py-2 md:py-3 rounded-lg transition-colors text-sm md:text-base ${
                      isDarkMode 
                        ? 'bg-gray-600 hover:bg-gray-500 text-white' 
                        : 'bg-amber-200 hover:bg-amber-300 text-amber-700'
                    }`}
                  >
                    بازگشت
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || registerMutation.isPending || !isValid}
                    className={`flex-1 font-semibold py-2 md:py-3 rounded-lg transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base ${
                      isDarkMode 
                        ? 'bg-green-500 hover:bg-green-400 text-white shadow-green-500/25' 
                        : 'bg-green-600 hover:bg-green-500 text-white shadow-green-600/25'
                    }`}
                  >
                    {isSubmitting || registerMutation.isPending ? (
                      <span className="flex items-center justify-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className={`w-4 h-4 md:w-5 md:h-5 border-2 rounded-full mr-2 ${
                            isDarkMode 
                              ? 'border-white border-t-transparent' 
                              : 'border-white border-t-transparent'
                          }`}
                        />
                        در حال ثبت‌نام...
                      </span>
                    ) : (
                      'تأیید و ایجاد حساب'
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </form>

          {/* لینک ورود */}
          <div className="mt-4 md:mt-6 text-center">
            <p className={`text-xs md:text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              قبلاً حساب دارید؟{' '}
              <Link
                href="/login"
                className={`font-semibold underline transition-colors ${
                  isDarkMode ? 'text-yellow-400 hover:text-yellow-300' : 'text-amber-600 hover:text-amber-500'
                }`}
              >
                وارد شوید
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}