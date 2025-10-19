// File: frontend/src/lib/api/auth.ts
export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationalCode: string;
  password: string;
  confirmPassword: string;
  countryCode: string;
  agreeToTerms: boolean;
  os?: string;
  latitude?: number;
  longitude?: number;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export async function registerUser(userData: RegisterFormData) {
  console.log('📤 ارسال داده‌های ثبت‌نام به سرور:', userData);

  const response = await fetch('http://localhost:8000/api/users/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: userData.email,
      email: userData.email,
      password: userData.password,
    }),
  });

  console.log('📥 پاسخ سرور - وضعیت:', response.status, response.statusText);

  if (!response.ok) {
    const errorData = await response.json();
    console.error('❌ خطای سرور:', errorData);
    throw new Error(errorData.detail || 'خطا در ثبت‌نام');
  }

  const result = await response.json();
  console.log('✅ پاسخ کامل سرور (ثبت‌نام):', JSON.stringify(result, null, 2));
  return result;
}

export async function loginUser(credentials: LoginFormData) {
  console.log('📤 ارسال داده‌های ورود به سرور:', credentials);

  const formData = new URLSearchParams();
  formData.append('username', credentials.email);
  formData.append('password', credentials.password);

  const response = await fetch('http://localhost:8000/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData,
  });

  console.log('📥 پاسخ سرور - وضعیت:', response.status, response.statusText);

  if (!response.ok) {
    const errorData = await response.json();
    console.error('❌ خطای سرور:', errorData);
    throw new Error(errorData.detail || 'خطا در ورود');
  }

  const result = await response.json();
  console.log('✅ پاسخ کامل سرور (ورود):', JSON.stringify(result, null, 2));
  return result;
}