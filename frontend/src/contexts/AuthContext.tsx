'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: number
  username: string
  email: string
  role: string
  first_name: string
  last_name: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // بارگذاری اطلاعات از localStorage
    const savedToken = localStorage.getItem('admin_token')
    const savedUser = localStorage.getItem('admin_user')

    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
    
    setLoading(false)
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)
      
      console.log('Attempting login with:', { username, password })

      // استفاده از endpoint اصلی
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: username,
          password: password,
          grant_type: 'password'
        }),
      })

      console.log('Login response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('Login successful:', data)
        
        // ذخیره در state
        setToken(data.access_token)
        setUser(data.user)
        
        // ذخیره در localStorage
        localStorage.setItem('admin_token', data.access_token)
        localStorage.setItem('admin_user', JSON.stringify(data.user))
        
        // هدایت به داشبورد
        router.push('/admin/dashboard')
        return true
      } else {
        const errorData = await response.json()
        console.error('Login failed:', errorData)
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    router.push('/admin/login')
  }

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    loading,
    login,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}