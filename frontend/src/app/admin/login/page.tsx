'use client'

import { useState } from 'react'
import Link from 'next/link'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('🔐 تلاش برای لاگین ادمین...')
      
      // ✅ استفاده از endpoint اصلی بک‌اند
      const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: username.trim(),
          password: password 
        }),
      })

      console.log('📡 وضعیت پاسخ:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ خطای سرور:', errorText)
        
        if (response.status === 401) {
          setError('نام کاربری یا رمز عبور اشتباه است')
        } else if (response.status === 404) {
          setError('سرور در دسترس نیست. لطفاً backend را بررسی کنید.')
        } else {
          setError(`خطای سرور: ${response.status}`)
        }
        return
      }

      const data = await response.json()
      console.log('✅ پاسخ موفق:', data)

      // ذخیره توکن و اطلاعات کاربر
      if (data.access_token) {
        localStorage.setItem('admin_token', data.access_token)
        localStorage.setItem('admin_user', JSON.stringify(data.admin || data.user))
        console.log('💾 اطلاعات در localStorage ذخیره شد')
        
        // هدایت به داشبورد
        window.location.href = '/admin/dashboard'
      } else {
        setError('پاسخ نامعتبر از سرور')
      }

    } catch (err: any) {
      console.error('❌ خطای شبکه:', err)
      setError('خطا در ارتباط با سرور. مطمئن شوید backend در حال اجراست.')
    } finally {
      setLoading(false)
    }
  }

  // تست اتصال به سرور
  const testConnection = async () => {
    try {
      setError('')
      const response = await fetch(`${API_BASE_URL}/api/health`)
      if (response.ok) {
        setError('✅ سرور در دسترس است')
      } else {
        setError('❌ سرور پاسخ نمی‌دهد')
      }
    } catch (err) {
      setError('🚫 خطای شبکه: سرور در دسترس نیست')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg border border-gray-200 dark:border-gray-700 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            ورود به مدیریت
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            سیستم مدیریت پارسا گلد
          </p>
          
          {/* دکمه تست اتصال */}
          <button
            type="button"
            onClick={testConnection}
            className="mt-4 text-sm bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded"
          >
            تست اتصال به سرور
          </button>
        </div>

        {error && (
          <div className={`p-4 rounded-lg mb-6 ${
            error.includes('✅') 
              ? 'bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-200'
              : 'bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-200'
          }`}>
            <div className="flex items-center gap-2">
              <span>{error.includes('✅') ? '✅' : '⚠️'}</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              نام کاربری
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="admin"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              رمز عبور
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 rounded-lg transition-colors font-medium"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>در حال ورود...</span>
              </div>
            ) : (
              'ورود به سیستم'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link 
            href="/" 
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
          >
            بازگشت به سایت اصلی
          </Link>
        </div>
      </div>
    </div>
  )
}