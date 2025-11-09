import React from 'react'
import { Admin } from '../../types/admin.types'

interface AdminDetailModalProps {
  admin: Admin | null
  isOpen: boolean
  onClose: () => void
  currentAdmin: any
  onApprove?: (adminId: number) => void
}

export const AdminDetailModal: React.FC<AdminDetailModalProps> = ({
  admin,
  isOpen,
  onClose,
  currentAdmin,
  onApprove
}) => {
  if (!isOpen || !admin) return null

  const getGenderText = (gender: string) => {
    return gender === 'MALE' ? 'مرد' : gender === 'FEMALE' ? 'زن' : 'نامشخص'
  }

  const getRoleText = (role: string) => {
    const roles: { [key: string]: string } = {
      chief: 'مدیر ارشد',
      super_admin: 'سوپر ادمین', 
      admin: 'ادمین'
    }
    return roles[role] || role
  }

  const getAccessLevelText = (accessLevel: string) => {
    const levels: { [key: string]: string } = {
      full: 'دسترسی کامل',
      advanced: 'پیشرفته',
      medium: 'متوسط', 
      basic: 'پایه'
    }
    return levels[accessLevel] || accessLevel
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">فعال</span>
    ) : (
      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">غیرفعال</span>
    )
  }

  const getApprovalBadge = (isApproved: boolean) => {
    return isApproved ? (
      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">تأیید شده</span>
    ) : (
      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">در انتظار تأیید</span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR')
  }

  const isChiefAdmin = currentAdmin?.role === 'chief'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* هدر مودال */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            مشخصات کامل ادمین
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
          >
            &times;
          </button>
        </div>

        {/* محتوای مودال */}
        <div className="p-6">
          {/* اطلاعات اصلی */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                اطلاعات شخصی
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                    نام کامل
                  </label>
                  <p className="text-gray-900 dark:text-white">{admin.full_name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                    نام کاربری
                  </label>
                  <p className="text-gray-900 dark:text-white">{admin.username}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                    ایمیل
                  </label>
                  <p className="text-gray-900 dark:text-white">{admin.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                    تلفن
                  </label>
                  <p className="text-gray-900 dark:text-white">{admin.phone || 'ثبت نشده'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                    جنسیت
                  </label>
                  <p className="text-gray-900 dark:text-white">{getGenderText(admin.gender)}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                اطلاعات سیستمی
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                    نقش
                  </label>
                  <p className="text-gray-900 dark:text-white">{getRoleText(admin.role)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                    سطح دسترسی
                  </label>
                  <p className="text-gray-900 dark:text-white">{getAccessLevelText(admin.access_level)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                    وضعیت
                  </label>
                  <div className="mt-1">{getStatusBadge(admin.is_active)}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                    وضعیت تأیید
                  </label>
                  <div className="mt-1">{getApprovalBadge(admin.is_approved)}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                    تاریخ ایجاد
                  </label>
                  <p className="text-gray-900 dark:text-white">{formatDate(admin.created_at)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* اطلاعات بانکی - اگر وجود دارد */}
          {(admin.bank_account_number || admin.sheba_number || admin.bank_name) && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                اطلاعات بانکی
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {admin.bank_account_number && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                      شماره حساب
                    </label>
                    <p className="text-gray-900 dark:text-white">{admin.bank_account_number}</p>
                  </div>
                )}

                {admin.sheba_number && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                      شماره شبا
                    </label>
                    <p className="text-gray-900 dark:text-white">{admin.sheba_number}</p>
                  </div>
                )}

                {admin.bank_name && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                      نام بانک
                    </label>
                    <p className="text-gray-900 dark:text-white">{admin.bank_name}</p>
                  </div>
                )}

                {admin.branch_name && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                      نام شعبه
                    </label>
                    <p className="text-gray-900 dark:text-white">{admin.branch_name}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* اطلاعات اضافی */}
          <div className="grid grid-cols-1 gap-4">
            {admin.organizational_position && (
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                  سمت سازمانی
                </label>
                <p className="text-gray-900 dark:text-white">{admin.organizational_position}</p>
              </div>
            )}

            {admin.address && (
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                  آدرس
                </label>
                <p className="text-gray-900 dark:text-white">{admin.address}</p>
              </div>
            )}

            {admin.national_id && (
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                  کد ملی
                </label>
                <p className="text-gray-900 dark:text-white">{admin.national_id}</p>
              </div>
            )}
          </div>
        </div>

        {/* فوتر مودال */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="flex gap-3">
            {/* دکمه تأیید ادمین - فقط برای مدیر ارشد و اگر ادمین تأیید نشده باشد */}
            {isChiefAdmin && onApprove && !admin.is_approved && (
              <button
                onClick={() => onApprove(admin.id)}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white font-medium transition-colors"
              >
                تأیید ادمین
              </button>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 font-medium transition-colors"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  )
}