'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '../../../contexts/AuthContext'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const { login, loading } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const success = await login(username, password)
    
    if (success) {
      // پس از لاگین موفق، کاربر به صورت خودکار به داشبورد هدایت می‌شود
      console.log('Login successful')
    } else {
      setError('نام کاربری یا رمز عبور اشتباه است')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 w-full max-w-md">
        {/* لوگو */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image 
              src="/logo/Parsagold-main-logo.png"
              alt="ParsaGold Logo"
              width={120}
              height={60}
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-white">
            ورود به مدیریت
          </h1>
          <p className="text-gray-400 mt-2">
            سیستم مدیریت پارسا گلد
          </p>
        </div>

        {/* نمایش خطا */}
        {error && (
          <div className="p-3 rounded-lg mb-6 text-sm bg-red-900 border border-red-700 text-red-200">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* فرم ورود */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* فیلد نام کاربری */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
              نام کاربری
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="نام کاربری خود را وارد کنید"
              disabled={loading}
            />
          </div>

          {/* فیلد رمز عبور */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              رمز عبور
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="رمز عبور خود را وارد کنید"
                disabled={loading}
              />
              {/* دکمه نمایش/مخفی کردن رمز */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                disabled={loading}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L9 9m4.242 4.242L14 14m-4.242-4.242L6.172 6.172" />
                  </svg>
                )}
              </button>
            </div>
            
            {/* لینک فراموشی رمز عبور */}
            <div className="mt-2 text-center">
              <p className="text-xs text-gray-400">
                رمز عبور را فراموش کرده اید؟ برای ریست رمز عبور با ادمین تماس بگیرید
              </p>
            </div>
          </div>

          {/* دکمه ورود */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white py-3 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>در حال ورود...</span>
              </>
            ) : (
              'ورود به سیستم'
            )}
          </button>
        </form>

        {/* لینک بازگشت */}
        <div className="mt-6 text-center">
          <Link 
            href="/" 
            className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
          >
            بازگشت به سایت اصلی
          </Link>
        </div>
      </div>
    </div>
  )
}