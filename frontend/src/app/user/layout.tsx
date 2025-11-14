// D:/parsagold-project/frontend/src/app/user/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const accessToken = localStorage.getItem('access_token');
      const userPhone = localStorage.getItem('userPhone');
      
      console.log('🔐 بررسی دسترسی کاربر:', { 
        accessToken: accessToken ? '✅ موجود' : '❌ مفقود',
        userPhone: userPhone || '❌ مفقود'
      });
      
      if (!accessToken) {
        console.log('🚫 access_token وجود ندارد - هدایت به صفحه ثبت‌نام');
        router.push('/auth/register');
        return;
      }
      
      console.log('✅ کاربر احراز هویت شده است:', { userPhone });
      setIsLoading(false);
    };

    setTimeout(checkAuth, 100);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-amber-700 font-semibold">در حال بررسی دسترسی...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100">
      {children}
    </div>
  );
}