// frontend/src/app/admin/users/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: number
  username: string
  email: string
  phone: string
  first_name: string
  last_name: string
  national_id: string
  role: string
  is_active: boolean
  is_verified: boolean
  created_at: string
  country?: string
  city?: string
  gender?: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  useEffect(() => {
    checkAuthAndLoadUsers()
  }, [])

  const checkAuthAndLoadUsers = async () => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin/login')
      return
    }
    await fetchUsers()
  }

  const fetchUsers = async (searchQuery: string = '') => {
    try {
      setLoading(true)
      setError('')
      const token = localStorage.getItem('admin_token')
      
      if (!token) {
        router.push('/admin/login')
        return
      }

      // 🔧 اصلاح: حذف /api از URL
      let url = `${API_BASE_URL}/admin/users/`
      if (searchQuery) {
        url = `${API_BASE_URL}/admin/users/search?query=${encodeURIComponent(searchQuery)}`
      }

      console.log('🔄 Fetching users from:', url)

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('📡 Response status:', response.status)

      if (response.status === 401) {
        localStorage.removeItem('admin_token')
        router.push('/admin/login')
        return
      }

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Server error:', errorText)
        throw new Error(`خطا در سرور: ${response.status}`)
      }

      const usersData = await response.json()
      console.log('✅ Users loaded:', usersData.length)
      setUsers(usersData)
      
    } catch (error) {
      console.error('❌ Error fetching users:', error)
      setError('سرور در دسترس نیست. لطفاً از اجرا بودن بک‌اند مطمئن شوید.')
      // نمایش داده‌های نمونه برای تست رابط کاربری
      setUsers(getSampleUsers())
    } finally {
      setLoading(false)
    }
  }

  // داده‌های نمونه برای زمانی که بک‌اند در دسترس نیست
  const getSampleUsers = (): User[] => [
    {
      id: 1,
      username: "user1",
      email: "user1@example.com",
      phone: "09123456789",
      first_name: "علی",
      last_name: "محمدی",
      national_id: "0012345678",
      role: "user",
      is_active: true,
      is_verified: true,
      created_at: "2024-01-15T10:30:00",
      country: "ایران",
      city: "تهران",
      gender: "male"
    },
    {
      id: 2,
      username: "admin1",
      email: "admin@example.com",
      phone: "09129876543",
      first_name: "رضا",
      last_name: "کریمی",
      national_id: "0023456789",
      role: "admin",
      is_active: true,
      is_verified: true,
      created_at: "2024-01-10T09:15:00",
      country: "ایران",
      city: "مشهد",
      gender: "male"
    },
    {
      id: 3,
      username: "user2",
      email: "user2@example.com",
      phone: "09127654321",
      first_name: "مریم",
      last_name: "احمدی",
      national_id: "0034567890",
      role: "user",
      is_active: false,
      is_verified: false,
      created_at: "2024-01-08T14:20:00",
      country: "ایران",
      city: "اصفهان",
      gender: "female"
    }
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchUsers(searchTerm)
  }

  const handleToggleActive = async (userId: number, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('admin_token')
      // 🔧 اصلاح: حذف /api از URL
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/toggle-active`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, is_active: !currentStatus } : user
        ))
        alert(`کاربر ${!currentStatus ? 'فعال' : 'غیرفعال'} شد`)
      } else {
        throw new Error('خطا در تغییر وضعیت کاربر')
      }
    } catch (error) {
      console.error('Error toggling user status:', error)
      alert('خطا در تغییر وضعیت کاربر - سرور در دسترس نیست')
    }
  }

  const handleVerifyUser = async (userId: number, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('admin_token')
      // 🔧 اصلاح: حذف /api از URL
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/verify`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          is_verified: !currentStatus,
          verification_notes: `تغییر وضعیت توسط ادمین در ${new Date().toLocaleString('fa-IR')}`
        })
      })

      if (response.ok) {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, is_verified: !currentStatus } : user
        ))
        alert(`کاربر ${!currentStatus ? 'تایید' : 'لغو تایید'} شد`)
      } else {
        throw new Error('خطا در تغییر وضعیت تایید')
      }
    } catch (error) {
      console.error('Error verifying user:', error)
      alert('خطا در تغییر وضعیت تایید - سرور در دسترس نیست')
    }
  }

  const getRoleBadge = (role: string) => {
    const config = {
      user: { color: 'bg-green-100 text-green-800', text: 'کاربر' },
      admin: { color: 'bg-blue-100 text-blue-800', text: 'ادمین' },
      super_admin: { color: 'bg-purple-100 text-purple-800', text: 'سوپر ادمین' }
    }[role] || { color: 'bg-gray-100 text-gray-800', text: role }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    )
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? 
      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">فعال</span> :
      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">غیرفعال</span>
  }

  const getVerificationBadge = (isVerified: boolean) => {
    return isVerified ? 
      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">تأیید شده</span> :
      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">در انتظار</span>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR')
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    router.push('/admin/login')
  }

  const handleRetry = () => {
    setError('')
    fetchUsers()
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* هدر */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">مدیریت کاربران</h1>
          <p className="text-gray-400 mt-1">{users.length} کاربر</p>
        </div>
        <div className="flex gap-3">
          <Link 
            href="/admin/dashboard"
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
          >
            بازگشت به داشبورد
          </Link>
          <button 
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
          >
            خروج
          </button>
        </div>
      </div>

      {/* نمایش خطا */}
      {error && (
        <div className="bg-red-900 border border-red-700 text-white p-4 rounded-lg mb-6">
          <div className="flex justify-between items-center">
            <div>
              <strong>خطا:</strong> {error}
            </div>
            <button 
              onClick={handleRetry}
              className="bg-red-700 hover:bg-red-600 px-4 py-2 rounded transition-colors"
            >
              تلاش مجدد
            </button>
          </div>
          <div className="mt-2 text-sm text-red-200">
            لطفاً مطمئن شوید سرور بک‌اند در حال اجرا است:
            <code className="bg-black bg-opacity-50 px-2 py-1 rounded ml-2">
              cd backend && uvicorn app.main:app --reload
            </code>
          </div>
        </div>
      )}

      {/* جستجو */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="جستجوی کاربران بر اساس نام، ایمیل، تلفن یا کد ملی..."
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button 
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors font-medium"
          >
            جستجو
          </button>
          <button 
            type="button"
            onClick={() => {
              setSearchTerm('')
              fetchUsers()
            }}
            className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg transition-colors"
          >
            بازنشانی
          </button>
        </form>
      </div>

      {/* جدول کاربران */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="text-gray-400">در حال بارگذاری کاربران...</div>
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400">کاربری یافت نشد</div>
            <button 
              onClick={() => fetchUsers()}
              className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
            >
              بارگذاری مجدد
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">کاربر</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">اطلاعات تماس</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">نقش</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">وضعیت</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">تایید</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">تاریخ ثبت‌نام</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-750 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-sm text-gray-400">
                          کد ملی: {user.national_id}
                        </div>
                        {user.country && (
                          <div className="text-sm text-gray-400">
                            {user.country} {user.city && `- ${user.city}`}
                          </div>
                        )}
                        {user.gender && (
                          <div className="text-sm text-gray-400">
                            {user.gender === 'male' ? 'مرد' : user.gender === 'female' ? 'زن' : 'سایر'}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div>{user.email}</div>
                        <div className="text-gray-400">{user.phone}</div>
                        <div className="text-gray-400">{user.username}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(user.is_active)}
                    </td>
                    <td className="px-6 py-4">
                      {getVerificationBadge(user.is_verified)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => handleToggleActive(user.id, user.is_active)}
                          className={`px-3 py-1 rounded text-xs ${
                            user.is_active 
                              ? 'bg-red-600 hover:bg-red-700' 
                              : 'bg-green-600 hover:bg-green-700'
                          } text-white transition-colors`}
                        >
                          {user.is_active ? 'غیرفعال' : 'فعال'}
                        </button>
                        <button
                          onClick={() => handleVerifyUser(user.id, user.is_verified)}
                          className={`px-3 py-1 rounded text-xs ${
                            user.is_verified 
                              ? 'bg-yellow-600 hover:bg-yellow-700' 
                              : 'bg-green-600 hover:bg-green-700'
                          } text-white transition-colors`}
                        >
                          {user.is_verified ? 'لغو تایید' : 'تایید'}
                        </button>
                        <button
                          onClick={() => alert(`ویرایش کاربر ${user.id}`)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs text-white transition-colors"
                        >
                          ویرایش
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}