// frontend/src/app/admin/admins/components/AdminTable/AdminTableRow.tsx
import React from 'react' // ✅ اضافه کردن این خط
import { Admin } from '../../types/admin.types'

interface AdminTableRowProps {
  admin: Admin
  currentAdmin: any
  onShowDetails: (admin: Admin) => void
  onShowActivity: (admin: Admin) => void
  onEditAdmin: (admin: Admin) => void
  getRoleBadge: (role: string) => React.JSX.Element // ✅ اصلاح: React.JSX.Element
  getStatusBadge: (isActive: boolean) => React.JSX.Element // ✅ اصلاح
  getApprovalBadge: (isApproved: boolean) => React.JSX.Element // ✅ اصلاح
  getGenderText: (gender: string) => string
  getAccessLevelBadge: (accessLevel: string) => React.JSX.Element // ✅ اصلاح
  formatDate: (dateString: string) => string
  canModifyAdmin: (targetRole: string) => boolean
}

export const AdminTableRow: React.FC<AdminTableRowProps> = ({
  admin,
  currentAdmin,
  onShowDetails,
  onShowActivity,
  onEditAdmin,
  getRoleBadge,
  getStatusBadge,
  getApprovalBadge,
  getGenderText,
  getAccessLevelBadge,
  formatDate,
  canModifyAdmin
}) => {
  console.log('🟢 AdminTableRow rendered for:', admin.full_name, 'Gender:', admin.gender)

  const handleRowClick = () => {
    console.log('🎯 Row clicked for:', admin.full_name)
    onShowDetails(admin)
  }

  const handleShowActivity = (e: React.MouseEvent) => {
    e.stopPropagation()
    console.log('🎯 Show Activity clicked for:', admin.full_name)
    onShowActivity(admin)
  }

  const handleEditAdmin = (e: React.MouseEvent) => {
    e.stopPropagation()
    console.log('🎯 Edit Admin clicked for:', admin.full_name)
    onEditAdmin(admin)
  }

  // آواتار بر اساس جنسیت
  const getAvatar = () => {
    if (admin.profile_image) {
      return (
        <img 
          src={admin.profile_image} 
          alt={admin.full_name}
          className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
        />
      )
    }
    
    // ✅ اصلاح: استفاده از مقادیر واقعی سرور
    const bgColor = admin.gender === 'FEMALE' ? 'bg-pink-100 dark:bg-pink-900' : 'bg-blue-100 dark:bg-blue-900'
    const textColor = admin.gender === 'FEMALE' ? 'text-pink-600 dark:text-pink-300' : 'text-blue-600 dark:text-blue-300'
    const icon = admin.gender === 'FEMALE' ? '👩' : '👨'
    
    return (
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${bgColor} border-2 border-gray-200 dark:border-gray-600`}>
        <span className={`text-lg ${textColor}`}>{icon}</span>
      </div>
    )
  }

  // ✅ اصلاح: استفاده از string literal
  const isChiefAdmin = currentAdmin?.role === 'chief'

  return (
    <tr 
      key={admin.id} 
      className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer border-b border-gray-200 dark:border-gray-700"
      onClick={handleRowClick}
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          {getAvatar()}
          <div className="min-w-0 flex-1">
            <div className="font-medium text-gray-900 dark:text-white truncate">
              {admin.full_name}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {admin.username}
            </div>
            {admin.organizational_position && (
              <div className="text-xs text-gray-400 dark:text-gray-500 truncate">
                {admin.organizational_position}
              </div>
            )}
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4">
        <div className="text-sm space-y-1">
          <div className="text-gray-900 dark:text-white truncate">{admin.email}</div>
          {admin.phone && (
            <div className="text-gray-500 dark:text-gray-400">
              {isChiefAdmin ? admin.phone : '***' + admin.phone.slice(-3)}
            </div>
          )}
        </div>
      </td>
      
      <td className="px-6 py-4">
        <div className="space-y-1">
          {getRoleBadge(admin.role)}
          {getAccessLevelBadge(admin.access_level || 'basic')} {/* ✅ اضافه کردن مقدار پیش‌فرض */}
        </div>
      </td>
      
      <td className="px-6 py-4">
        <div className="space-y-1">
          {getStatusBadge(admin.is_active)}
          {getApprovalBadge(admin.is_approved)}
        </div>
      </td>
      
      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
        {getGenderText(admin.gender)}
      </td>
      
      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
        {formatDate(admin.created_at)}
      </td>
      
      <td className="px-6 py-4">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleShowActivity}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs text-white transition-colors shadow-sm"
            title="مشاهده تاریخچه فعالیت"
          >
            فعالیت‌ها
          </button>

          <button
            onClick={handleEditAdmin}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs text-white transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={!canModifyAdmin(admin.role)}
            title={canModifyAdmin(admin.role) ? "ویرایش اطلاعات ادمین" : "شما دسترسی ویرایش این ادمین را ندارید"}
          >
            ویرایش
          </button>

          {isChiefAdmin && admin.role !== 'chief' && ( // ✅ اصلاح: استفاده از string literal
            <button
              onClick={(e) => {
                e.stopPropagation()
                // TODO: اضافه کردن عملکرد حذف
                console.log('🗑️ Delete admin:', admin.id)
              }}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs text-white transition-colors shadow-sm"
              title="حذف ادمین"
            >
              حذف
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}