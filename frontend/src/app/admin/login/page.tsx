// frontend/src/app/admin/login/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff } from 'lucide-react'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // اگر کاربر قبلاً لاگین کرده، به dashboard برو
  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      router.push('/admin/dashboard')
    }
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!username.trim() || !password.trim()) {
      setError('لطفاً نام کاربری و رمز عبور را وارد کنید')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('http://localhost:8000/api/auth/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password
        })
      })

      const data = await response.json()

      if (response.ok) {
        // ذخیره توکن و اطلاعات کاربر
        localStorage.setItem('admin_token', data.access_token)
        localStorage.setItem('admin_username', data.admin.username)
        localStorage.setItem('admin_grade', data.admin.role)
        localStorage.setItem('admin_info', JSON.stringify(data.admin))
        
        // هدایت به داشبورد
        router.push('/admin/dashboard')
      } else {
        setError(data.detail || 'نام کاربری یا رمز عبور اشتباه است')
      }
    } catch (err) {
      console.error('خطا در لاگین:', err)
      setError('خطا در ارتباط با سرور. لطفاً اتصال اینترنت را بررسی کنید.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
        
        {/* لوگو */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 relative">
              <Image
                src="/logo/parsagold-main-logo.png"
                alt="پارسا گلد"
                width={160}
                height={64}
                className="object-contain"
                priority
              />
            </div>
          </div>
          <h1 className="text-xl font-bold text-white">ورود به پنل مدیریت</h1>
          <p className="text-gray-400 mt-2 text-sm">سیستم مدیریتی پارسا گلد</p>
        </div>

        {/* نمایش خطا */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* فرم ورود */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              نام کاربری
            </label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg text-white px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="نام کاربری خود را وارد کنید"
              required
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-300">
                رمز عبور
              </label>
              <Link 
                href="/admin/forgot-password"
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                فراموشی رمز عبور؟
              </Link>
            </div>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg text-white px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="رمز عبور خود را وارد کنید"
                required
              />
              <button
                type="button"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'در حال ورود...' : 'ورود به پنل مدیریت'}
          </button>
        </form>

        {/* اطلاعات تست */}
        <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
          <p className="text-xs text-gray-300 text-center">
            <strong>حساب تست:</strong><br/>
            نام کاربری: chief-admin-zargar<br/>
            رمز: Mezr@1360
          </p>
        </div>
      </div>
    </div>
  )
}