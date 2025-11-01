'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff } from 'lucide-react'

type AccessGrade = 'chief' | 'grade1' | 'grade2' | 'grade3'

interface AdminData {
  username: string
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  phone: string
  accessGrade: AccessGrade
}

interface ValidationErrors {
  username?: string
  email?: string
  password?: string
  confirmPassword?: string
  firstName?: string
  lastName?: string
  phone?: string
  general?: string
}

export default function AdminLogin() {
  const [username, setUsername] = useState('Chief-admin-zargar')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showAdminCreation, setShowAdminCreation] = useState(false)
  const [newAdminData, setNewAdminData] = useState<AdminData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    accessGrade: 'grade3'
  })
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showNewConfirmPassword, setShowNewConfirmPassword] = useState(false)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [creationSuccess, setCreationSuccess] = useState('')
  const router = useRouter()

  // اعتبارسنجی نام کاربری
  const validateUsername = (username: string): boolean => {
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/
    return usernameRegex.test(username)
  }

  // اعتبارسنجی ایمیل
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // اعتبارسنجی شماره موبایل ایرانی
  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^09[0-9]{9}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  }

  // اعتبارسنجی رمز عبور قوی
  const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []
    
    if (password.length < 8) {
      errors.push('حداقل ۸ کاراکتر')
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('حروف کوچک انگلیسی')
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('حروف بزرگ انگلیسی')
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push('اعداد')
    }
    if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) {
      errors.push('علائم خاص')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // اعتبارسنجی کامل فرم
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {}

    // اعتبارسنجی نام کاربری
    if (!newAdminData.username.trim()) {
      errors.username = 'نام کاربری الزامی است'
    } else if (!validateUsername(newAdminData.username)) {
      errors.username = 'نام کاربری باید ۳-۲۰ کاراکتر و فقط شامل حروف، اعداد، - و _ باشد'
    }

    // اعتبارسنجی نام
    if (!newAdminData.firstName.trim()) {
      errors.firstName = 'نام الزامی است'
    } else if (newAdminData.firstName.trim().length < 2) {
      errors.firstName = 'نام باید حداقل ۲ کاراکتر باشد'
    }

    // اعتبارسنجی نام خانوادگی
    if (!newAdminData.lastName.trim()) {
      errors.lastName = 'نام خانوادگی الزامی است'
    } else if (newAdminData.lastName.trim().length < 2) {
      errors.lastName = 'نام خانوادگی باید حداقل ۲ کاراکتر باشد'
    }

    // اعتبارسنجی ایمیل
    if (!newAdminData.email.trim()) {
      errors.email = 'ایمیل الزامی است'
    } else if (!validateEmail(newAdminData.email)) {
      errors.email = 'فرمت ایمیل نامعتبر است'
    }

    // اعتبارسنجی شماره موبایل
    if (!newAdminData.phone.trim()) {
      errors.phone = 'شماره موبایل الزامی است'
    } else if (!validatePhone(newAdminData.phone)) {
      errors.phone = 'فرمت شماره موبایل نامعتبر است (09xxxxxxxxx)'
    }

    // اعتبارسنجی رمز عبور
    if (!newAdminData.password) {
      errors.password = 'رمز عبور الزامی است'
    } else {
      const passwordValidation = validatePassword(newAdminData.password)
      if (!passwordValidation.isValid) {
        errors.password = `رمز عبور باید شامل: ${passwordValidation.errors.join('، ')} باشد`
      }
    }

    // اعتبارسنجی تکرار رمز عبور
    if (!newAdminData.confirmPassword) {
      errors.confirmPassword = 'تکرار رمز عبور الزامی است'
    } else if (newAdminData.password !== newAdminData.confirmPassword) {
      errors.confirmPassword = 'رمز عبور و تکرار آن مطابقت ندارند'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // تابع handleLogin که گم شده بود
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // ارسال درخواست به API
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
        localStorage.setItem('admin_grade', data.admin.access_grade)
        localStorage.setItem('admin_info', JSON.stringify(data.admin))
        
        // هدایت به داشبورد
        router.push('/admin/dashboard')
      } else {
        // نمایش خطا از سرور
        setError(data.detail || 'نام کاربری یا رمز عبور اشتباه است')
      }
    } catch (err) {
      console.error('خطا در لاگین:', err)
      setError('خطا در ارتباط با سرور. لطفاً اتصال اینترنت را بررسی کنید.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setValidationErrors({})

    // اعتبارسنجی کامل فرم
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // ارسال درخواست ایجاد ادمین به API
      const token = localStorage.getItem('admin_token')
      
      const response = await fetch('http://localhost:8000/api/admin/register-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: newAdminData.username,
          email: newAdminData.email,
          password: newAdminData.password,
          confirm_password: newAdminData.confirmPassword,
          first_name: newAdminData.firstName,
          last_name: newAdminData.lastName,
          phone: newAdminData.phone,
          national_id: '0012345678', // مقدار پیش فرض
          access_grade: newAdminData.accessGrade
        })
      })

      const data = await response.json()

      if (response.ok) {
        if (newAdminData.accessGrade === 'chief') {
          setCreationSuccess('حساب Chief ایجاد شد! برای فعال‌سازی نیاز به تأیید توسط Chief موجود دارد.')
        } else {
          setCreationSuccess('حساب ادمین ایجاد شد! برای فعال‌سازی نیاز به تأیید توسط Chief دارد.')
        }
        
        setShowAdminCreation(false)
        setNewAdminData({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          firstName: '',
          lastName: '',
          phone: '',
          accessGrade: 'grade3'
        })
      } else {
        setError(data.detail || 'خطا در ایجاد حساب ادمین')
      }
    } catch (err) {
      console.error('خطا در ایجاد ادمین:', err)
      setError('خطا در ارتباط با سرور')
    } finally {
      setLoading(false)
    }
  }

  const handleNewAdminChange = (field: keyof AdminData, value: string) => {
    setNewAdminData(prev => ({
      ...prev,
      [field]: value
    }))

    // پاک کردن خطای فیلد هنگام تایپ
    if (validationErrors[field as keyof ValidationErrors]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  const getAccessGradeInfo = (grade: AccessGrade) => {
    const grades = {
      chief: {
        name: 'Chief',
        description: 'بالاترین سطح دسترسی - مدیریت کامل سیستم',
        color: 'text-red-400',
        badge: '🔴'
      },
      grade1: {
        name: 'گرید ۱',
        description: 'دسترسی پیشرفته - مدیریت کاربران و معاملات',
        color: 'text-orange-400',
        badge: '🟠'
      },
      grade2: {
        name: 'گرید ۲',
        description: 'دسترسی متوسط - مشاهده گزارشات و پشتیبانی',
        color: 'text-yellow-400',
        badge: '🟡'
      },
      grade3: {
        name: 'گرید ۳',
        description: 'دسترسی پایه - مشاهده اطلاعات محدود',
        color: 'text-green-400',
        badge: '🟢'
      }
    }
    return grades[grade]
  }

  // نمایش قدرت رمز عبور
  const getPasswordStrength = (password: string) => {
    const validation = validatePassword(password)
    const strength = validation.isValid ? 100 : 
      password.length >= 8 ? 75 :
      password.length >= 6 ? 50 :
      password.length >= 4 ? 25 : 0

    return {
      strength,
      color: strength >= 75 ? 'bg-green-500' : 
             strength >= 50 ? 'bg-yellow-500' : 
             strength >= 25 ? 'bg-orange-500' : 'bg-red-500',
      text: strength >= 75 ? 'قوی' : 
            strength >= 50 ? 'متوسط' : 
            strength >= 25 ? 'ضعیف' : 'بسیار ضعیف'
    }
  }

  const passwordStrength = getPasswordStrength(newAdminData.password)

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
          <h1 className="text-xl font-bold text-white">
            {showAdminCreation ? 'ایجاد حساب ادمین' : 'ورود به پنل مدیریت'}
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            {showAdminCreation ? 'سیستم مدیریتی پارسا گلد' : 'سیستم مدیریتی پارسا گلد'}
          </p>
        </div>

        {/* نمایش پیام موفقیت */}
        {creationSuccess && (
          <div className="bg-green-900/50 border border-green-700 text-green-200 px-4 py-3 rounded-lg mb-4 text-sm">
            {creationSuccess}
          </div>
        )}

        {/* نمایش خطا */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* فرم ایجاد ادمین */}
        {showAdminCreation ? (
          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                نام کاربری *
              </label>
              <input 
                type="text" 
                value={newAdminData.username}
                onChange={(e) => handleNewAdminChange('username', e.target.value)}
                className={`w-full bg-gray-700 border rounded-lg text-white px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm ${
                  validationErrors.username ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="username"
              />
              {validationErrors.username && (
                <p className="text-red-400 text-xs mt-1">{validationErrors.username}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                فقط حروف انگلیسی، اعداد، - و _ مجاز است (۳-۲۰ کاراکتر)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  نام *
                </label>
                <input 
                  type="text" 
                  value={newAdminData.firstName}
                  onChange={(e) => handleNewAdminChange('firstName', e.target.value)}
                  className={`w-full bg-gray-700 border rounded-lg text-white px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm ${
                    validationErrors.firstName ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="نام"
                />
                {validationErrors.firstName && (
                  <p className="text-red-400 text-xs mt-1">{validationErrors.firstName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  نام خانوادگی *
                </label>
                <input 
                  type="text" 
                  value={newAdminData.lastName}
                  onChange={(e) => handleNewAdminChange('lastName', e.target.value)}
                  className={`w-full bg-gray-700 border rounded-lg text-white px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm ${
                    validationErrors.lastName ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="نام خانوادگی"
                />
                {validationErrors.lastName && (
                  <p className="text-red-400 text-xs mt-1">{validationErrors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                ایمیل *
              </label>
              <input 
                type="email" 
                value={newAdminData.email}
                onChange={(e) => handleNewAdminChange('email', e.target.value)}
                className={`w-full bg-gray-700 border rounded-lg text-white px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm ${
                  validationErrors.email ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="admin@example.com"
              />
              {validationErrors.email && (
                <p className="text-red-400 text-xs mt-1">{validationErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                شماره موبایل *
              </label>
              <input 
                type="tel" 
                value={newAdminData.phone}
                onChange={(e) => handleNewAdminChange('phone', e.target.value)}
                className={`w-full bg-gray-700 border rounded-lg text-white px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm ${
                  validationErrors.phone ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="09123456789"
              />
              {validationErrors.phone && (
                <p className="text-red-400 text-xs mt-1">{validationErrors.phone}</p>
              )}
            </div>

            {/* گرید دسترسی */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                گرید دسترسی
              </label>
              <select 
                value={newAdminData.accessGrade}
                onChange={(e) => handleNewAdminChange('accessGrade', e.target.value as AccessGrade)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg text-white px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              >
                <option value="grade3">🟢 گرید ۳ - دسترسی پایه</option>
                <option value="grade2">🟡 گرید ۲ - دسترسی متوسط</option>
                <option value="grade1">🟠 گرید ۱ - دسترسی پیشرفته</option>
                <option value="chief">🔴 Chief - دسترسی کامل</option>
              </select>
              
              {/* نمایش اطلاعات گرید انتخاب شده */}
              <div className={`mt-2 p-3 rounded-lg border ${
                newAdminData.accessGrade === 'chief' ? 'border-red-500 bg-red-900/20' :
                newAdminData.accessGrade === 'grade1' ? 'border-orange-500 bg-orange-900/20' :
                newAdminData.accessGrade === 'grade2' ? 'border-yellow-500 bg-yellow-900/20' :
                'border-green-500 bg-green-900/20'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <span>{getAccessGradeInfo(newAdminData.accessGrade).badge}</span>
                  <span className={`text-sm font-medium ${getAccessGradeInfo(newAdminData.accessGrade).color}`}>
                    {getAccessGradeInfo(newAdminData.accessGrade).name}
                  </span>
                </div>
                <p className="text-xs text-gray-300">
                  {getAccessGradeInfo(newAdminData.accessGrade).description}
                </p>
                {newAdminData.accessGrade === 'chief' && (
                  <p className="text-xs text-red-300 mt-1">
                    ⚠️ حداکثر ۳ Chief در سیستم مجاز است
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                رمز عبور *
              </label>
              <div className="relative">
                <input 
                  type={showNewPassword ? "text" : "password"}
                  value={newAdminData.password}
                  onChange={(e) => handleNewAdminChange('password', e.target.value)}
                  className={`w-full bg-gray-700 border rounded-lg text-white px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm ${
                    validationErrors.password ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="••••••••"
                />
                {/* ✅ دکمه نمایش/مخفی کردن رمز عبور */}
                <button
                  type="button"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {/* نمایش قدرت رمز عبور */}
              {newAdminData.password && (
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-400">قدرت رمز عبور:</span>
                    <span className={`text-xs ${
                      passwordStrength.strength >= 75 ? 'text-green-400' :
                      passwordStrength.strength >= 50 ? 'text-yellow-400' :
                      passwordStrength.strength >= 25 ? 'text-orange-400' : 'text-red-400'
                    }`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${passwordStrength.strength}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {validationErrors.password && (
                <p className="text-red-400 text-xs mt-1">{validationErrors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                تکرار رمز عبور *
              </label>
              <div className="relative">
                <input 
                  type={showNewConfirmPassword ? "text" : "password"}
                  value={newAdminData.confirmPassword}
                  onChange={(e) => handleNewAdminChange('confirmPassword', e.target.value)}
                  className={`w-full bg-gray-700 border rounded-lg text-white px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm ${
                    validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="••••••••"
                />
                {/* ✅ دکمه نمایش/مخفی کردن رمز عبور */}
                <button
                  type="button"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                  onClick={() => setShowNewConfirmPassword(!showNewConfirmPassword)}
                >
                  {showNewConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">{validationErrors.confirmPassword}</p>
              )}
            </div>

            {/* اطلاعات سیستم */}
            <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-3">
              <p className="text-xs text-blue-300 text-center">
                <strong>سیستم تأیید Chief:</strong><br/>
                پس از ایجاد حساب، برای فعال‌سازی نیاز به تأیید توسط Chief موجود دارد.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                type="button"
                onClick={() => setShowAdminCreation(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg transition-all duration-200 font-medium"
              >
                بازگشت
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'در حال ایجاد...' : 'ایجاد ادمین'}
              </button>
            </div>
          </form>
        ) : (
          /* فرم ورود */
          <>
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
                  placeholder="Chief-admin-zargar"
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
                    placeholder="••••••••"
                    required
                  />
                  {/* ✅ دکمه نمایش/مخفی کردن رمز عبور */}
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

            {/* دکمه ایجاد ادمین جدید */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <button 
                onClick={() => setShowAdminCreation(true)}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium"
              >
                👑 ایجاد حساب ادمین جدید
              </button>
              <p className="text-xs text-gray-400 text-center mt-3">
                برای ایجاد حساب مدیریتی جدید (نیاز به تأیید Chief)
              </p>
            </div>
          </>
        )}

        {/* اطلاعات تست */}
        {!showAdminCreation && (
          <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
            <p className="text-xs text-gray-300 text-center">
              <strong>حساب Chief:</strong><br/>
              نام کاربری: Chief-admin-zargar<br/>
              رمز: Mezr@1360
            </p>
          </div>
        )}
      </div>
    </div>
  )
}