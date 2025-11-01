// File: frontend/src/lib/api/auth.ts
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
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  phone: string;
  national_id: string;
  country?: string;
  city?: string;
  date_of_birth?: string | null;
  gender?: string | null;
  address?: string | null;
  postal_code?: string | null;
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
  user?: any;
  admin?: any;
}

export interface RegisterResponse {
  message: string;
  user_id: number;
  email: string;
  role?: string;
  is_admin?: boolean;
  requires_approval?: boolean;
  requires_verification?: boolean;
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

// تابع اصلی ثبت‌نام کاربر
export async function registerUser(userData: RegisterFormData): Promise<RegisterResponse> {
  console.log('📤 ارسال داده‌های ثبت‌نام به سرور:', userData);

  // تشخیص خودکار نقش از ایمیل
  const { isAdmin, role } = AuthUtils.detectUserRole(userData.email);
  console.log(`🔍 تشخیص نقش: ${isAdmin ? 'ادمین' : 'کاربر'} - ${role}`);

  // تبدیل داده‌ها به فرمت API
  const requestData = RegisterDataTransformer.toAPI(userData);
  
  // تنظیم username اگر وجود ندارد
  if (!requestData.username) {
    requestData.username = userData.email.split('@')[0] + '_' + Math.random().toString(36).substr(2, 5);
  }

  console.log('📦 داده‌های تبدیل شده برای سرور:', requestData);

  return handleApiRequest('http://localhost:8000/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestData),
  });
}

// تابع ثبت‌نام ادمین (برای استفاده در پنل مدیریت)
export async function registerAdmin(adminData: AdminRegisterFormData, token: string): Promise<RegisterResponse> {
  console.log('📤 ارسال داده‌های ثبت‌نام ادمین به سرور:', adminData);

  // تبدیل داده‌ها به فرمت API
  const requestData = RegisterDataTransformer.adminToAPI(adminData);
  
  // تنظیم username اگر وجود ندارد
  if (!requestData.username) {
    requestData.username = adminData.email.split('@')[0] + '_admin';
  }

  console.log('📦 داده‌های ادمین تبدیل شده:', requestData);

  return handleApiRequest('http://localhost:8000/api/admin/register-admin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(requestData),
  });
}

// تابع لاگین کاربر معمولی
export async function loginUser(credentials: LoginFormData): Promise<AuthResponse> {
  console.log('📤 ارسال داده‌های ورود به سرور:', credentials);

  const requestData: LoginRequest = {
    username: credentials.username,
    password: credentials.password,
  };

  return handleApiRequest('http://localhost:8000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
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

  return handleApiRequest('http://localhost:8000/api/auth/admin-login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestData),
  });
}

// تابع برای بررسی وضعیت توکن
export async function verifyToken(token: string): Promise<any> {
  return handleApiRequest('http://localhost:8000/api/auth/verify-token', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
}

// تابع برای بررسی دسترسی ادمین
export async function checkAdminAccess(token: string): Promise<any> {
  return handleApiRequest('http://localhost:8000/api/auth/admin/check-access', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
}

// تابع برای دریافت آمار سیستم
export async function getSystemStatus(token: string): Promise<any> {
  return handleApiRequest('http://localhost:8000/api/auth/system/status', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
}

// تابع برای دریافت لیست ادمین‌های در انتظار تأیید
export async function getPendingAdmins(token: string): Promise<any> {
  return handleApiRequest('http://localhost:8000/api/admin/pending-approvals', {
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

  return handleApiRequest('http://localhost:8000/api/admin/approve-admin', {
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
  return handleApiRequest('http://localhost:8000/api/admin/dashboard-stats', {
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