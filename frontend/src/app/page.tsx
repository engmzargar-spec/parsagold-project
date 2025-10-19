// فایل: src/app/page.tsx
'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import LivePrices from '@/components/LivePrices';

// آرایه بنرها - با اضافه شدن بنر نقره
const banners = [
  {
    id: 1,
    title: 'به اتاق معاملات اُنس و نفت',
    subtitle: 'پارسا گلد خوش آمدید',
    description: 'اولین اتاق معامله آنلاین نفت ایران',
    image: '/logo/Parsagold-main-logo.png',
    bgColor: 'from-gray-900 to-gray-800'
  },
  {
    id: 2,
    title: 'معاملات امن طلا',
    subtitle: 'با بهترین قیمت‌های جهانی',
    description: 'خرید و فروش آنلاین طلا با امنیت کامل',
    image: '/icons/gold.png',
    bgColor: 'from-amber-900 to-amber-700'
  },
  {
    id: 3,
    title: 'نفت برنت',
    subtitle: 'فرصت‌های سرمایه‌گذاری',
    description: 'معامله نفت با کمترین کارمزد',
    image: '/icons/brentoil.png',
    bgColor: 'from-blue-900 to-blue-700'
  },
  {
    id: 4,
    title: 'معاملات نقره',
    subtitle: 'فرصت‌های طلایی در بازار نقره',
    description: 'معامله نقره با بهترین نرخ',
    image: '/icons/silver.png',
    bgColor: 'from-slate-700 to-slate-500'
  },
  {
    id: 5,
    title: 'پشتیبانی ۲۴ ساعته',
    subtitle: 'تیم متخصص پارساگلد',
    description: 'همراهی شما در تمام مراحل معاملات',
    image: '/icons/support2.png',
    bgColor: 'from-green-900 to-green-700'
  }
];

// کامپوننت کارت ویژگی با انیمیشن
const FeatureCard = ({ 
  feature, 
  index 
}: { 
  feature: { 
    icon: string; 
    title: string; 
    description: string;
    detailedDescription: string;
  }; 
  index: number; 
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, threshold: 0.2 });

  const direction = index % 2 === 0 ? 'left' : 'right';
  
  return (
    <motion.div
      ref={ref}
      initial={{ 
        opacity: 0, 
        x: direction === 'left' ? -100 : 100,
        y: 50 
      }}
      animate={isInView ? { 
        opacity: 1, 
        x: 0, 
        y: 0 
      } : { 
        opacity: 0, 
        x: direction === 'left' ? -100 : 100,
        y: 50 
      }}
      transition={{ 
        duration: 0.8, 
        delay: index * 0.3,
        ease: "easeOut"
      }}
      className="w-full flex justify-center mb-12"
    >
      <div className="w-full max-w-4xl bg-gradient-to-br from-gray-800 to-gray-700 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:transform hover:-translate-y-3 border-2 border-yellow-500/30">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* آیکون و عنوان */}
          <div className="flex-shrink-0 text-center lg:text-left">
            <div className="flex justify-center lg:justify-start mb-4">
              <div className="w-24 h-24 md:w-32 md:h-32 relative bg-yellow-500/10 rounded-2xl p-4">
                <Image 
                  src={feature.icon} 
                  alt={feature.title}
                  fill
                  className="object-contain p-2"
                />
              </div>
            </div>
            <motion.h3 
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: index * 0.3 + 0.4 }}
              className="text-2xl md:text-3xl font-bold text-yellow-400 mb-4"
            >
              {feature.title}
            </motion.h3>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: index * 0.3 + 0.5 }}
              className="text-lg text-gray-300 mb-4 lg:mb-0"
            >
              {feature.description}
            </motion.p>
          </div>

          {/* متن توصیفی کامل */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: index * 0.3 + 0.6 }}
            className="flex-1 bg-gray-900/50 rounded-2xl p-6 border border-yellow-500/20"
          >
            <p className="text-gray-200 text-lg leading-relaxed">
              {feature.detailedDescription}
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

