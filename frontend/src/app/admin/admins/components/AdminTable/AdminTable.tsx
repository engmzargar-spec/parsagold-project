// frontend/src/app/admin/admins/components/AdminTable/AdminTable.tsx
import { Admin } from '../../types/admin.types'
import { AdminTableRow } from './AdminTableRow'

interface AdminTableProps {
  admins: Admin[]
  loading: boolean
  error: string
  currentAdmin: any
  onShowDetails: (admin: Admin) => void
  onShowActivity: (admin: Admin) => void
  onEditAdmin: (admin: Admin) => void
  onRetry: () => void
  getRoleBadge: (role: string) => JSX.Element
  getStatusBadge: (isActive: boolean) => JSX.Element
  getApprovalBadge: (isApproved: boolean) => JSX.Element
  getGenderText: (gender: string) => string
  getAccessLevelBadge: (accessLevel: string) => JSX.Element
  formatDate: (dateString: string) => string
  canModifyAdmin: (targetRole: string) => boolean
}

export const AdminTable: React.FC<AdminTableProps> = ({
  admins,
  loading,
  error,
  currentAdmin,
  onShowDetails,
  onShowActivity,
  onEditAdmin,
  onRetry,
  getRoleBadge,
  getStatusBadge,
  getApprovalBadge,
  getGenderText,
  getAccessLevelBadge,
  formatDate,
  canModifyAdmin
}) => {
  console.log('🟢 AdminTable rendered with:', { 
    adminsCount: admins.length,
    loading,
    error,
    hasOnShowDetails: !!onShowDetails,
    hasOnEditAdmin: !!onEditAdmin
  })

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-gray-600 dark:text-gray-400">در حال بارگذاری ادمین‌ها...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error && admins.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-8 text-center">
          <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
          <button
            onClick={onRetry}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors text-white"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    )
  }

  if (!error && admins.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-8 text-center">
          <div className="text-gray-600 dark:text-gray-400">هیچ ادمینی در سیستم تعریف نشده است</div>
          <button
            onClick={onRetry}
            className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors text-white"
          >
            بارگذاری مجدد
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ادمین</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">اطلاعات تماس</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">نقش و سطح دسترسی</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">وضعیت</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">جنسیت</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">تاریخ ثبت</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {admins.map((admin) => (
              <AdminTableRow
                key={admin.id}
                admin={admin}
                currentAdmin={currentAdmin}
                onShowDetails={onShowDetails}
                onShowActivity={onShowActivity}
                onEditAdmin={onEditAdmin}
                getRoleBadge={getRoleBadge}
                getStatusBadge={getStatusBadge}
                getApprovalBadge={getApprovalBadge}
                getGenderText={getGenderText}
                getAccessLevelBadge={getAccessLevelBadge}
                formatDate={formatDate}
                canModifyAdmin={canModifyAdmin}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
