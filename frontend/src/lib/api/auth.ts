// فایل: lib/api/auth.ts
import { RegisterFormData } from '@/lib/validations/registerSchema';
import { RegisterResponse } from '@/types/auth';

export async function registerUser(data: any): Promise<RegisterResponse> {
  const response = await fetch('http://localhost:8000/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'خطا در ثبت‌نام');
  }

  return response.json();
}

// توابع کمکی برای بررسی تکراری نبودن داده‌ها
export async function checkEmail(email: string): Promise<boolean> {
  const response = await fetch(`http://localhost:8000/api/auth/check-email/${email}`);
  return response.ok;
}

export async function checkNationalCode(nationalCode: string): Promise<boolean> {
  const response = await fetch(`http://localhost:8000/api/auth/check-national-code/${nationalCode}`);
  return response.ok;
}

export async function checkPhone(phone: string): Promise<boolean> {
  const response = await fetch(`http://localhost:8000/api/auth/check-phone/${phone}`);
  return response.ok;
}