// کامپوننت فرم تماس
const ContactForm = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, threshold: 0.2 });

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // منطق ارسال فرم
    console.log('Form submitted:', formData);
    alert('پیام شما با موفقیت ارسال شد!');
    setFormData({ email: '', phone: '', subject: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 80 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 80 }}
      transition={{ duration: 0.8 }}
      className="w-full max-w-4xl mx-auto bg-gradient-to-br from-gray-800 to-gray-700 rounded-3xl p-8 shadow-2xl border-2 border-yellow-500/30"
    >
      <h2 className="text-3xl md:text-4xl font-bold text-yellow-400 text-center mb-8">
        ثبت تیکت پشتیبانی
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ایمیل */}
          <div>
            <label className="block text-yellow-300 text-lg mb-2">
              آدرس ایمیل
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-gray-900 border border-yellow-500/30 rounded-xl text-white text-lg focus:outline-none focus:border-yellow-500 transition-colors"
              placeholder="example@email.com"
            />
          </div>

          {/* شماره موبایل */}
          <div>
            <label className="block text-yellow-300 text-lg mb-2">
              شماره موبایل
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-gray-900 border border-yellow-500/30 rounded-xl text-white text-lg focus:outline-none focus:border-yellow-500 transition-colors"
              placeholder="0912XXXXXXX"
            />
          </div>
        </div>

        {/* موضوع */}
        <div>
          <label className="block text-yellow-300 text-lg mb-2">
            موضوع پیام
          </label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-gray-900 border border-yellow-500/30 rounded-xl text-white text-lg focus:outline-none focus:border-yellow-500 transition-colors"
            placeholder="عنوان پیام خود را وارد کنید"
          />
        </div>

        {/* متن پیام */}
        <div>
          <label className="block text-yellow-300 text-lg mb-2">
            متن پیام
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={6}
            className="w-full px-4 py-3 bg-gray-900 border border-yellow-500/30 rounded-xl text-white text-lg focus:outline-none focus:border-yellow-500 transition-colors resize-none"
            placeholder="متن کامل پیام خود را اینجا بنویسید..."
          />
        </div>

        {/* دکمه ارسال */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="w-full py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-yellow-900 font-bold text-xl rounded-xl hover:from-yellow-400 hover:to-yellow-500 transition-all duration-300 shadow-lg"
        >
          ارسال پیام
        </motion.button>
      </form>
    </motion.div>
  );
};

