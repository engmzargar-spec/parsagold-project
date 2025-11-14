// فایل: src/contexts/UserAuthContext.tsx
'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { API_CONFIG } from '@/lib/api/config'

interface UserAuthContextType {
  userPhone: string | null
  userId: string | null
  accessToken: string | null
  isAuthenticated: boolean
  loading: boolean
  login: (phone: string, password: string) => Promise<boolean>
  logout: () => void
  setUserFromRegistration: (accessToken: string, userPhone: string, userId: string) => boolean
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined)

export const useUserAuth = () => {
  const context = useContext(UserAuthContext)
  if (context === undefined) {
    throw new Error('useUserAuth must be used within an UserAuthProvider')
  }
  return context
}

interface UserAuthProviderProps {
  children: ReactNode
}

export const UserAuthProvider: React.FC<UserAuthProviderProps> = ({ children }) => {
  const [userPhone, setUserPhone] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    console.log('🔄 UserAuthContext در حال بارگذاری...')
    
    // بارگذاری اطلاعات کاربر عادی از localStorage
    const savedToken = localStorage.getItem('access_token')
    const savedUserPhone = localStorage.getItem('userPhone')
    const savedUserId = localStorage.getItem('userId')

    console.log('📦 مقادیر localStorage:', { savedToken, savedUserPhone, savedUserId })

    if (savedToken && savedUserPhone) {
      console.log('✅ کاربر از قبل لاگین کرده')
      setAccessToken(savedToken)
      setUserPhone(savedUserPhone)
      setUserId(savedUserId)
    } else {
      console.log('❌ کاربر لاگین نکرده')
    }
    
    setLoading(false)
  }, [])

  const login = async (phone: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)
      
      console.log('🔐 تلاش برای ورود با:', { phone })

      // اگر از ثبت‌نام میایم و قبلاً توکن داریم، لاگین نکن
      const existingToken = localStorage.getItem('access_token')
      const existingUserPhone = localStorage.getItem('userPhone')
      
      if (existingToken && existingUserPhone === phone) {
        console.log('✅ کاربر از قبل توکن دارد - به روزرسانی state')
        setAccessToken(existingToken)
        setUserPhone(existingUserPhone)
        setUserId(localStorage.getItem('userId'))
        return true
      }

      // استفاده از config مرکزی
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phone,
          password: password,
        }),
      })

      console.log('📥 پاسخ لاگین - وضعیت:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ لاگین موفق:', data)
        
        // ذخیره در state
        setAccessToken(data.access_token)
        setUserPhone(data.user?.phone || phone)
        setUserId(data.user?.id || 'unknown')
        
        // ذخیره در localStorage
        localStorage.setItem('access_token', data.access_token)
        localStorage.setItem('userPhone', data.user?.phone || phone)
        localStorage.setItem('userId', data.user?.id || 'unknown')
        
        // هدایت به داشبورد کاربر
        router.push('/user/dashboard')
        return true
      } else {
        // بهتر کردن مدیریت خطا
        let errorData
        try {
          errorData = await response.json()
        } catch {
          errorData = { message: 'خطا در پردازش پاسخ سرور' }
        }
        console.error('❌ لاگین ناموفق:', errorData)
        return false
      }
    } catch (error) {
      console.error('❌ خطا در لاگین:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  // تابع جدید برای تنظیم کاربر بعد از ثبت‌نام
  const setUserFromRegistration = (accessToken: string, userPhone: string, userId: string): boolean => {
    try {
      console.log('✅ تنظیم کاربر از ثبت‌نام:', { userPhone, userId })
      
      // ذخیره در state
      setAccessToken(accessToken)
      setUserPhone(userPhone)
      setUserId(userId)
      
      // ذخیره در localStorage
      localStorage.setItem('access_token', accessToken)
      localStorage.setItem('userPhone', userPhone)
      localStorage.setItem('userId', userId)
      
      console.log('💾 اطلاعات کاربر در context ذخیره شد')
      return true
    } catch (error) {
      console.error('❌ خطا در تنظیم کاربر از ثبت‌نام:', error)
      return false
    }
  }

  const logout = () => {
    console.log('🚪 خروج از سیستم')
    setUserPhone(null)
    setUserId(null)
    setAccessToken(null)
    localStorage.removeItem('access_token')
    localStorage.removeItem('userPhone')
    localStorage.removeItem('userId')
    sessionStorage.removeItem('access_token')
    sessionStorage.removeItem('userPhone')
    sessionStorage.removeItem('userId')
    router.push('/')
  }

  const value: UserAuthContextType = {
    userPhone,
    userId,
    accessToken,
    isAuthenticated: !!accessToken && !!userPhone,
    loading,
    login,
    logout,
    setUserFromRegistration,
  }

  return (
    <UserAuthContext.Provider value={value}>
      {children}
    </UserAuthContext.Provider>
  )
}