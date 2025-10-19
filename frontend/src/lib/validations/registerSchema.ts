// File: frontend/src/lib/validations/registerSchema.ts
import { z } from 'zod';

export const registerSchema = z.object({
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
    .min(5, 'ایمیل باید حداقل ۵ کاراکتر باشد'),

  nationalCode: z
    .string()
    .length(10, 'کد ملی باید ۱۰ رقم باشد')
    .regex(/^\d+$/, 'کد ملی باید فقط شامل رقم باشد'),

  phone: z
    .string()
    .min(10, 'شماره تلفن باید حداقل ۱۰ رقم باشد')
    .regex(/^\d+$/, 'شماره تلفن باید فقط شامل رقم باشد'),

  countryCode: z.string(),

  password: z
    .string()
    .min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد')
    .regex(/[A-Z]/, 'رمز عبور باید شامل حداقل یک حرف بزرگ باشد')
    .regex(/[a-z]/, 'رمز عبور باید شامل حداقل یک حرف کوچک باشد')
    .regex(/\d/, 'رمز عبور باید شامل حداقل یک عدد باشد')
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'رمز عبور باید شامل حداقل یک علامت باشد'),

  confirmPassword: z.string(),
  
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: '必须同意条款和条件',
  }),

  os: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'رمز عبور و تکرار آن یکسان نیستند',
  path: ['confirmPassword'],
});

export type RegisterFormData = z.infer<typeof registerSchema>;