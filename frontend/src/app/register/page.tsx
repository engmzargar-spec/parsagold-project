// فایل: src/app/register/page.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { HomeIcon } from '@heroicons/react/24/solid';
import dynamic from 'next/dynamic';
import { SingleValue } from 'react-select';

import { registerSchema, RegisterFormData } from '@/lib/validations/registerSchema';
import { countryOptions, CountryOption } from '@/lib/countries';
import { registerUser } from '@/lib/api/auth';

const Select = dynamic(() => import('react-select'), { ssr: false });

export default function RegisterPage() {
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    setError
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      countryCode: '+98',
      acceptedTerms: false
    }
  });

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      sessionStorage.setItem('loginPhone', data.phone);
      sessionStorage.setItem('userId', data.user_id.toString());
      router.push('/verify-phone');
    },
    onError: (error: any) => {
      setError('root', { 
        type: 'manual', 
        message: error.message || 'خطا در ثبت‌نام. لطفاً دوباره تلاش کنید.' 
      });
    }
  });

  const extractOS = (userAgent: string): string => {
    if (/windows/i.test(userAgent)) return 'Windows';
    if (/android/i.test(userAgent)) return 'Android';
    if (/iphone|ipad|ios/i.test(userAgent)) return 'iOS';
    if (/macintosh|mac os/i.test(userAgent)) return 'MacOS';
    if (/linux/i.test(userAgent)) return 'Linux';
    return 'نامشخص';
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      let locationData = null;
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
            enableHighAccuracy: false
          });
        });
        locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
      } catch (geoError) {
        console.warn('موقعیت جغرافیایی در دسترس نیست');
      }

      const userAgent = navigator.userAgent;
      const os = extractOS(userAgent);

      const payload = {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        national_code: data.nationalCode,
        password: data.password,
        country_code: data.countryCode,
        os: os,
        ...(locationData && {
          latitude: locationData.latitude,
          longitude: locationData.longitude
        })
      };

      await registerMutation.mutateAsync(payload);
    } catch (error) {
      console.error('خطا در ارسال فرم:', error);
    }
  };

  const handleCountryChange = (option: SingleValue<CountryOption>) => {
    if (option) {
      setValue('countryCode', option.code);
    }
  };

  const customSingleValue = ({ data }: { data: CountryOption }) => (
    <div className="flex items-center gap-2 text-xs md:text-base">
      <div className="w-6 h-4 flex items-center justify-center">
        <span className="text-lg">{data.flag}</span>
      </div>
      <span className="truncate">{data.label}</span>
    </div>
  );

  const customOption = (props: any) => {
    const { data, innerRef, innerProps } = props;
    return (
      <div ref={innerRef} {...innerProps} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-700 cursor-pointer text-xs md:text-sm">
        <div className="w-6 h-4 flex items-center justify-center">
          <span className="text-lg">{data.flag}</span>
        </div>
        <span className="truncate">{data.label}</span>
      </div>
    );
  };

  const customStyles = {
    control: (base: any) => ({
      ...base,
      backgroundColor: '#1f2937',
      borderColor: '#374151',
      color: 'white',
      minHeight: '2.5rem',
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: '#1f2937',
      color: 'white',
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isFocused ? '#374151' : '#1f2937',
      color: 'white',
      cursor: 'pointer',
      fontSize: '0.75rem',
      '@media (min-width: 768px)': {
        fontSize: '0.875rem',
      },
    }),
    singleValue: (base: any) => ({
      ...base,
      color: 'white',
      fontSize: '0.75rem',
      '@media (min-width: 768px)': {
        fontSize: '1rem',
      },
    }),
    input: (base: any) => ({
      ...base,
      color: 'white',
    }),
    placeholder: (base: any) => ({
      ...base,
      color: '#9ca3af',
    }),
  };

  const selectedCountry = countryOptions.find(c => c.code === watch('countryCode')) || countryOptions[0];

  return (
    <motion.main
      dir="rtl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white px-4 py-10"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-500/10 via-transparent to-transparent"></div>
      
      <div className="absolute top-4 right-4 z-50">
        <Link href="/" className="text-yellow-400 hover:text-yellow-300 flex items-center gap-2 bg-gray-800/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-yellow-500/30">
          <HomeIcon className="w-5 h-5" />
          <span className="text-sm">بازگشت به خانه</span>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row-reverse items-stretch justify-center max-w-6xl mx-auto relative z-10">
        {/* بخش فرم */}
        <motion.div 
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full md:w-1/2 bg-gray-900/80 backdrop-blur-md rounded-r-2xl shadow-2xl p-8 border-l border-yellow-500/30"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              ثبت‌نام در پارسا گلد
            </h2>
            <p className="text-gray-400 mt-2">جامعه‌ای مطمئن برای معاملات طلا و نقره</p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* فیلد نام و نام خانوادگی در یک ردیف */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  {...register('firstName')}
                  type="text"
                  placeholder="نام"
                  className={`w-full px-4 py-3 rounded-lg bg-gray-800/50 border-2 text-white placeholder-gray-400 text-right focus:outline-none focus:border-yellow-500 transition-all duration-300 ${
                    errors.firstName ? 'border-red-500' : 'border-gray-600'
                  }`}
                />
                {errors.firstName && (
                  <p className="text-red-400 text-sm text-right mt-2">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <input
                  {...register('lastName')}
                  type="text"
                  placeholder="نام خانوادگی"
                  className={`w-full px-4 py-3 rounded-lg bg-gray-800/50 border-2 text-white placeholder-gray-400 text-right focus:outline-none focus:border-yellow-500 transition-all duration-300 ${
                    errors.lastName ? 'border-red-500' : 'border-gray-600'
                  }`}
                />
                {errors.lastName && (
                  <p className="text-red-400 text-sm text-right mt-2">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* فیلد ایمیل */}
            <div>
              <input
                {...register('email')}
                type="email"
                placeholder="آدرس ایمیل"
                className={`w-full px-4 py-3 rounded-lg bg-gray-800/50 border-2 text-white placeholder-gray-400 text-right focus:outline-none focus:border-yellow-500 transition-all duration-300 ${
                  errors.email ? 'border-red-500' : 'border-gray-600'
                }`}
              />
              {errors.email && (
                <p className="text-red-400 text-sm text-right mt-2">{errors.email.message}</p>
              )}
            </div>

            {/* فیلد شماره ملی */}
            <div>
              <input
                {...register('nationalCode')}
                type="text"
                placeholder="شماره ملی"
                maxLength={10}
                className={`w-full px-4 py-3 rounded-lg bg-gray-800/50 border-2 text-white placeholder-gray-400 text-right focus:outline-none focus:border-yellow-500 transition-all duration-300 ${
                  errors.nationalCode ? 'border-red-500' : 'border-gray-600'
                }`}
              />
              {errors.nationalCode && (
                <p className="text-red-400 text-sm text-right mt-2">{errors.nationalCode.message}</p>
              )}
            </div>

            {/* فیلد شماره تلفن */}
            <div>
              <label className="block text-sm text-gray-400 mb-2 text-right">شماره موبایل</label>
              <div className="flex flex-row-reverse items-center gap-3">
                <div className="w-40">
                  <Select<CountryOption>
                    options={countryOptions}
                    value={selectedCountry}
                    onChange={handleCountryChange}
                    components={{ SingleValue: customSingleValue, Option: customOption }}
                    styles={customStyles}
                    classNamePrefix="react-select"
                    className="text-right"
                    isSearchable={false}
                  />
                </div>
                <span className="text-yellow-400 text-lg font-medium">{selectedCountry?.code}</span>
                <input
                  {...register('phone')}
                  type="tel"
                  placeholder="بدون صفر ابتدایی"
                  className={`px-4 py-3 rounded-lg bg-gray-800/50 border-2 text-white placeholder-gray-400 text-right focus:outline-none focus:border-yellow-500 transition-all duration-300 flex-1 ${
                    errors.phone ? 'border-red-500' : 'border-gray-600'
                  }`}
                />
              </div>
              {errors.phone && (
                <p className="text-red-400 text-sm text-right mt-2">{errors.phone.message}</p>
              )}
            </div>

            {/* فیلد رمز عبور */}
            <div>
              <input
                {...register('password')}
                type="password"
                placeholder="رمز عبور"
                className={`w-full px-4 py-3 rounded-lg bg-gray-800/50 border-2 text-white placeholder-gray-400 text-right focus:outline-none focus:border-yellow-500 transition-all duration-300 ${
                  errors.password ? 'border-red-500' : 'border-gray-600'
                }`}
              />
              {errors.password && (
                <p className="text-red-400 text-sm text-right mt-2">{errors.password.message}</p>
              )}
              <p className="text-xs text-gray-400 text-right mt-2">
                رمز عبور باید شامل حداقل ۸ کاراکتر، حروف بزرگ، حروف کوچک، عدد و علامت خاص باشد
              </p>
            </div>

            {/* فیلد تکرار رمز عبور */}
            <div>
              <input
                {...register('confirmPassword')}
                type="password"
                placeholder="تکرار رمز عبور"
                className={`w-full px-4 py-3 rounded-lg bg-gray-800/50 border-2 text-white placeholder-gray-400 text-right focus:outline-none focus:border-yellow-500 transition-all duration-300 ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-600'
                }`}
              />
              {errors.confirmPassword && (
                <p className="text-red-400 text-sm text-right mt-2">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* قوانین و مقررات */}
            <div className="flex flex-row-reverse items-start justify-end gap-x-3 p-4 bg-gray-800/30 rounded-lg border border-yellow-500/20">
              <input
                {...register('acceptedTerms')}
                type="checkbox"
                className={`accent-yellow-500 w-5 h-5 mt-1 ${
                  errors.acceptedTerms ? 'outline outline-red-500' : ''
                }`}
              />
              <label className="text-sm text-gray-300 text-right flex-1">
                <Link href="/terms" className="text-yellow-400 hover:text-yellow-300 underline font-medium">
                  قوانین و مقررات
                </Link>
                {' '}را مطالعه کرده‌ام و می‌پذیرم
              </label>
            </div>
            {errors.acceptedTerms && (
              <p className="text-red-400 text-sm text-right mt-2">{errors.acceptedTerms.message}</p>
            )}

            {/* دکمه ثبت‌نام */}
            <motion.button
              type="submit"
              disabled={isSubmitting || registerMutation.isPending}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-lg shadow-lg hover:from-yellow-400 hover:to-yellow-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {isSubmitting || registerMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-black border-t-transparent rounded-full"
                  />
                  در حال ثبت‌نام...
                </span>
              ) : (
                'ثبت‌نام و ایجاد حساب'
              )}
            </motion.button>

            {/* نمایش خطا */}
            {errors.root && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/20 border border-red-500/50 rounded-lg p-4"
              >
                <p className="text-red-400 text-sm text-right">{errors.root.message}</p>
              </motion.div>
            )}

            {/* لینک ورود */}
            <div className="text-center pt-4 border-t border-gray-700/50">
              <p className="text-gray-400">
                قبلاً حساب دارید؟{' '}
                <Link href="/login" className="text-yellow-400 hover:text-yellow-300 underline font-medium">
                  وارد شوید
                </Link>
              </p>
            </div>
          </form>
        </motion.div>

        {/* سایدبار لوگو */}
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="w-full md:w-1/2 bg-gradient-to-br from-yellow-600/20 to-yellow-400/10 backdrop-blur-md border-r-2 border-yellow-500/50 rounded-l-2xl shadow-2xl flex items-center justify-center p-12"
        >
          <div className="text-center">
            {/* لوگو با استایل جدید */}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.8, type: "spring" }}
              className="w-64 h-64 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-3xl flex items-center justify-center mx-auto mb-8 p-8 shadow-2xl border-2 border-yellow-300/30"
            >
              <Image 
                src="/icons/handshake.png" 
                alt="پارسا گلد" 
                width={140} 
                height={140}
                className="object-contain drop-shadow-lg"
              />
            </motion.div>
            
            <motion.h3 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="text-4xl font-bold bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent mb-4"
            >
              پارسا گلد
            </motion.h3>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="text-gray-300 text-lg leading-relaxed max-w-md mx-auto"
            >
              <span className="block mb-2">پلتفرم امن و مطمئن برای</span>
              <span className="text-yellow-400 font-semibold">معاملات طلا، نقره و نفت</span>
            </motion.p>

            {/* ویژگی‌ها */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.4 }}
              className="mt-8 grid grid-cols-2 gap-4 text-sm text-gray-400"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>امنیت بالا</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>پشتیبانی 24/7</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>کارمزد کم</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>سرعت بالا</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.main>
  );
}