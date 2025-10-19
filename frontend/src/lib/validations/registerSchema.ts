// فایل: lib/validations/registerSchema.ts
import { z } from 'zod';

export const registerSchema = z.object({
  firstName: z.string()
    .min(2, 'نام باید حداقل ۲ کاراکتر باشد')
    .regex(/^[\u0600-\u06FF\s]+$/, 'نام باید فقط شامل حروف فارسی باشد'),
  
  lastName: z.string()
    .min(2, 'نام خانوادگی باید حداقل ۲ کاراکتر باشد')
    .regex(/^[\u0600-\u06FF\s]+$/, 'نام خانوادگی باید فقط شامل حروف فارسی باشد'),
  
  email: z.string().email('ایمیل معتبر نیست'),
  
  nationalCode: z.string()
    .length(10, 'شماره ملی باید ۱۰ رقم باشد')
    .regex(/^\d+$/, 'شماره ملی باید فقط عدد باشد'),
  
  phone: z.string()
    .min(9, 'شماره تلفن معتبر نیست')
    .regex(/^\d+$/, 'شماره تلفن باید فقط عدد باشد'),
  
  password: z.string()
    .min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/, 
      'رمز عبور باید شامل حروف بزرگ، کوچک، عدد و علامت خاص باشد'),
  
  confirmPassword: z.string(),
  countryCode: z.string().default('+98'),
  acceptedTerms: z.boolean().refine(val => val === true, {
    message: 'لطفاً قوانین و مقررات را بپذیرید'
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: 'تکرار رمز عبور با رمز اصلی مطابقت ندارد',
  path: ['confirmPassword']
});

export type RegisterFormData = z.infer<typeof registerSchema>;