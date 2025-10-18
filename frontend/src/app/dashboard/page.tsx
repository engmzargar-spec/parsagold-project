// frontend/src/app/dashboard/page.tsx
'use client';

import { useAuth } from '../../contexts/AuthContext';

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">در حال بارگذاری...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">داشبورد کاربری</h1>
      
      {isAuthenticated ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <p>خوش آمدید {user?.first_name} {user?.last_name}!</p>
          <p>ایمیل: {user?.email}</p>
        </div>
      ) : (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>شما وارد نشده‌اید. لطفا به صفحه ورود بروید.</p>
        </div>
      )}
    </div>
  );
}