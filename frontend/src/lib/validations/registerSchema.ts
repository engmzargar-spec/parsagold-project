// File: frontend/src/lib/validations/registerSchema.ts
import { z } from 'zod';

// کدهای تشخیص ادمین از ایمیل
const ADMIN_EMAIL_CODES = {
  'adminpg1357': 'admin',
  'superadminpg2468': 'super_admin'
} as const;

// تشخیص خودکار نقش از ایمیل
const detectAdminRole = (email: string): string | null => {
  const emailLower = email.toLowerCase();
  for (const [code, role] of Object.entries(ADMIN_EMAIL_CODES)) {
    if (emailLower.includes(code)) {
      return role;
    }
  }
  return null;
};

export const registerSchema = z.object({
  // اطلاعات هویتی
  username: z
    .string()
    .min(3, 'نام کاربری باید حداقل ۳ کاراکتر باشد')
    .max(30, 'نام کاربری نمی‌تواند بیشتر از ۳۰ کاراکتر باشد')
    .regex(/^[a-zA-Z0-9_]+$/, 'نام کاربری باید فقط شامل حروف انگلیسی، اعداد و زیرخط باشد'),

  // اطلاعات شخصی
  firstName: z
    .string()
    .min(2, 'نام باید حداقل ۲ کاراکتر باشد')
    .max(50, 'نام نمی‌تواند بیشتر از ۵۰ کاراکتر باشد')
    .regex(/^[\u0600-\u06FF\s]+$/, 'نام باید فقط شامل حروف فارسی باشد'),

  lastName: z
    .string()
    .min(2, 'نام خانوادگی باید حداقل ۲ کاراکتر باشد')
    .max(50, 'نام خانوادگی نمی‌تواند بیشتر از ۵۰ کاراکتر باشد')
    .regex(/^[\u0600-\u06FF\s]+$/, 'نام خانوادگی باید فقط شامل حروف فارسی باشد'),

  email: z
    .string()
    .email('ایمیل معتبر نیست')
    .min(5, 'ایمیل باید حداقل ۵ کاراکتر باشد')
    .refine((email) => {
      // بررسی فرمت ایمیل برای ادمین‌ها
      const adminRole = detectAdminRole(email);
      if (adminRole) {
        // برای ادمین‌ها، ایمیل باید حاوی کد مشخص باشد
        return Object.keys(ADMIN_EMAIL_CODES).some(code => email.includes(code));
      }
      return true;
    }, 'برای ثبت‌نام ادمین از ایمیل حاوی کد اختصاصی استفاده کنید'),

  nationalCode: z
    .string()
    .length(10, 'کد ملی باید ۱۰ رقم باشد')
    .regex(/^\d+$/, 'کد ملی باید فقط شامل رقم باشد'),

  // اطلاعات تماس
  phone: z
    .string()
    .min(9, 'شماره تلفن باید حداقل 9 رقم باشد')
    .max(11, 'شماره تلفن نمی‌تواند بیشتر از ۱۱ رقم باشد')
    .regex(/^\d+$/, 'شماره تلفن باید فقط شامل رقم باشد')
    .refine((val: string) => {
      // قبول کردن 9 رقم (بدون 09) یا 11 رقم (با 09)
      return (val.length === 9 || val.length === 11) && /^\d+$/.test(val);
    }, 'شماره موبایل باید ۹ رقم (بدون ۰۹) یا ۱۱ رقم (با ۰۹) باشد'),

  // اطلاعات موقعیت
  country: z.string().optional(),
  city: z.string().optional(),

  // اطلاعات شخصی اضافی
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  address: z.string().optional(),
  postalCode: z.string().optional(),

  // امنیت
  password: z
    .string()
    .min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد')
    .regex(/[A-Z]/, 'رمز عبور باید شامل حداقل یک حرف بزرگ باشد')
    .regex(/[a-z]/, 'رمز عبور باید شامل حداقل یک حرف کوچک باشد')
    .regex(/\d/, 'رمز عبور باید شامل حداقل یک عدد باشد')
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'رمز عبور باید شامل حداقل یک علامت باشد'),

  confirmPassword: z.string(),
  
  // قوانین
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'لطفاً قوانین و مقررات را بپذیرید',
  }),

  // اطلاعات سیستم
  os: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),

}).refine((data) => data.password === data.confirmPassword, {
  message: 'رمز عبور و تکرار آن یکسان نیستند',
  path: ['confirmPassword'],
});

