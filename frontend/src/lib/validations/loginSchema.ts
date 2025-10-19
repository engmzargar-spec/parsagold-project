// File: frontend/src/lib/validations/loginSchema.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .email('ایمیل معتبر نیست')
    .min(5, 'ایمیل باید حداقل ۵ کاراکتر باشد'),

  password: z
    .string()
    .min(1, 'رمز عبور الزامی است'),
});

export type LoginFormData = z.infer<typeof loginSchema>;