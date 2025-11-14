// File: frontend/src/lib/api/auth.ts
import { API_CONFIG } from './config';
import { 
  RegisterFormData, 
  AdminRegisterFormData,
  LoginFormData, 
  AdminLoginFormData,
  AuthUtils,
  RegisterDataTransformer 
} from '../validations/registerSchema';

// اینترفیس‌های API
export interface RegisterRequest {
  phone: string;
  password: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface AdminRegisterRequest extends RegisterRequest {
  access_grade: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  refresh_token?: string;
  user_type?: string;
  user?: any;
  admin?: any;
}

// تابع کمکی برای مدیریت درخواست‌های API
async function handleApiRequest(url: string, options: RequestInit) {
  console.log('📤 ارسال درخواست به:', url, options);

  try {
    const response = await fetch(url, options);
    console.log('📥 پاسخ سرور - وضعیت:', response.status, response.statusText);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
        console.error('❌ خطای سرور:', errorData);
        
        // مدیریت خطاهای مختلف
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            // خطاهای validation
            const errorMessages = errorData.detail.map((err: any) => 
              `${err.loc?.join('.')}: ${err.msg}`
            ).join(', ');
            throw new Error(`خطاهای اعتبارسنجی: ${errorMessages}`);
          } else {
            // خطای ساده
            throw new Error(errorData.detail);
          }
        } else {
          throw new Error(`خطا در درخواست (کد: ${response.status})`);
        }
      } catch (parseError) {
        console.error('❌ خطا در پردازش پاسخ سرور:', parseError);
        throw new Error('خطا در ارتباط با سرور');
      }
    }

    const result = await response.json();
    console.log('✅ درخواست موفق - پاسخ:', result);
    return result;

  } catch (error) {
    console.error('❌ خطای شبکه:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('خطای شبکه در ارتباط با سرور');
  }
}

// تابع اصلی ثبت‌نام کاربر با شماره موبایل
export async function registerUser(userData: RegisterFormData): Promise<AuthResponse> {
  console.log('📤 ارسال داده‌های ثبت‌نام به سرور:', userData);

  // استفاده از config مرکزی
  return handleApiRequest(`${API_CONFIG.BASE_URL}/auth/quick-register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      phone: userData.phone,
      password: userData.password,
    }),
  });
}

// تابع لاگین کاربر معمولی با شماره موبایل
export async function loginUser(credentials: LoginFormData): Promise<AuthResponse> {
  console.log('📤 ارسال داده‌های ورود به سرور:', credentials);

  // استفاده از شماره موبایل به عنوان username برای بک‌اند
  const requestData: LoginRequest = {
    username: credentials.phone,
    password: credentials.password,
  };

  // استفاده از config مرکزی
  return handleApiRequest(`${API_CONFIG.BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(requestData as any),
  });
}

// تابع ثبت‌نام ادمین (برای استفاده در پنل مدیریت)
export async function registerAdmin(adminData: AdminRegisterFormData, token: string): Promise<AuthResponse> {
  console.log('📤 ارسال داده‌های ثبت‌نام ادمین به سرور:', adminData);

  const requestData: AdminRegisterRequest = {
    phone: adminData.phone,
    password: adminData.password,
    first_name: adminData.first_name,
    last_name: adminData.last_name,
    email: adminData.email,
    access_grade: adminData.access_grade || 'admin',
  };

  console.log('📦 داده‌های ادمین تبدیل شده:', requestData);

  // استفاده از config مرکزی
  return handleApiRequest(`${API_CONFIG.BASE_URL}/admin/register-admin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(requestData),
  });
}

// تابع لاگین ادمین
export async function adminLogin(credentials: AdminLoginFormData): Promise<AuthResponse> {
  console.log('📤 ارسال داده‌های ورود ادمین به سرور:', credentials);

  const requestData: AdminLoginRequest = {
    email: credentials.email,
    password: credentials.password,
  };

  // استفاده از config مرکزی
  return handleApiRequest(`${API_CONFIG.BASE_URL}/auth/admin-login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestData),
  });
}