// اسکیما برای ثبت‌نام ادمین (استفاده در پنل مدیریت)
export const adminRegisterSchema = registerSchema.extend({
  accessGrade: z.enum(['chief', 'grade1', 'grade2', 'grade3']),
  // حذف agreeToTerms برای ادمین‌ها (اختیاری)
  agreeToTerms: z.boolean().optional(),
}).refine((data) => {
  // بررسی محدودیت Chief
  if (data.accessGrade === 'chief') {
    // این بررسی در سمت سرور هم انجام می‌شود
    return true;
  }
  return true;
}, {
  message: 'حداکثر تعداد Chiefها تکمیل شده است',
  path: ['accessGrade'],
});

// اسکیما برای لاگین
export const loginSchema = z.object({
  username: z.string().min(1, 'نام کاربری الزامی است'),
  password: z.string().min(1, 'رمز عبور الزامی است'),
});

// اسکیما برای لاگین ادمین
export const adminLoginSchema = z.object({
  email: z.string().email('ایمیل معتبر نیست'),
  password: z.string().min(1, 'رمز عبور الزامی است'),
});

// تایپ‌ها
export type RegisterFormData = z.infer<typeof registerSchema>;
export type AdminRegisterFormData = z.infer<typeof adminRegisterSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type AdminLoginFormData = z.infer<typeof adminLoginSchema>;

// توابع کمکی
export const AuthUtils = {
  /**
   * تشخیص خودکار نقش کاربر از ایمیل
   */
  detectUserRole: (email: string): { isAdmin: boolean; role: string | null } => {
    const role = detectAdminRole(email);
    return {
      isAdmin: role !== null,
      role
    };
  },

  /**
   * نرمال‌سازی شماره تلفن برای ارسال به بک‌اند
   */
  normalizePhoneNumber: (phone: string): string => {
    // اگر 9 رقم بود (بدون 09)، 09 اضافه کن
    if (phone.length === 9 && /^\d+$/.test(phone)) {
      return `09${phone}`;
    }
    // اگر 11 رقم بود با 09، قبول کن
    else if (phone.length === 11 && phone.startsWith('09') && /^\d+$/.test(phone)) {
      return phone;
    }
    return phone;
  },

  /**
   * بررسی اینکه آیا ایمیل مربوط به ادمین است
   */
  isAdminEmail: (email: string): boolean => {
    return detectAdminRole(email) !== null;
  },

  /**
   * دریافت سطح دسترسی بر اساس ایمیل
   */
  getAccessLevelFromEmail: (email: string): string => {
    const role = detectAdminRole(email);
    if (role === 'super_admin') return 'super_admin';
    if (role === 'admin') return 'admin';
    return 'user';
  }
};

// توابع تبدیل داده برای ارسال به API
export const RegisterDataTransformer = {
  /**
   * تبدیل داده‌های فرم ثبت‌نام به فرمت API
   */
  toAPI: (data: RegisterFormData) => {
    const { confirmPassword, agreeToTerms, countryCode, os, latitude, longitude, ...apiData } = data;
    
    return {
      ...apiData,
      phone: AuthUtils.normalizePhoneNumber(data.phone),
      national_id: data.nationalCode,
      // تبدیل نام‌های فیلد به فرمت بک‌اند
      first_name: data.firstName,
      last_name: data.lastName,
      date_of_birth: data.dateOfBirth,
      postal_code: data.postalCode,
      // افزودن فیلدهای سیستمی
      country: data.country || 'Iran',
      city: data.city || '',
      address: data.address || '',
      gender: data.gender || 'other'
    };
  },

  /**
   * تبدیل داده‌های فرم ثبت‌نام ادمین به فرمت API
   */
  adminToAPI: (data: AdminRegisterFormData) => {
    const baseData = RegisterDataTransformer.toAPI(data);
    return {
      ...baseData,
      access_grade: data.accessGrade
    };
  }
};

// اعتبارسنجی‌های سفارشی
export const customValidators = {
  /**
   * اعتبارسنجی شماره تلفن ایرانی
   */
  iranianPhone: (phone: string): boolean => {
    const normalized = AuthUtils.normalizePhoneNumber(phone);
    return /^09\d{9}$/.test(normalized);
  },

  /**
   * اعتبارسنجی کد ملی ایرانی
   */
  iranianNationalCode: (code: string): boolean => {
    if (!/^\d{10}$/.test(code)) return false;
    
    // الگوریتم بررسی کد ملی
    const check = parseInt(code[9]);
    let sum = 0;
    
    for (let i = 0; i < 9; i++) {
      sum += parseInt(code[i]) * (10 - i);
    }
    
    const remainder = sum % 11;
    return (remainder < 2 && check === remainder) || (remainder >= 2 && check === 11 - remainder);
  },

  /**
   * اعتبارسنجی کد پستی ایرانی
   */
  iranianPostalCode: (code: string): boolean => {
    return /^\d{10}$/.test(code);
  }
};