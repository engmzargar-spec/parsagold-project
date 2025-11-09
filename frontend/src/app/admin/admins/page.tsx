// frontend/src/app/admin/admins/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Admin, AdminFilters, AccessLevel } from './types/admin.types'
import { useAdmins } from './hooks/useAdmins'
import { AdminTable } from './components/AdminTable/AdminTable'
import { AdminEditModal } from './components/AdminModals/AdminEditModal'
import { AdminDetailModal } from './components/AdminModals/AdminDetailModal'

export default function AdminsManagement() {
  console.log('🔴 AdminsManagement component rendered')
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<AdminFilters>({
    role: 'all',
    status: 'all',
    approval: 'all',
    gender: 'all',
    access_level: 'all'
  })
  const [searchField, setSearchField] = useState('all')
  
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showAdminDetailModal, setShowAdminDetailModal] = useState(false)
  const [showActivityLogModal, setShowActivityLogModal] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null)
  const [activityLogs, setActivityLogs] = useState<any[]>([])
  const [password, setPassword] = useState('')
  const [currentAction, setCurrentAction] = useState<{type: string, admin?: Admin} | null>(null)
  const [profileImage, setProfileImage] = useState<File | null>(null)

  const {
    admins,
    loading,
    error,
    currentAdmin,
    fetchAdmins,
    verifyPassword,
    canModifyAdmin,
    loadAdmins
  } = useAdmins()

  const router = useRouter()
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  // ✅ useEffect اصلاح شده - بدون infinite loop
  useEffect(() => {
    console.log('🟡 useEffect triggered - checking authentication')
    
    // بررسی مستقیم localStorage
    const token = localStorage.getItem('admin_token')
    const userData = localStorage.getItem('admin_user')
    
    console.log('🔐 Direct localStorage check - Token:', !!token, 'User:', !!userData)
    
    if (!token || !userData) {
      console.log('❌ Missing token or user data, redirecting to login')
      router.push('/admin/login')
      return
    }
    
    try {
      const user = JSON.parse(userData)
      console.log('✅ User parsed successfully, role:', user.role)
      
      // بررسی دسترسی
      if (user.role !== 'chief' && user.role !== 'super_admin') {
        console.log('❌ User does not have permission, redirecting to dashboard')
        router.push('/admin/dashboard')
        return
      }
      
      console.log('✅ User has permission, loading admins...')
      loadAdmins() // ✅ استفاده از loadAdmins
    } catch (error) {
      console.error('❌ Error parsing user data:', error)
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
      router.push('/admin/login')
    }
  }, [router]) // ✅ فقط router در dependency array

  // دیباگ stateهای مودال
  useEffect(() => {
    console.log('🔍 Modal States:', {
      showEditModal,
      editingAdmin: editingAdmin?.full_name,
      showCreateModal,
      showPasswordModal,
      showAdminDetailModal
    })
  }, [showEditModal, editingAdmin, showCreateModal, showPasswordModal, showAdminDetailModal])

  // 🔐 اعتبارسنجی رمز عبور - نسخه اصلاح شده
