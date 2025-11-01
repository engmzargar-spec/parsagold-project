// frontend/src/app/admin/forgot-password/page.tsx
import Link from 'next/link'
import Image from 'next/image'

export default function ForgotPassword() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
        {/* لوگوی اصلی پارسا گلد */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="h-20 w-48 relative">
              <Image
                src="/logo/parsagold-main-logo.png"
                alt="پارسا گلد"
                width={192}
                height={80}
                className="object-contain"
                priority
              />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mt-4">بازیابی رمز عبور</h1>
          <p className="text-gray-400 mt-2 text-sm">پنل مدیریت پارسا گلد</p>
        </div>

        {/* فرم بازیابی */}
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              ایمیل مدیر
            </label>
            <input 
              type="email" 
              className="w-full bg-gray-700 border border-gray-600 rounded-lg text-white px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="admin@parsagold.com"
              required
            />
            <p className="text-xs text-gray-400 mt-2">
              لینک بازیابی رمز عبور به ایمیل شما ارسال خواهد شد
            </p>
          </div>
          
          <div className="flex space-x-4 space-x-reverse">
            <Link 
              href="/admin/login"
              className="flex-1 bg-gray-700 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors text-center font-medium"
            >
              بازگشت
            </Link>
            <button 
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium"
            >
              ارسال لینک بازیابی
            </button>
          </div>
        </form>

        {/* اطلاعات تماس */}
        <div className="mt-8 pt-6 border-t border-gray-700 text-center">
          <p className="text-sm text-gray-400">
            در صورت مشکل با پشتیبانی تماس بگیرید: 
            <span className="text-gold-400 mr-1">۰۲۱-۱۲۳۴۵۶۷۸</span>
          </p>
        </div>
      </div>
    </div>
  )
}