// تابع برای بررسی وضعیت توکن
export async function verifyToken(token: string): Promise<any> {
  // استفاده از config مرکزی
  return handleApiRequest(`${API_CONFIG.BASE_URL}/auth/verify-token`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
}

// تابع برای بررسی دسترسی ادمین
export async function checkAdminAccess(token: string): Promise<any> {
  // استفاده از config مرکزی
  return handleApiRequest(`${API_CONFIG.BASE_URL}/auth/admin/check-access`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
}

// تابع برای دریافت آمار سیستم
export async function getSystemStatus(token: string): Promise<any> {
  // استفاده از config مرکزی
  return handleApiRequest(`${API_CONFIG.BASE_URL}/auth/system/status`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
}

// تابع برای دریافت لیست ادمین‌های در انتظار تأیید
export async function getPendingAdmins(token: string): Promise<any> {
  // استفاده از config مرکزی
  return handleApiRequest(`${API_CONFIG.BASE_URL}/admin/pending-approvals`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
}

// تابع برای تأیید ادمین
export async function approveAdmin(adminId: number, action: string, token: string, notes?: string): Promise<any> {
  const requestData = {
    admin_id: adminId,
    action: action,
    notes: notes || ''
  };

  // استفاده از config مرکزی
  return handleApiRequest(`${API_CONFIG.BASE_URL}/admin/approve-admin`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestData),
  });
}

// تابع برای دریافت آمار داشبورد
export async function getDashboardStats(token: string): Promise<any> {
  // استفاده از config مرکزی
  return handleApiRequest(`${API_CONFIG.BASE_URL}/admin/dashboard-stats`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
}

// مدیریت توکن در localStorage
export const TokenManager = {
  setToken: (token: string): void => {
    localStorage.setItem('auth_token', token);
  },

  getToken: (): string | null => {
    return localStorage.getItem('auth_token');
  },

  removeToken: (): void => {
    localStorage.removeItem('auth_token');
  },

  setAdminToken: (token: string): void => {
    localStorage.setItem('admin_token', token);
  },

  getAdminToken: (): string | null => {
    return localStorage.getItem('admin_token');
  },

  removeAdminToken: (): void => {
    localStorage.removeItem('admin_token');
  }
};

// تشخیص نوع کاربر از توکن
export const UserTypeDetector = {
  isAdminUser: (user: any): boolean => {
    return user && user.role && ['admin', 'super_admin'].includes(user.role);
  },

  isSuperAdmin: (user: any): boolean => {
    return user && user.role === 'super_admin';
  },

  isChiefAdmin: (user: any): boolean => {
    return user && user.access_grade === 'chief';
  },

  getUserType: (user: any): string => {
    if (!user) return 'user';
    
    if (user.role === 'super_admin') return 'super_admin';
    if (user.role === 'admin' && user.access_grade === 'chief') return 'chief';
    if (user.role === 'admin') return 'admin';
    
    return 'user';
  }
};

// مدیریت خطاهای احراز هویت
export class AuthError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

// تابع برای مدیریت خطاهای خاص
export const handleAuthError = (error: any): string => {
  console.error('🔐 خطای احراز هویت:', error);

  if (error instanceof AuthError) {
    return error.message;
  }

  if (error.message?.includes('شماره موبایل')) {
    return 'شماره موبایل معتبر نیست';
  }

  if (error.message?.includes('کد ملی')) {
    return 'کد ملی معتبر نیست';
  }

  if (error.message?.includes('ایمیل')) {
    return 'ایمیل معتبر نیست یا قبلاً ثبت شده است';
  }

  if (error.message?.includes('رمز عبور')) {
    return 'رمز عبور معتبر نیست';
  }

  if (error.message?.includes('کاربر با این')) {
    return error.message;
  }

  if (error.message?.includes('دسترسی غیرمجاز')) {
    return 'شما دسترسی لازم برای این عمل را ندارید';
  }

  if (error.message?.includes('حساب کاربری غیرفعال')) {
    return 'حساب کاربری شما غیرفعال است. لطفاً با پشتیبانی تماس بگیرید.';
  }

  return 'خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.';
};