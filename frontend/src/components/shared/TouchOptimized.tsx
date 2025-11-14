// D:/parsagold-project/frontend/src/components/shared/TouchOptimized.tsx
'use client';

import React from 'react';

interface TouchOptimizedProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent | React.TouchEvent) => void;
  className?: string;
  ariaLabel?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  role?: string;
  tabIndex?: number;
}

/**
 * کامپوننت بهینه‌شده برای تجربه لمسی در موبایل
 * - حداقل سایز 44x44 پیکسل برای دکمه‌ها
 * - حذف هایلایت پیش‌فرض مرورگر
 * - پشتیبانی از تاچ ایونت‌ها
 * - accessibility کامل
 */
export default function TouchOptimized({ 
  children, 
  onClick, 
  className = '', 
  ariaLabel,
  disabled = false,
  type = 'button',
  role,
  tabIndex
}: TouchOptimizedProps) {
  
  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    if (!disabled && onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type={type}
      onClick={handleInteraction}
      onTouchEnd={handleInteraction}
      disabled={disabled}
      aria-label={ariaLabel}
      role={role}
      tabIndex={tabIndex}
      className={`
        // حداقل سایز برای لمسی
        min-h-[44px] 
        min-w-[44px]
        
        // بهینه‌سازی‌های لمسی
        touch-manipulation
        select-none
        
        // انیمیشن و تعامل
        transition-all 
        duration-200
        active:scale-95
        disabled:active:scale-100
        
        // فوکوس و accessibility
        focus:outline-none 
        focus:ring-2 
        focus:ring-blue-500 
        focus:ring-offset-2
        focus:ring-offset-white
        
        // وضعیت غیرفعال
        disabled:opacity-50 
        disabled:cursor-not-allowed
        
        // استایل‌های اضافه
        flex items-center justify-center
        text-center
        ${className}
      `}
      style={{
        // حذف هایلایت پیش‌فرض در مرورگرهای موبایل
        WebkitTapHighlightColor: 'transparent',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        KhtmlUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        userSelect: 'none',
        
        // جلوگیری از زوم دوباره کلیک در iOS
        touchAction: 'manipulation',
      }}
    >
      {children}
    </button>
  );
}