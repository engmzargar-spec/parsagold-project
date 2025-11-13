'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../../contexts/AuthContext'

interface User {
  id: number
  email: string
  phone: string
  first_name: string
  last_name: string
  status: string
  country: string
  city: string
  email_verified: boolean
  phone_verified: boolean
  created_at: string
  last_login: string
}

export default function UserManagement() {
  const { token } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/users/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user =>
    user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.includes(searchTerm)
  )

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', text: 'فعال' },
      inactive: { color: 'bg-gray-100 text-gray-800', text: 'غیرفعال' },
      suspended: { color: 'bg-red-100 text-red-800', text: 'تعلیق' },
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'در انتظار' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">مدیریت کاربران</h1>
        <div className="text-sm text-gray-600">
          تعداد کاربران: {users.length}
        </div>
      </div>

      {/* جستجو */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="flex-1">
            <input
              type="text"
              placeholder="جستجو در کاربران (نام، ایمیل، تلفن)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200">
            جستجو
          </button>
        </div>
      </div>

      {/* جدول کاربران */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  کاربر
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  اطلاعات تماس
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  وضعیت
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  تاریخ عضویت
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-800 font-medium">
                          {user.first_name?.[0]}{user.last_name?.[0]}
                        </span>
                      </div>
                      <div className="mr-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.country} - {user.city}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                    <div className="text-sm text-gray-500">{user.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(user.status)}
                    <div className="flex space-x-2 space-x-reverse mt-1">
                      {user.email_verified && (
                        <span className="text-xs text-green-600">✓ ایمیل</span>
                      )}
                      {user.phone_verified && (
                        <span className="text-xs text-blue-600">✓ تلفن</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString('fa-IR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-4">
                      ویرایش
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      تعلیق
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg">کاربری یافت نشد</div>
          <div className="text-gray-500 mt-2">لطفاً عبارت جستجو را تغییر دهید</div>
        </div>
      )}
    </div>
  )
}