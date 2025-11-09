import React, { useState } from 'react' // ✅ اضافه کردن React import
import { Admin } from '../../types/admin.types'

interface AdminEditModalProps {
  admin: Admin | null
  isOpen: boolean
  onClose: () => void
  onSave: (adminData: any) => void
  currentAdmin: any
}

export const AdminEditModal: React.FC<AdminEditModalProps> = ({
  admin,
  isOpen,
  onClose,
  onSave,
  currentAdmin
}) => {
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })

  if (!isOpen || !admin) return null

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    
    // ✅ اصلاح: فقط فیلدهایی که در سرور پشتیبانی می‌شوند
    const updateData: any = {
      username: formData.get('username') as string,
      email: formData.get('email') as string,
      full_name: formData.get('full_name') as string,
      phone: formData.get('phone') as string,
      gender: formData.get('gender') as string,
      organizational_position: formData.get('organizational_position') as string,
    }
    
    // فقط مدیر ارشد می‌تواند role, is_active, is_approved را تغییر دهد
    if (currentAdmin?.role === 'chief') {
      updateData.role = formData.get('role') as string
      updateData.is_active = formData.get('is_active') === 'true'
      updateData.is_approved = formData.get('is_approved') === 'true'
    }
    
    // اضافه کردن سطح دسترسی اگر وجود دارد
    const accessLevel = formData.get('access_level') as string
    if (accessLevel) {
      updateData.access_level = accessLevel
    }
    
    // ✅ اصلاح: حذف فیلدهای رمز عبور از اینجا - باید جداگانه مدیریت شوند
    // این فیلدها در endpoint ویرایش پشتیبانی نمی‌شوند
    
    onSave(updateData)
  }

  const handleResetPassword = async () => {
    // ✅ این باید جداگانه با endpoint /reset-password/{id} فراخوانی شود
    if (window.confirm('آیا از بازنشانی رمز عبور این ادمین اطمینان دارید؟')) {
      console.log('🔐 Reset password for admin:', admin.id)
      // TODO: فراخوانی تابع resetAdminPassword از useAdmins
    }
  }

  const handleChangePassword = async () => {
    // ✅ این باید جداگانه مدیریت شود
    if (passwordData.new_password !== passwordData.confirm_password) {
      alert('رمز عبور جدید و تکرار آن مطابقت ندارند')
      return
    }
    if (passwordData.new_password.length < 6) {
      alert('رمز عبور جدید باید حداقل 6 کاراکتر باشد')
      return
    }
    
    console.log('🔐 Change password for admin:', admin.id)
    // TODO: پیاده‌سازی تغییر رمز عبور
  }

  const isChiefAdmin = currentAdmin?.role === 'chief'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white border-b pb-4">
          ویرایش ادمین - {admin.full_name}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* اطلاعات اصلی */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                نام کامل *
              </label>
              <input
                type="text"
                name="full_name"
                defaultValue={admin.full_name}
                required
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                نام کاربری *
              </label>
              <input
                type="text"
                name="username"
                defaultValue={admin.username}
                required
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ایمیل *
              </label>
              <input
                type="email"
                name="email"
                defaultValue={admin.email}
                required
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                شماره موبایل *
              </label>
              <input
                type="tel"
                name="phone"
                defaultValue={admin.phone}
                required
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white"
              />
            </div>

            {/* فیلد جنسیت */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                جنسیت *
              </label>
              <select
                name="gender"
                defaultValue={admin.gender || 'MALE'} // ✅ اصلاح: استفاده از مقادیر سرور
                required
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white"
              >
                <option value="MALE">مرد</option> {/* ✅ اصلاح: MALE نه male */}
                <option value="FEMALE">زن</option> {/* ✅ اصلاح: FEMALE نه female */}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                سمت سازمانی
              </label>
              <input
                type="text"
                name="organizational_position"
                defaultValue={admin.organizational_position || ''}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white"
                placeholder="مثال: مدیر فنی"
              />
            </div>

            {/* فقط مدیر ارشد می‌تواند نقش را تغییر دهد */}
            {isChiefAdmin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  نقش در سیستم *
                </label>
                <select
                  name="role"
                  defaultValue={admin.role}
                  required
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white"
                >
                  <option value="admin">ادمین</option>
                  <option value="super_admin">سوپر ادمین</option>
                  <option value="chief">مدیر ارشد</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                سطح دسترسی
              </label>
              <select
                name="access_level"
                defaultValue={admin.access_level || 'basic'}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white"
              >
                <option value="basic">پایه</option>
                <option value="medium">متوسط</option>
                <option value="advanced">پیشرفته</option>
                <option value="full">کامل</option>
              </select>
            </div>

            {/* فقط مدیر ارشد می‌تواند وضعیت را تغییر دهد */}
            {isChiefAdmin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    وضعیت حساب
                  </label>
                  <select
                    name="is_active"
                    defaultValue={admin.is_active.toString()}
                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white"
                  >
                    <option value="true">فعال</option>
                    <option value="false">غیرفعال</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    وضعیت تأیید
                  </label>
                  <select
                    name="is_approved"
                    defaultValue={admin.is_approved.toString()}
                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white"
                  >
                    <option value="true">تأیید شده</option>
                    <option value="false">در انتظار تأیید</option>
                  </select>
                </div>
              </>
            )}
          </div>

          {/* ✅ اصلاح: مدیریت رمز عبور - جدا از فرم اصلی */}
          <div className="border-t pt-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-4">مدیریت رمز عبور</h4>
            <div className="space-y-4">
              {/* دکمه بازنشانی رمز عبور */}
              {isChiefAdmin && (
                <button
                  type="button"
                  onClick={handleResetPassword}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-white text-sm transition-colors"
                >
                  بازنشانی رمز عبور
                </button>
              )}

              {/* تغییر رمز عبور */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="change_password"
                  checked={showChangePassword}
                  onChange={(e) => setShowChangePassword(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="change_password" className="text-sm text-gray-700 dark:text-gray-300">
                  تغییر رمز عبور
                </label>
              </div>

              {showChangePassword && (
                <div className="space-y-3 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      رمز عبور فعلی
                    </label>
                    <input
                      type="password"
                      value={passwordData.current_password}
                      onChange={(e) => handlePasswordChange('current_password', e.target.value)}
                      className="w-full bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg px-3 py-2 text-gray-900 dark:text-white"
                      placeholder="رمز عبور فعلی"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      رمز عبور جدید
                    </label>
                    <input
                      type="password"
                      value={passwordData.new_password}
                      onChange={(e) => handlePasswordChange('new_password', e.target.value)}
                      className="w-full bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg px-3 py-2 text-gray-900 dark:text-white"
                      placeholder="رمز عبور جدید"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      تکرار رمز عبور جدید
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirm_password}
                      onChange={(e) => handlePasswordChange('confirm_password', e.target.value)}
                      className="w-full bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg px-3 py-2 text-gray-900 dark:text-white"
                      placeholder="تکرار رمز عبور جدید"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleChangePassword}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm transition-colors"
                  >
                    تغییر رمز عبور
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors font-medium"
            >
              ذخیره تغییرات
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-lg transition-colors"
            >
              انصراف
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}