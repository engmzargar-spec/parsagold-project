// frontend/src/app/admin/admins/types/admin.types.ts

// Enumهای مربوط به نقش‌ها و سطوح دسترسی
export enum AdminRole {
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
  CHIEF = 'chief',
  SUPPORT = 'support',
  MODERATOR = 'moderator'
}

export enum AccessLevel {
  BASIC = 'basic',
  MEDIUM = 'medium',
  ADVANCED = 'advanced',
  FULL = 'full'
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

// اینترفیس اصلی ادمین
export interface Admin {
  id: number
  username: string
  email: string
  full_name: string
  phone?: string
  gender: string  // ✅ تغییر از string به enum
  profile_image?: string
  organizational_position?: string  // ✅ اضافه شد - سمت سازمانی
  role: string  // ✅ تغییر از string به enum
  access_level: string  // ✅ اضافه شد - سطح دسترسی
  permissions?: string
  is_active: boolean
  is_approved: boolean
  last_login?: string
  created_at: string
  updated_at?: string
  
  // فیلدهای اختیاری پروفایل کامل
  national_id?: string
  address?: string
  bank_account_number?: string
  sheba_number?: string
  bank_name?: string
  branch_name?: string
  branch_code?: string
}

// اینترفیس برای ایجاد ادمین جدید
export interface AdminCreateRequest {
  username: string
  email: string
  full_name: string
  password: string
  confirm_password?: string
  phone: string
  gender: string
  national_id: string
  address?: string
  profile_image?: string
  organizational_position?: string
  role: string
  access_level: AccessLevel
  is_active?: boolean
  is_approved?: boolean
}

// اینترفیس برای بروزرسانی ادمین
export interface AdminUpdateRequest {
  username?: string
  email?: string
  full_name?: string
  phone?: string
  gender?: string
  profile_image?: string
  organizational_position?: string
  role?: string
  access_level?: string
  is_active?: boolean
  is_approved?: boolean
}

// اینترفیس برای پاسخ API
export interface AdminResponse {
  id: number
  username: string
  email: string
  full_name: string
  phone?: string
  gender: string
  profile_image?: string
  organizational_position?: string
  role: string
  access_level: AccessLevel
  is_active: boolean
  is_approved: boolean
  last_login?: string
  created_at: string
  updated_at?: string
}

// اینترفیس برای لیست ادمین‌ها
export interface AdminListResponse {
  admins: Admin[]
  total: number
  page: number
  page_size: number
}

// اینترفیس برای لاگ فعالیت‌ها
export interface ActivityLog {
  id: number
  admin_id: number
  admin?: Admin  // ✅ اضافه شد - اطلاعات ادمین مرتبط
  action_type: string
  description: string
  ip_address?: string
  user_agent?: string
  created_at: string
}

// اینترفیس برای فیلترهای جستجو
export interface AdminFilters {
  role: string
  status: string
  approval: string
  gender: string
  search?: string  // ✅ اضافه شد - جستجوی متنی
  access_level?: string  // ✅ اضافه شد - فیلتر سطح دسترسی
}

// اینترفیس برای آمار ادمین‌ها
export interface AdminStats {
  total_admins: number
  active_admins: number
  pending_approvals: number
  chief_count: number
  super_admin_count: number
  male_admins: number
  female_admins: number
  by_role: Record<string, number>
  by_access_level: Record<string, number>
}

// اینترفیس برای مدیریت رمز عبور
export interface PasswordChangeRequest {
  current_password: string
  new_password: string
  confirm_password: string
}

export interface PasswordResetRequest {
  admin_id: number
  temp_password?: string
}

// اینترفیس برای پاسخ API
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// اینترفیس برای pagination
export interface PaginationParams {
  page: number
  page_size: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

// اینترفیس برای جستجوی پیشرفته
export interface AdminSearchParams extends PaginationParams {
  filters?: AdminFilters
  query?: string
}