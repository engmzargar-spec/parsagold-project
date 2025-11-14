// D:/parsagold-project/frontend/src/components/shared/LoadingOptimized.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface LoadingOptimizedProps {
  type?: 'dashboard' | 'chart' | 'table' | 'card' | 'page';
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * کامپوننت لودینگ بهینه‌شده برای سئو و UX
 * - انیمیشن‌های روان
 * - محتوای معنادار برای سئو
 * - سایزهای مختلف
 */
export default function LoadingOptimized({ 
  type = 'page', 
  message,
  size = 'md'
}: LoadingOptimizedProps) {
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  const messages = {
    dashboard: 'در حال بارگذاری داشبورد...',
    chart: 'در حال بارگذاری نمودار...',
    table: 'در حال بارگذاری اطلاعات...',
    card: 'در حال بارگذاری...',
    page: 'در حال بارگذاری صفحه...'
  };

  const displayMessage = message || messages[type];

  // اسکلتون برای سئو - محتوای معنادار که بعداً جایگزین می‌شود
  const skeletonContent = {
    dashboard: (
      <div role="status" aria-live="polite" className="sr-only">
        در حال بارگذاری پنل مدیریت سرمایه پارسا گلد. لطفاً منتظر بمانید.
      </div>
    ),
    page: (
      <div role="status" aria-live="polite" className="sr-only">
        در حال بارگذاری محتوای صفحه. لطفاً چند لحظه صبر کنید.
      </div>
    )
  };

  return (
    <div 
      className="flex flex-col items-center justify-center p-8"
      role="status"
      aria-label={displayMessage}
    >
      {/* اسپینر انیمیشنی */}
      <motion.div
        className={`
          border-4 border-amber-500 border-t-transparent 
          rounded-full animate-spin
          ${sizeClasses[size]}
        `}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      />
      
      {/* متن لودینگ */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-4 text-amber-700 font-medium text-center"
      >
        {displayMessage}
      </motion.p>
      
      {/* محتوای معنادار برای سئو */}
      {skeletonContent[type as keyof typeof skeletonContent]}
      
      {/* اسکلتون برای CLS بهتر */}
      <div aria-hidden="true" className="mt-4 space-y-2 opacity-0">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
  );
}