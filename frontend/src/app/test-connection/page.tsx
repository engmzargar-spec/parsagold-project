// frontend/src/app/test-connection/page.tsx
'use client';

import { useEffect } from 'react';
import { API_CONFIG } from '../../lib/api/config';    // ✅ مسیر درست

export default function TestConnection() {
  useEffect(() => {
    console.log('API Base URL:', API_CONFIG.BASE_URL);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">تست اتصال به بک‌اند</h1>
      <p className="mt-4">API URL: {API_CONFIG.BASE_URL}</p>
      <p className="mt-2">برو به http://localhost:3000/test-connection و کنسول رو چک کن</p>
    </div>
  );
}