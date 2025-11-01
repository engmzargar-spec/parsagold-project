// frontend/src/components/AdminHeader.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { 
  ArrowLeft, 
  LogOut, 
  Sun, 
  Moon,
  Shield
} from 'lucide-react';

interface AdminHeaderProps {
  title?: string;
  showBackButton?: boolean;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ 
  title = 'پنل مدیریت',
  showBackButton = true 
}) => {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true); // پیش‌فرض تاریک
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
    
    // دریافت اطلاعات کاربر
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem('admin_token');
      if (token) {
        try {
          const response = await fetch('http://localhost:8000/api/auth/admin/check-access', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            setCurrentUser(data.user);
          }
        } catch (error) {
          console.error('Error fetching current user:', error);
        }
      }
    };

    fetchCurrentUser();
    
    // بروزرسانی زمان
    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);
    
    // بررسی تم از localStorage - پیش‌فرض تاریک
    const savedTheme = localStorage.getItem('admin_theme');
    const initialTheme = savedTheme ? savedTheme === 'dark' : true; // پیش‌فرض تاریک
    setIsDarkMode(initialTheme);
    applyTheme(initialTheme);
    
    return () => clearInterval(timer);
  }, []);

  const updateDateTime = () => {
    const now = new Date();
    
    const time = now.toLocaleTimeString('fa-IR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
    setCurrentTime(time);
    
    const jalaliDate = now.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
    setCurrentDate(jalaliDate);
  };

  const applyTheme = (dark: boolean) => {
    if (dark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  };

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('admin_theme', newTheme ? 'dark' : 'light');
    applyTheme(newTheme);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_theme');
    router.push('/admin/login');
  };

  const getGradeText = (grade: string) => {
    switch (grade) {
      case 'chief': return 'مدیر ارشد';
      case 'grade1': return 'سطح ۱';
      case 'grade2': return 'سطح ۲';
      case 'grade3': return 'سطح ۳';
      case 'super_admin': return 'سوپر ادمین';
      default: return grade;
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'chief': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'grade1': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'grade2': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'grade3': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case 'super_admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  // جلوگیری از hydration mismatch
  if (!isMounted) {
    return (
      <header className="bg-gray-800 border-b border-gray-700 text-white">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-gray-700 rounded animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-700 rounded animate-pulse"></div>
                <div className="h-3 w-24 bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={`border-b ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700 text-white' 
        : 'bg-white border-gray-200 text-gray-900'
    } transition-colors duration-300`}>
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* سمت راست - لوگو و دکمه برگشت */}
          <div className="flex items-center gap-4">
            {showBackButton && pathname !== '/admin/dashboard' && (
              <button 
                onClick={() => router.push('/admin/dashboard')}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            
            <div className="flex items-center gap-3">
              <div className="h-40 w-40 relative">
                <Image
                  src="/logo/parsagold-main-logo.png"
                  alt="پارسا گلد"
                  width={110}
                  height={110}
                  className="object-contain"
                  priority
                />
              </div>
              <div>
                <h1 className="text-xl font-bold">پارسا گلد</h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {title}
                </p>
              </div>
            </div>
          </div>

          {/* وسط - تاریخ و زمان */}
          <div className={`px-4 py-2 rounded-lg border text-center ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="text-lg font-bold text-blue-500">{currentTime}</div>
            <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {currentDate}
            </div>
          </div>

          {/* سمت چپ - اطلاعات کاربر و دکمه‌ها */}
          <div className="flex items-center gap-4">
            {/* اطلاعات کاربر */}
            {currentUser && (
              <div className={`flex items-center gap-3 px-4 py-2 rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {currentUser.first_name?.[0]}{currentUser.last_name?.[0]}
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {currentUser.first_name} {currentUser.last_name}
                  </div>
                  <div className={`text-xs ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    @{currentUser.username}
                  </div>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(currentUser.access_grade || currentUser.role)}`}>
                  <Shield className="w-3 h-3 ml-1" />
                  {getGradeText(currentUser.access_grade || currentUser.role)}
                </span>
              </div>
            )}

            {/* دکمه تغییر تم */}
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              aria-label="تغییر تم"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* دکمه خروج */}
            <button 
              onClick={handleLogout}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
              aria-label="خروج از سیستم"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;