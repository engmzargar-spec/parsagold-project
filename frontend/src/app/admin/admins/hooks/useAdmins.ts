// frontend/src/app/admin/admins/hooks/useAdmins.ts
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Admin,
  AdminFilters,
  AdminRole,
  AdminUpdateRequest,
  AdminCreateRequest,
  AdminResponse
} from '../types/admin.types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const useAdmins = () => {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [currentAdmin, setCurrentAdmin] = useState<any>(null)
  const router = useRouter()

  const getCurrentAdmin = () => {
    try {
      const adminData = localStorage.getItem('admin_user')
      if (adminData) {
        return JSON.parse(adminData)
      }
    } catch (e) {
      console.error('❌ خطا در خواندن admin_user:', e)
    }
    return null
  }

  const loadAdmins = async (searchQuery: string = '', filters?: AdminFilters) => {
    console.log('🟡 loadAdmins started')
    const currentAdminData = getCurrentAdmin()

    if (!currentAdminData || (currentAdminData.role !== 'chief' && currentAdminData.role !== 'super_admin')) {
      console.warn('⛔ دسترسی غیرمجاز برای مشاهده لیست ادمین‌ها')
      setError('شما مجوز مشاهده لیست ادمین‌ها را ندارید')
      setLoading(false)
      return
    }

    await fetchAdmins(searchQuery, filters)
  }

  const fetchAdmins = async (searchQuery: string = '', filters?: AdminFilters) => {
    setLoading(true)
    setError('')
    const token = localStorage.getItem('admin_token')
    const currentAdminData = getCurrentAdmin()

    if (!token) {
      setError('لطفاً مجدداً وارد شوید')
      setLoading(false)
      return
    }

    try {
      let url = `${API_BASE_URL}/api/admin/admins`
      const params = new URLSearchParams()

      if (searchQuery) params.append('search', searchQuery)
      if (filters?.role && filters.role !== 'all') params.append('role', filters.role)
      if (filters?.status && filters.status !== 'all') {
        params.append('is_active', filters.status === 'active' ? 'true' : 'false')
      }
      if (filters?.approval && filters.approval !== 'all') {
        params.append('is_approved', filters.approval === 'approved' ? 'true' : 'false')
      }
      if (filters?.gender && filters.gender !== 'all') params.append('gender', filters.gender)
      if (filters?.access_level && filters.access_level !== 'all') params.append('access_level', filters.access_level)

      if (params.toString()) url += `?${params.toString()}`

      console.log('📡 ارسال درخواست به:', url)

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('admin_token')
          localStorage.removeItem('admin_user')
          setError('لطفاً مجدداً وارد شوید')
        } else if (response.status === 403) {
          setError('شما دسترسی لازم برای مشاهده ادمین‌ها را ندارید')
        } else {
          const errorData = await response.json()
          setError(errorData.detail || 'خطا در دریافت اطلاعات')
        }
        setLoading(false)
        return
      }

      const data = await response.json()
      const adminsData = Array.isArray(data.admins) ? data.admins : []

      console.log('✅ تعداد ادمین‌های دریافتی:', adminsData.length)

      if (adminsData.length === 0) {
        setError('هیچ ادمینی در سیستم تعریف نشده است')
      }

      if (currentAdminData?.role !== 'chief') {
        adminsData.forEach(admin => {
          admin.national_id = undefined
          admin.phone = admin.phone ? '***' + admin.phone.slice(-3) : undefined
          admin.bank_account_number = undefined
          admin.sheba_number = undefined
          admin.address = undefined
        })
      }

      setAdmins(adminsData)
      setCurrentAdmin(currentAdminData)
    } catch (error: any) {
      console.error('❌ خطا در دریافت اطلاعات:', error)
      setError(error.message || 'خطا در دریافت اطلاعات ادمین‌ها')
    } finally {
      setLoading(false)
    }
  }

  const verifyPassword = async (password: string): Promise<boolean> => {
    console.log('🔐 verifyPassword called')
    return true
  }

  const canModifyAdmin = (targetAdminRole: string): boolean => {
    const currentAdminData = getCurrentAdmin()
    const currentRole = currentAdminData?.role
    if (currentRole === 'chief') return true
    if (currentRole === 'super_admin' && targetAdminRole === 'admin') return true
    return false
  }

  const createAdmin = async (adminData: AdminCreateRequest) => {
    return { success: true, message: 'ادمین با موفقیت ایجاد شد (نمونه)' }
  }

  const updateAdmin = async (adminId: number, adminData: AdminUpdateRequest) => {
    return { success: true, message: 'اطلاعات ادمین با موفقیت بروزرسانی شد (نمونه)' }
  }

  const approveAdmin = async (adminId: number) => {
    return { success: true, message: 'ادمین با موفقیت تأیید شد (نمونه)' }
  }

  const resetAdminPassword = async (adminId: number) => {
    return { success: true, message: 'رمز عبور با موفقیت ریست شد (نمونه)', temp_password: 'temp123' }
  }

  return {
    admins,
    loading,
    error,
    currentAdmin,
    fetchAdmins,
    createAdmin,
    updateAdmin,
    approveAdmin,
    resetAdminPassword,
    verifyPassword,
    canModifyAdmin,
    loadAdmins
  }
}
