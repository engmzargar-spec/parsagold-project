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

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(1);

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
          <p className="text-gray-400">ایجاد حساب کاربری جدید</p>
        </div>

        {/* فرم ثبت‌نام */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-gray-700/50"
        >
          {/* نشانگر مراحل */}
          <div className="flex justify-center mb-6">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    currentStep >= step
                      ? 'bg-yellow-500 text-black'
                      : 'bg-gray-600 text-gray-300'
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-8 h-1 mx-2 ${
                      currentStep > step ? 'bg-yellow-500' : 'bg-gray-600'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Step 1: اطلاعات شخصی */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold text-white mb-4">اطلاعات شخصی</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      نام
                    </label>
                    <input
                      type="text"
                      {...register('firstName')}
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                      placeholder="نام"
                    />
                    {errors.firstName && (
                      <p className="text-red-400 text-xs mt-1">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      نام خانوادگی
                    </label>
                    <input
                      type="text"
                      {...register('lastName')}
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                      placeholder="نام خانوادگی"
                    />
                    {errors.lastName && (
                      <p className="text-red-400 text-xs mt-1">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

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
                    شماره ملی
                  </label>
                  <input
                    type="text"
                    {...register('nationalCode')}
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                    placeholder="۱۲۳۴۵۶۷۸۹۰"
                  />
                  {errors.nationalCode && (
                    <p className="text-red-400 text-xs mt-1">{errors.nationalCode.message}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={nextStep}
                  className="w-full bg-yellow-500 text-black font-semibold py-3 rounded-lg hover:bg-yellow-400 transition-colors shadow-lg shadow-yellow-500/25"
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
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold text-white mb-4">اطلاعات تماس و امنیتی</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    شماره تلفن
                  </label>
                  <div className="flex gap-2">
                    <select
                      {...register('countryCode')}
                      className="w-24 px-2 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
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
                      className="flex-1 px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                      placeholder="۹۱۲۳۴۵۶۷۸۹"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>
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
                      placeholder="رمز عبور قوی"
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

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    تکرار رمز عبور
                  </label>
                  <input
                    type="password"
                    {...register('confirmPassword')}
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
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
                    className="flex-1 bg-gray-600 text-white font-semibold py-3 rounded-lg hover:bg-gray-500 transition-colors"
                  >
                    بازگشت
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex-1 bg-yellow-500 text-black font-semibold py-3 rounded-lg hover:bg-yellow-400 transition-colors shadow-lg shadow-yellow-500/25"
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
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold text-white mb-4">تأیید نهایی</h3>

                <div className="bg-gray-700/30 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">نام کامل:</span>
                    <span className="text-white">{watch('firstName')} {watch('lastName')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">ایمیل:</span>
                    <span className="text-white">{watch('email')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">شماره تلفن:</span>
                    <span className="text-white">{watch('countryCode')} {watch('phone')}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <input
                    type="checkbox"
                    {...register('agreeToTerms')}
                    className="w-4 h-4 text-yellow-500 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500 focus:ring-2"
                  />
                  <label className="text-sm text-gray-300">
                    <span>با </span>
                    <Link href="/terms" className="text-yellow-400 hover:text-yellow-300 underline">
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
                    className="flex-1 bg-gray-600 text-white font-semibold py-3 rounded-lg hover:bg-gray-500 transition-colors"
                  >
                    بازگشت
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || registerMutation.isPending || !isValid}
                    className="flex-1 bg-green-500 text-white font-semibold py-3 rounded-lg hover:bg-green-400 transition-colors shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting || registerMutation.isPending ? (
                      <span className="flex items-center justify-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
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
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              قبلاً حساب دارید؟{' '}
              <Link
                href="/login"
                className="text-yellow-400 hover:text-yellow-300 font-semibold underline transition-colors"
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