const handleVerifyPassword = async (): Promise<boolean> => {
  console.log('🟡 handleVerifyPassword called')
  
  // 🚨 غیرفعال کردن bypass موقت
  const tempBypass = false // ✅ تغییر از true به false
  
  if (tempBypass) {
    console.log('✅ TEMPORARY BYPASS: Password verification skipped')
    setPassword('')
    setShowPasswordModal(false)
    return true
  }

  try {
    const isVerified = await verifyPassword(password)
    console.log('🔐 Password verification result:', isVerified)
    if (isVerified) {
      setPassword('')
      setShowPasswordModal(false)
      return true
    } else {
      alert('رمز عبور اشتباه است')
      setPassword('') // پاک کردن فیلد رمز
      return false
    }
  } catch (error) {
    console.error('❌ Error verifying password:', error)
    alert('خطا در اعتبارسنجی رمز عبور')
    setPassword('') // پاک کردن فیلد رمز
    return false
  }
}

  // 🎯 شروع عملیات با درخواست رمز عبور
  const startActionWithAuth = (type: string, admin?: Admin) => {
    console.log('🎯 startActionWithAuth called:', { type, admin: admin?.full_name })
    setCurrentAction({ type, admin })
    setShowPasswordModal(true)
  }

  // 🔄 اجرای عملیات پس از تأیید رمز
  const executeAction = async () => {
    console.log('🟡 executeAction called with:', currentAction)
    if (!currentAction) {
      console.log('❌ No current action found')
      return
    }

    const isVerified = await handleVerifyPassword()
    console.log('🔐 executeAction - password verified:', isVerified)
    
    if (!isVerified) {
      console.log('❌ Password verification failed')
      return
    }

    console.log('✅ Password verified, executing action:', currentAction.type)

    switch (currentAction.type) {
      case 'edit':
        if (currentAction.admin) {
          console.log('🔄 Setting editing admin:', currentAction.admin.full_name)
          setEditingAdmin(currentAction.admin)
          setShowEditModal(true)
        }
        break
      case 'create':
        console.log('🔄 Opening create modal')
        setShowCreateModal(true)
        break
    }
    
    setCurrentAction(null)
  }

  // 📱 نمایش اطلاعات کامل ادمین
  const showAdminDetails = (admin: Admin) => {
    console.log('🎯 showAdminDetails called with:', admin.full_name)
    setSelectedAdmin(admin)
    setShowAdminDetailModal(true)
  }

  // 📊 نمایش تاریخچه فعالیت
  const showActivityHistory = async (admin: Admin) => {
    console.log('🎯 showActivityHistory called with:', admin.full_name)
    setSelectedAdmin(admin)
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`${API_BASE_URL}/api/management/activity-logs/${admin.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setActivityLogs(data.logs || [])
      } else {
        setActivityLogs([])
      }
    } catch (error) {
      console.error('❌ Error fetching activity logs:', error)
      setActivityLogs([])
    }
    setShowActivityLogModal(true)
  }

  // ✏️ ویرایش ادمین
  const handleEditAdmin = (admin: Admin) => {
    console.log('🎯 handleEditAdmin called with:', admin.full_name)
    startActionWithAuth('edit', admin)
  }

  // 🔍 جستجو
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🔍 handleSearch called with term:', searchTerm)
    fetchAdmins(searchTerm, filters)
  }

  // 🔄 فیلترها
  const handleFilterChange = () => {
    console.log('🔄 handleFilterChange called with filters:', filters)
    fetchAdmins(searchTerm, filters)
  }

  // 🎯 مدیریت رویداد کلید Enter در مودال رمز عبور
  const handlePasswordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      console.log('↵ Enter key pressed in password modal')
      executeAction()
    }
  }

  // 📁 مدیریت آپلود عکس
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('لطفاً فقط فایل تصویری انتخاب کنید')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('حجم فایل نباید بیشتر از 5 مگابایت باشد')
        return
      }
      setProfileImage(file)
    }
  }

  // 📊 خروجی اکسل
  const exportToExcel = () => {
    console.log('📊 exportToExcel called')
    const csvContent = "data:text/csv;charset=utf-8," 
      + "نام کامل,نام کاربری,ایمیل,نقش,سطح دسترسی,سمت سازمانی,وضعیت,تأیید,جنسیت,تلفن,تاریخ ایجاد\n"
      + admins.map(admin => 
          `"${admin.full_name}","${admin.username}","${admin.email}","${admin.role}","${getAccessLevelText(admin.access_level)}","${admin.organizational_position || ''}","${admin.is_active ? 'فعال' : 'غیرفعال'}","${admin.is_approved ? 'تأیید شده' : 'در انتظار'}","${getGenderText(admin.gender)}","${admin.phone}","${formatDate(admin.created_at)}"`
        ).join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "admins_list.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // ✅ تأیید ادمین
  const handleApproveAdmin = async (adminId: number) => {
    console.log('✅ handleApproveAdmin called for adminId:', adminId)
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`${API_BASE_URL}/api/management/approve-admin/${adminId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const result = await response.json()
        fetchAdmins(searchTerm, filters)
        setShowAdminDetailModal(false)
        alert(result.message || 'ادمین با موفقیت تأیید شد')
      } else {
        const errorData = await response.json()
        alert(errorData.detail || 'خطا در تأیید ادمین')
      }
    } catch (error) {
      console.error('❌ Error approving admin:', error)
      alert('خطا در تأیید ادمین')
    }
  }

  // 🆕 ایجاد ادمین جدید
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🆕 handleCreateAdmin called')
    const formData = new FormData(e.target as HTMLFormElement)
    
    try {
      const token = localStorage.getItem('admin_token')
      const adminData = {
        username: formData.get('username') as string,
        email: formData.get('email') as string,
        full_name: formData.get('full_name') as string,
        gender: formData.get('gender') as string,
        phone: formData.get('phone') as string,
        national_id: formData.get('national_id') as string,
        address: formData.get('address') as string,
        bank_account_number: formData.get('bank_account_number') as string,
        sheba_number: formData.get('sheba_number') as string,
        bank_name: formData.get('bank_name') as string,
        branch_name: formData.get('branch_name') as string,
        branch_code: formData.get('branch_code') as string,
        role: formData.get('role') as string,
        password: formData.get('password') as string
      }

      console.log('📦 Sending create admin request:', adminData)

      const response = await fetch(`${API_BASE_URL}/api/management/create-admin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(adminData)
      })

      if (response.ok) {
        const result = await response.json()
        alert('ادمین جدید با موفقیت ایجاد شد')
        setShowCreateModal(false)
        fetchAdmins(searchTerm, filters)
      } else {
        const errorData = await response.json()
        alert(errorData.detail || 'خطا در ایجاد ادمین')
      }
    } catch (error) {
      console.error('❌ Error creating admin:', error)
      alert('خطا در ایجاد ادمین جدید')
    }
  }

  // ✏️ به‌روزرسانی ادمین
  const handleUpdateAdmin = async (adminData: any) => {
    console.log('✏️ handleUpdateAdmin called with data:', adminData)
    if (!editingAdmin) {
      console.log('❌ No editing admin found')
      return
    }

    try {
      const token = localStorage.getItem('admin_token')

      console.log('📦 Sending update request:', adminData)

      // آپلود عکس اگر انتخاب شده
      if (profileImage) {
        const imageFormData = new FormData()
        imageFormData.append('profile_image', profileImage)
        
        const imageResponse = await fetch(`${API_BASE_URL}/api/management/upload-profile-image/${editingAdmin.id}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: imageFormData
        })

        if (!imageResponse.ok) {
          throw new Error('خطا در آپلود عکس')
        }
      }

      // استفاده از endpoint اصلی update-admin
      const response = await fetch(`${API_BASE_URL}/api/management/update-admin/${editingAdmin.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(adminData)
      })

      if (response.ok) {
        const result = await response.json()
        setShowEditModal(false)
        setEditingAdmin(null)
        setProfileImage(null)
        fetchAdmins(searchTerm, filters)
        alert('اطلاعات با موفقیت به روز شد')
      } else {
        const errorData = await response.json()
        alert(errorData.detail || 'خطا در ویرایش اطلاعات')
      }
    } catch (error) {
      console.error('❌ Error updating admin:', error)
      alert('خطا در ویرایش اطلاعات ادمین')
    }
  }

  // 🎯 Helper Functions
  const getRoleBadge = (role: string) => {
    const config: { [key: string]: { color: string, text: string } } = {
      chief: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', text: 'مدیر ارشد' },
      super_admin: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', text: 'سوپر ادمین' },
      admin: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', text: 'ادمین' }
    }

    const roleConfig = config[role] || { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200', text: role }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleConfig.color}`}>
        {roleConfig.text}
      </span>
    )
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs font-medium">فعال</span>
    ) : (
      <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full text-xs font-medium">غیرفعال</span>
    )
  }

  const getApprovalBadge = (isApproved: boolean) => {
    return isApproved ? (
      <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs font-medium">تأیید شده</span>
    ) : (
      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full text-xs font-medium">در انتظار تأیید</span>
    )
  }

  // ✅ تابع جدید برای نمایش سطح دسترسی
  const getAccessLevelBadge = (accessLevel: string) => {
    const config: { [key: string]: { color: string, text: string } } = {
      full: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', text: 'دسترسی کامل' },
      advanced: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', text: 'پیشرفته' },
      medium: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', text: 'متوسط' },
      basic: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200', text: 'پایه' }
    }

    const levelConfig = config[accessLevel] || { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200', text: accessLevel }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${levelConfig.color}`}>
        {levelConfig.text}
      </span>
    )
  }

  // ✅ تابع جدید برای متن سطح دسترسی
  const getAccessLevelText = (accessLevel: string) => {
    const config: { [key: string]: string } = {
      full: 'دسترسی کامل',
      advanced: 'پیشرفته',
      medium: 'متوسط',
      basic: 'پایه'
    }
    return config[accessLevel] || accessLevel
  }

  const getGenderText = (gender: string) => {
    return gender === 'MALE' ? 'مرد' : gender === 'FEMALE' ? 'زن' : 'نامشخص'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR')
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('fa-IR')
  }

  const isChiefAdmin = currentAdmin?.role === 'chief'
  const isSuperAdmin = currentAdmin?.role === 'super_admin'

  console.log('🔍 Current state:', {
    adminsCount: admins.length,
    loading,
    error,
    currentAdmin,
    showAdminDetailModal,
    showEditModal,
    showPasswordModal
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* هدر */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">مدیریت ادمین‌ها</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {admins.length} ادمین در سیستم
          </p>
        </div>
        <div className="flex gap-3">
          {/* 🆕 دکمه ایجاد ادمین جدید */}
          {isChiefAdmin && (
            <button
              onClick={() => startActionWithAuth('create')}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors font-medium text-white flex items-center gap-2"
            >
              <span>+</span>
              ایجاد ادمین جدید
            </button>
          )}
          <button
            onClick={exportToExcel}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors font-medium text-white flex items-center gap-2"
          >
            <span>📊</span>
            خروجی اکسل
          </button>
          <Link
            href="/admin/dashboard"
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
          >
            بازگشت به داشبورد
          </Link>
        </div>
      </div>

      {/* نمایش خطا */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-200 p-4 rounded-lg mb-6">
          <div className="flex justify-between items-center">
            <div>
              <strong>خطا:</strong> {error}
            </div>
            <button
              onClick={() => fetchAdmins()}
              className="bg-red-200 dark:bg-red-700 hover:bg-red-300 dark:hover:bg-red-600 px-4 py-2 rounded transition-colors"
            >
              تلاش مجدد
            </button>
          </div>
        </div>
      )}

      {/* فیلترها و جستجو */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
          {/* فیلتر نقش */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نقش</label>
            <select
              value={filters.role}
              onChange={(e) => {
                setFilters(prev => ({...prev, role: e.target.value}))
                setTimeout(handleFilterChange, 100)
              }}
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white"
            >
              <option value="all">همه نقش‌ها</option>
              <option value="chief">مدیر ارشد</option>
              <option value="super_admin">سوپر ادمین</option>
              <option value="admin">ادمین</option>
            </select>
          </div>

          {/* فیلتر وضعیت */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">وضعیت</label>
            <select
              value={filters.status}
              onChange={(e) => {
                setFilters(prev => ({...prev, status: e.target.value}))
                setTimeout(handleFilterChange, 100)
              }}
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white"
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="active">فعال</option>
              <option value="inactive">غیرفعال</option>
            </select>
          </div>

          {/* فیلتر تأیید */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">تأیید</label>
            <select
              value={filters.approval}
              onChange={(e) => {
                setFilters(prev => ({...prev, approval: e.target.value}))
                setTimeout(handleFilterChange, 100)
              }}
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white"
            >
              <option value="all">همه</option>
              <option value="approved">تأیید شده</option>
              <option value="pending">در انتظار</option>
            </select>
          </div>

          {/* فیلتر جنسیت */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">جنسیت</label>
            <select
              value={filters.gender}
              onChange={(e) => {
                setFilters(prev => ({...prev, gender: e.target.value}))
                setTimeout(handleFilterChange, 100)
              }}
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white"
            >
              <option value="all">همه</option>
              <option value="MALE">مرد</option>
              <option value="FEMALE">زن</option>
            </select>
          </div>

          {/* ✅ فیلتر جدید: سطح دسترسی */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">سطح دسترسی</label>
            <select
              value={filters.access_level}
              onChange={(e) => {
                setFilters(prev => ({...prev, access_level: e.target.value}))
                setTimeout(handleFilterChange, 100)
              }}
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white"
            >
              <option value="all">همه سطوح</option>
              <option value="full">دسترسی کامل</option>
              <option value="advanced">پیشرفته</option>
              <option value="medium">متوسط</option>
              <option value="basic">پایه</option>
            </select>
          </div>

          {/* فیلد جستجو */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">جستجو در</label>
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white mb-2"
            >
              <option value="all">همه فیلدها</option>
              <option value="full_name">نام کامل</option>
              <option value="username">نام کاربری</option>
              <option value="email">ایمیل</option>
              <option value="phone">تلفن</option>
              <option value="national_id">کد ملی</option>
              <option value="bank_account">شماره حساب</option>
              <option value="organizational_position">سمت سازمانی</option>
            </select>
          </div>
        </div>

        {/* فرم جستجو */}
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`جستجو در ${searchField === 'all' ? 'همه فیلدها' : searchField}...`}
            className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors font-medium text-white"
          >
            جستجو
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('')
              setFilters({
                role: 'all',
                status: 'all',
                approval: 'all',
                gender: 'all',
                access_level: 'all'
              })
              fetchAdmins()
            }}
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-6 py-3 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
          >
            بازنشانی
          </button>
        </form>
      </div>

      {/* جدول ادمین‌ها */}
      <AdminTable
        admins={admins}
        loading={loading}
        error={error}
        currentAdmin={currentAdmin}
        onShowDetails={showAdminDetails}
        onShowActivity={showActivityHistory}
        onEditAdmin={handleEditAdmin}
        onRetry={() => fetchAdmins(searchTerm, filters)}
        getRoleBadge={getRoleBadge}
        getStatusBadge={getStatusBadge}
        getApprovalBadge={getApprovalBadge}
        getGenderText={getGenderText}
        getAccessLevelBadge={getAccessLevelBadge}
        formatDate={formatDate}
        canModifyAdmin={canModifyAdmin}
      />

      {/* 🔐 مودال تأیید رمز عبور */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
              تأیید هویت
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              لطفاً رمز عبور خود را برای ادامه عملیات وارد کنید:
            </p>
            <form onSubmit={(e) => { e.preventDefault(); executeAction(); }}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handlePasswordKeyPress}
                placeholder="رمز عبور شما"
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white mb-4"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
                >
                  تأیید و ادامه
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false)
                    setPassword('')
                    setCurrentAction(null)
                  }}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg transition-colors"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✏️ مودال ویرایش ادمین */}
      <AdminEditModal
        admin={editingAdmin}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingAdmin(null)
        }}
        onSave={handleUpdateAdmin}
        currentAdmin={currentAdmin}
      />

      {/* 👁️ مودال مشاهده مشخصات کامل */}
      <AdminDetailModal
        admin={selectedAdmin}
        isOpen={showAdminDetailModal}
        onClose={() => {
          setShowAdminDetailModal(false)
          setSelectedAdmin(null)
        }}
        currentAdmin={currentAdmin}
        onApprove={handleApproveAdmin}
      />

    </div>
  )
}