export default function Home() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // 🔄 اتوماتیک تغییر بنر هر 5 ثانیه - همیشه فعال
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      nextBanner();
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, currentBanner]);

  // 🔄 مدیریت تم تیره/روشن
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const nextBanner = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    setTimeout(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
      setIsTransitioning(false);
    }, 500);
  };

  const prevBanner = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    setTimeout(() => {
      setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
      setIsTransitioning(false);
    }, 500);
  };

  const goToBanner = (index: number) => {
    if (isTransitioning || index === currentBanner) return;
    
    setIsTransitioning(true);
    
    setTimeout(() => {
      setCurrentBanner(index);
      setIsTransitioning(false);
    }, 500);
  };

  // 🔧 تابع برای هدایت به صفحات
  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const currentBannerData = banners[currentBanner];

  // داده‌های کارت‌های ویژگی با متن‌های کامل
  const features = [
    { 
      icon: '/icons/fasttrading.png', 
      title: 'سرعت معاملاتی فوق‌العاده',
      description: 'انجام معاملات در کسری از ثانیه',
      detailedDescription: 'با استفاده از سرورهای پرسرعت و زیرساخت بهینه‌شده، معاملات شما در کمترین زمان ممکن اجرا می‌شود. هیچ گونه تاخیری در انجام سفارشات وجود ندارد و می‌توانید از فرصت‌های بازار به بهترین شکل استفاده کنید. سیستم معاملاتی ما قادر به پردازش هزاران تراکنش در ثانیه است.'
    },
    { 
      icon: '/icons/lowerfees.png', 
      title: 'کمترین کارمزد در بازار',
      description: 'پایین‌ترین نرخ کارمزد در بازار',
      detailedDescription: 'کارمزد معاملات در پارساگلد تا 50% کمتر از سایر پلتفرم‌هاست. این امر باعث افزایش سودآوری شما شده و هزینه‌های معاملاتی را به حداقل می‌رساند. شفافیت کامل در محاسبه کارمزدها - هیچ هزینه پنهانی وجود ندارد. برای معامله‌گران حرفه‌ای شرایط ویژه‌ای در نظر گرفته‌ایم.'
    },
    { 
      icon: '/icons/security.png', 
      title: 'امنیت بانکی سطح اول',
      description: 'حفظ دارایی شما با بالاترین استانداردهای امنیتی',
      detailedDescription: 'دارایی‌های شما در کیف پول‌های امن و چندامضایی نگهداری می‌شوند. از استانداردهای رمزنگاری پیشرفته استفاده می‌کنیم و کلیه تراکنش‌ها به صورت شفاف و قابل ردیابی هستند. سیستم ما تحت نظارت مستمر امنیتی قرار دارد و از بیمه دارایی‌های دیجیتال بهره می‌برید.'
    },
    { 
      icon: '/icons/perfectsupport.png', 
      title: 'پشتیبانی تخصصی 24 ساعته',
      description: 'پشتیبانی ۲۴ ساعته توسط متخصصان',
      detailedDescription: 'تیم پشتیبانی پارساگلد متشکل از متخصصان مالی و فنی، به صورت 24 ساعته و در 7 روز هفته آماده پاسخگویی به سوالات و حل مشکلات شما هستند. از طریق多种کانال‌های ارتباطی در دسترس هستیم. همچنین دوره‌های آموزشی رایگان و مشاوره تخصصی معاملاتی ارائه می‌دهیم.'
    },
  ];

  return (
    <main 
      className={`min-h-screen flex flex-col items-center transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white' 
          : 'bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 text-gray-900'
      }`}
      style={{
        fontFamily: 'var(--font-parsagold), system-ui, sans-serif'
      }}
    >
      {/* 🔼 هدر اصلی با لوگو */}
      <div className="w-full max-w-7xl flex flex-col items-center py-4 gap-4 px-6">
        
        {/* 🔼 ردیف اول: لوگو و منو */}
        <div className="w-full flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* لوگوی پارساگلد - سایز مناسب */}
          <div className="flex-shrink-0">
            <div className="w-48 h-16 md:w-56 md:h-20 relative">
              <Image
                src="/logo/Parsagold-main-logo.png"
                alt="پارساگلد - اتاق معامله آنلاین اُنس و نفت"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* منوی دسکتاپ */}
          <div className={`hidden lg:flex items-center gap-6 text-base ${
            isDarkMode ? 'text-yellow-400' : 'text-amber-600'
          }`}>
            <button 
              onClick={() => handleNavigation('/rules')}
              className="hover:opacity-80 transition-opacity hover:underline"
            >
              قوانین و مقررات
            </button>
            <span className={`h-6 w-px ${isDarkMode ? 'bg-yellow-500' : 'bg-amber-500'}`} />
            <button 
              onClick={() => handleNavigation('/faq')}
              className="hover:opacity-80 transition-opacity hover:underline"
            >
              سئوالات متداول
            </button>
            <span className={`h-6 w-px ${isDarkMode ? 'bg-yellow-500' : 'bg-amber-500'}`} />
            <button 
              onClick={() => handleNavigation('/about')}
              className="hover:opacity-80 transition-opacity hover:underline"
            >
              درباره ما
            </button>
            <span className={`h-6 w-px ${isDarkMode ? 'bg-yellow-500' : 'bg-amber-500'}`} />
            <button 
              onClick={() => handleNavigation('/contact')}
              className="hover:opacity-80 transition-opacity hover:underline"
            >
              تماس با ما
            </button>
          </div>

          {/* دکمه‌های ورود و عضویت + تغییر تم */}
          <div className="flex gap-4 items-center">
            {/* دکمه تغییر تم */}
            <button
              onClick={toggleTheme}
              className={`p-3 rounded-lg transition-all duration-300 hover:scale-110 ${
                isDarkMode 
                  ? 'bg-yellow-500 text-yellow-900 hover:bg-yellow-400' 
                  : 'bg-amber-600 text-white hover:bg-amber-500'
              }`}
              title={isDarkMode ? 'تغییر به تم روشن' : 'تغییر به تم تیره'}
            >
              {isDarkMode ? (
                // خورشید (تم روشن)
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
                </svg>
              ) : (
                // ماه (تم تیره)
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd"/>
                </svg>
              )}
            </button>

            {/* دکمه‌های ورود و عضویت */}
            <button 
              onClick={() => handleNavigation('/login')}
              className={`px-6 py-3 border font-semibold rounded-lg shadow-sm transition-all duration-200 hover:scale-105 active:scale-95 text-base ${
                isDarkMode 
                  ? 'border-yellow-500 text-yellow-500 hover:bg-gradient-to-r hover:from-yellow-400 hover:to-yellow-500 hover:text-black' 
                  : 'border-amber-600 text-amber-600 hover:bg-gradient-to-r hover:from-amber-500 hover:to-amber-600 hover:text-white'
              }`}
            >
              ورود
            </button>
            <button 
              onClick={() => handleNavigation('/register')}
              className={`px-6 py-3 border font-semibold rounded-lg shadow-sm transition-all duration-200 hover:scale-105 active:scale-95 text-base ${
                isDarkMode 
                  ? 'border-yellow-500 text-yellow-500 hover:bg-gradient-to-r hover:from-yellow-400 hover:to-yellow-500 hover:text-black' 
                  : 'border-amber-600 text-amber-600 hover:bg-gradient-to-r hover:from-amber-500 hover:to-amber-600 hover:text-white'
              }`}
            >
              عضویت
            </button>
          </div>
        </div>

        {/* دکمه همبرگری موبایل */}
        <div className="lg:hidden w-full flex justify-center mt-4">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`border px-6 py-3 rounded-lg transition-colors text-base ${
              isDarkMode 
                ? 'text-yellow-500 border-yellow-500 hover:bg-yellow-500 hover:text-black' 
                : 'text-amber-600 border-amber-600 hover:bg-amber-600 hover:text-white'
            }`}
          >
            ☰ منو
          </button>
        </div>

        {/* منوی کشویی موبایل */}
        {menuOpen && (
          <div className={`w-full flex flex-col items-center gap-4 mt-4 lg:hidden text-base rounded-lg p-6 ${
            isDarkMode ? 'text-yellow-400 bg-gray-800' : 'text-amber-600 bg-amber-100'
          }`}>
            <button 
              onClick={() => handleNavigation('/rules')}
              className="hover:opacity-80 transition-opacity py-2"
            >
              قوانین و مقررات
            </button>
            <button 
              onClick={() => handleNavigation('/faq')}
              className="hover:opacity-80 transition-opacity py-2"
            >
              سئوالات متداول
            </button>
            <button 
              onClick={() => handleNavigation('/about')}
              className="hover:opacity-80 transition-opacity py-2"
            >
              درباره ما
            </button>
            <button 
              onClick={() => handleNavigation('/contact')}
              className="hover:opacity-80 transition-opacity py-2"
            >
              تماس با ما
            </button>
          </div>
        )}
      </div>

      {/* ✅ خط طلایی زرد */}
      <hr className={`w-full max-w-7xl my-4 ${
        isDarkMode ? 'border-yellow-500' : 'border-amber-500'
      }`} />

      {/* قیمت‌های زنده */}
      <div className="w-full max-w-7xl flex justify-center mb-8 px-6">
        <LivePrices />
      </div>

      {/* 🔄 بنر اسلایدر با انیمیشن و گوشه‌های گرد */}
      <div className="w-full max-w-7xl relative mb-16 px-6">
        <div className={`relative h-80 md:h-72 lg:h-96 w-full bg-gradient-to-br ${currentBannerData.bgColor} rounded-3xl md:rounded-4xl overflow-hidden transition-all duration-500 ${
          isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        } transform-gpu shadow-2xl`}>
          
          {/* محتوای بنر */}
          <div className="container mx-auto px-4 sm:px-6 h-full flex flex-col md:flex-row items-center justify-between py-6 md:py-0">
            
            {/* متن بنر */}
            <div className="flex-1 text-center md:text-right md:pr-8 z-10 order-2 md:order-1 mt-6 md:mt-0 transition-all duration-700 delay-200">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-yellow-400 mb-3 sm:mb-4 leading-tight transform transition-all duration-700">
                {currentBannerData.title}
                <br />
                <span className="text-yellow-300 text-xl sm:text-2xl lg:text-3xl xl:text-4xl inline-block transform transition-all duration-700 delay-100">
                  {currentBannerData.subtitle}
                </span>
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-yellow-200 mb-4 sm:mb-6 px-2 sm:px-0 transform transition-all duration-700 delay-300">
                {currentBannerData.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start transform transition-all duration-700 delay-500">
                <button 
                  onClick={() => handleNavigation('/trading')}
                  className="px-6 py-2 sm:px-8 sm:py-3 bg-yellow-500 text-yellow-900 font-bold rounded-xl hover:bg-yellow-400 transition-all duration-300 hover:scale-105 text-sm sm:text-base shadow-lg"
                >
                  شروع معاملات
                </button>
                <button 
                  onClick={() => handleNavigation('/register')}
                  className="px-6 py-2 sm:px-8 sm:py-3 border-2 border-yellow-500 text-yellow-500 font-bold rounded-xl hover:bg-yellow-500 hover:text-black transition-all duration-300 hover:scale-105 text-sm sm:text-base shadow-lg"
                >
                  عضویت رایگان
                </button>
              </div>
            </div>

            {/* تصویر بنر */}
            <div className="flex-1 flex justify-center md:justify-end order-1 md:order-2 transform transition-all duration-700 delay-400">
              <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 relative">
                <Image
                  src={currentBannerData.image}
                  alt={currentBannerData.title}
                  fill
                  className="object-contain transform transition-all duration-700 hover:scale-110"
                  priority
                  sizes="(max-width: 640px) 192px, (max-width: 768px) 224px, (max-width: 1024px) 256px, 288px"
                />
              </div>
            </div>
          </div>

          {/* دکمه‌های کنترل اسلایدر */}
          <div className="absolute inset-x-0 bottom-3 sm:bottom-4 flex justify-center items-center gap-3 sm:gap-4">
            {/* دکمه قبلی */}
            <button
              onClick={prevBanner}
              disabled={isTransitioning}
              className="p-2 sm:p-3 bg-black/60 rounded-2xl hover:bg-black/80 transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* نقاط نشانگر */}
            <div className="flex gap-2 sm:gap-3 bg-black/40 rounded-2xl px-3 py-2 shadow-lg">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToBanner(index)}
                  disabled={isTransitioning}
                  className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-300 transform hover:scale-125 ${
                    index === currentBanner 
                      ? 'bg-yellow-500 scale-125 shadow-lg' 
                      : 'bg-yellow-400/50 hover:bg-yellow-400'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                />
              ))}
            </div>

            {/* دکمه بعدی */}
            <button
              onClick={nextBanner}
              disabled={isTransitioning}
              className="p-2 sm:p-3 bg-black/60 rounded-2xl hover:bg-black/80 transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* دکمه play/pause */}
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="p-2 sm:p-3 bg-black/60 rounded-2xl hover:bg-black/80 transition-all duration-300 hover:scale-110 shadow-lg"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isAutoPlaying ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* بخش "چرا باید پارساگلد را انتخاب کنم" */}
      <section className="w-full max-w-7xl mb-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${
            isDarkMode ? 'text-yellow-400' : 'text-amber-600'
          }`}>
            چرا باید پارساگلد را انتخاب کنم؟
          </h2>
          <p className={`text-lg max-w-2xl mx-auto ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            با پارساگلد، تجربه‌ای متفاوت از معاملات آنلاین طلا و نفت داشته باشید
          </p>
        </motion.div>

        {/* کارت‌های ویژگی - یک کارت در هر ردیف */}
        <div className="space-y-8">
          {features.map((feature, index) => (
            <FeatureCard 
              key={feature.title} 
              feature={feature} 
              index={index} 
            />
          ))}
        </div>
      </section>

      {/* ✅ خط جداکننده طلایی بین بخش تیکت و فوتر */}
      <hr className={`w-full max-w-7xl my-8 border-t-2 ${
        isDarkMode ? 'border-yellow-500' : 'border-amber-500'
      }`} />

      {/* بخش فرم تماس */}
      <section className="w-full max-w-7xl mb-16 px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${
            isDarkMode ? 'text-yellow-400' : 'text-amber-600'
          }`}>
            ثبت تیکت پشتیبانی
          </h2>
          <p className={`text-lg max-w-2xl mx-auto ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            برای ارتباط با ما، فرم زیر را پر کنید. در اسرع وقت پاسخگوی شما خواهیم بود.
          </p>
        </motion.div>

        <ContactForm />
      </section>

      {/* ✅ خط جداکننده طلایی بین بخش تیکت و فوتر */}
      <hr className={`w-full max-w-7xl my-8 border-t-2 ${
        isDarkMode ? 'border-yellow-500' : 'border-amber-500'
      }`} />

      {/* فوتر */}
      <footer className={`w-full max-w-7xl flex flex-col lg:flex-row justify-between items-center text-base gap-8 mt-8 py-8 px-6 ${
        isDarkMode ? 'text-gray-300' : 'text-gray-600'
      }`}>
        {/* پشتیبانی */}
        <div className={`flex items-center gap-4 rounded-2xl px-6 py-4 ${
          isDarkMode ? 'bg-gray-800' : 'bg-amber-100'
        }`}>
          <div className="w-16 h-16 relative">
            <Image
              src="/icons/support2.png"
              alt="پشتیبانی"
              fill
              className="object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className={`font-semibold text-lg ${
              isDarkMode ? 'text-yellow-400' : 'text-amber-600'
            }`}>پشتیبانی ۲۴/۷</span>
            <span className="text-xl">۰۹۱۶۳۰۲۸۴۹۸</span>
          </div>
        </div>

        {/* شبکه‌های اجتماعی */}
        <div className="flex gap-6">
          {[
            { name: 'اینستاگرام', icon: '/icons/instagram1.png', link: '#' },
            { name: 'واتس‌اپ', icon: '/icons/whatsapp1.png', link: '#' },
            { name: 'تلگرام', icon: '/icons/telegram1.png', link: '#' },
            { name: 'فیسبوک', icon: '/icons/facebook1.png', link: '#' },
          ].map((item, index) => (
            <button 
              key={index}
              onClick={() => handleNavigation('/social')}
              title={item.name}
              className={`w-12 h-12 md:w-14 md:h-14 relative hover:scale-110 transition-transform duration-200 rounded-2xl p-2 ${
                isDarkMode ? 'bg-gray-800' : 'bg-amber-100'
              }`}
            >
              <Image
                src={item.icon}
                alt={item.name}
                fill
                className="object-contain"
              />
            </button>
          ))}
        </div>
      </footer>

      {/* کپی رایت */}
      <div className={`w-full max-w-7xl text-center text-sm mt-4 pb-8 px-6 ${
        isDarkMode ? 'text-gray-400' : 'text-gray-500'
      }`}>
        © ۲۰۲۴ پارساگلد. تمام حقوق محفوظ است.
      </div>
    </main>
  );
}