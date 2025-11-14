// frontend/src/lib/api/config.ts
// تعیین پورت بر اساس محیط اجرا
const getApiPort = (): string => {
  // اول از متغیر محیطی بخون
  if (process.env.NEXT_PUBLIC_API_PORT) {
    return process.env.NEXT_PUBLIC_API_PORT;
  }
  
  // در حالت توسعه، پورت پیش‌فرض 8000
  if (process.env.NODE_ENV === 'development') {
    return '8000';
  }
  
  // در حالت production، پورت پیش‌فرض 8000
  return '8000';
};

const API_PORT = getApiPort();
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || `http://localhost:${API_PORT}`;

export const API_CONFIG = {
  BASE_URL: `${API_BASE_URL}/api`,
  BASE_URL_NO_API: API_BASE_URL, // برای endpointهایی که /api ندارند
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  PORT: API_PORT
};

// فقط در حالت development لاگ کنیم
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 تنظیمات API:', {
    baseUrl: API_CONFIG.BASE_URL,
    port: API_CONFIG.PORT,
    environment: process.env.NODE_ENV
  });
}