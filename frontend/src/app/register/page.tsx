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
    <main dir="rtl" className="min-h-screen bg-gray-900 text-white px-4 py-10">
      <div className="absolute top-4 right-4">
        <Link href="/" className="text-yellow-400 hover:text-yellow-300 flex items-center gap-2">
          <HomeIcon className="w-6 h-6" />
        </Link>
      </div>

      <div className="flex flex-col md:flex-row-reverse items-stretch justify-center max-w-5xl mx-auto">
        {/* بخش فرم */}
        <div className="w-full md:w-1/2 bg-gray-800 rounded-r-xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-yellow-400 mb-6 text-center">ثبت‌نام در پارسا گلد</h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* فیلد نام */}
            <div>
              <input
                {...register('firstName')}
                type="text"
                placeholder="نام: *"
                className={`w-full px-4 py-3 rounded-md bg-gray-700 text-white placeholder-gray-400 text-right ${
                  errors.firstName ? 'border border-red-500' : 'border border-gray-600'
                }`}
              />
              {errors.firstName && (
                <p className="text-red-400 text-sm text-right mt-1">{errors.firstName.message}</p>
              )}
            </div>

            {/* فیلد نام خانوادگی */}
            <div>
              <input
                {...register('lastName')}
                type="text"
                placeholder="نام خانوادگی: *"
                className={`w-full px-4 py-3 rounded-md bg-gray-700 text-white placeholder-gray-400 text-right ${
                  errors.lastName ? 'border border-red-500' : 'border border-gray-600'
                }`}
              />
              {errors.lastName && (
                <p className="text-red-400 text-sm text-right mt-1">{errors.lastName.message}</p>
              )}
            </div>

            {/* فیلد ایمیل */}
            <div>
              <input
                {...register('email')}
                type="email"
                placeholder="ایمیل: *"
                className={`w-full px-4 py-3 rounded-md bg-gray-700 text-white placeholder-gray-400 text-right ${
                  errors.email ? 'border border-red-500' : 'border border-gray-600'
                }`}
              />
              {errors.email && (
                <p className="text-red-400 text-sm text-right mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* فیلد شماره ملی */}
            <div>
              <input
                {...register('nationalCode')}
                type="text"
                placeholder="شماره ملی: *"
                maxLength={10}
                className={`w-full px-4 py-3 rounded-md bg-gray-700 text-white placeholder-gray-400 text-right ${
                  errors.nationalCode ? 'border border-red-500' : 'border border-gray-600'
                }`}
              />
              {errors.nationalCode && (
                <p className="text-red-400 text-sm text-right mt-1">{errors.nationalCode.message}</p>
              )}
            </div>

            {/* فیلد شماره تلفن */}
            <div className="flex flex-row-reverse items-center gap-2">
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
              <span className="text-yellow-400 text-sm">{selectedCountry?.code}</span>
              <input
                {...register('phone')}
                type="tel"
                placeholder="شماره موبایل (بدون صفر): *"
                className={`px-4 py-3 rounded-md bg-gray-700 text-white placeholder-gray-400 text-right flex-1 ${
                  errors.phone ? 'border border-red-500' : 'border border-gray-600'
                }`}
              />
            </div>
            {errors.phone && (
              <p className="text-red-400 text-sm text-right mt-1">{errors.phone.message}</p>
            )}

            {/* فیلد رمز عبور */}
            <div>
              <input
                {...register('password')}
                type="password"
                placeholder="رمز عبور: *"
                className={`w-full px-4 py-3 rounded-md bg-gray-700 text-white placeholder-gray-400 text-right ${
                  errors.password ? 'border border-red-500' : 'border border-gray-600'
                }`}
              />
              {errors.password && (
                <p className="text-red-400 text-sm text-right mt-1">{errors.password.message}</p>
              )}
              <p className="text-xs text-gray-400 text-right mt-1">
                رمز عبور باید شامل حداقل ۸ کاراکتر، حروف بزرگ، حروف کوچک، عدد و علامت خاص باشد.
              </p>
            </div>

            {/* فیلد تکرار رمز عبور */}
            <div>
              <input
                {...register('confirmPassword')}
                type="password"
                placeholder="تکرار رمز عبور: *"
                className={`w-full px-4 py-3 rounded-md bg-gray-700 text-white placeholder-gray-400 text-right ${
                  errors.confirmPassword ? 'border border-red-500' : 'border border-gray-600'
                }`}
              />
              {errors.confirmPassword && (
                <p className="text-red-400 text-sm text-right mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* قوانین و مقررات */}
            <div className="flex flex-row-reverse items-center justify-end gap-x-2">
              <input
                {...register('acceptedTerms')}
                type="checkbox"
                className={`accent-yellow-500 w-4 h-4 ${
                  errors.acceptedTerms ? 'outline outline-red-500' : ''
                }`}
              />
              <label className="text-sm text-gray-300 text-right">
                <Link href="/terms" className="text-yellow-400 hover:text-yellow-300 underline">
                  قوانین و مقررات
                </Link>
                را مطالعه کرده‌ام و می‌پذیرم
              </label>
            </div>
            {errors.acceptedTerms && (
              <p className="text-red-400 text-sm text-right mt-1">{errors.acceptedTerms.message}</p>
            )}

            {/* دکمه ثبت‌نام */}
            <button
              type="submit"
              disabled={isSubmitting || registerMutation.isPending}
              className="w-full py-3 bg-yellow-500 text-black font-semibold rounded-md shadow-md hover:bg-yellow-400 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting || registerMutation.isPending ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
            </button>

            {/* نمایش خطا */}
            {errors.root && (
              <p className="text-red-400 text-sm text-right mt-2">{errors.root.message}</p>
            )}

            {/* لینک ورود */}
            <div className="text-center mt-4">
              <p className="text-gray-300">
                قبلاً حساب دارید؟{' '}
                <Link href="/login" className="text-yellow-400 hover:text-yellow-300 underline">
                  وارد شوید
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* سایدبار تصویر */}
        <div className="w-full md:w-1/2 bg-gray-700 border-l-2 border-yellow-500 rounded-l-xl shadow-xl flex items-center justify-center p-8">
          <div className="text-center">
            <Image 
              src="/icons/handshake.png" 
              alt="پارسا گلد" 
              width={160} 
              height={160}
              className="mx-auto mb-6"
            />
            <h3 className="text-2xl font-bold text-yellow-400 mb-4">پارسا گلد</h3>
            <p className="text-gray-300">پلتفرم مطمئن معاملات طلا، نقره و نفت</p>
          </div>
        </div>
      </div>
    </main>
  );
}