// frontend/src/app/admin/regular-users/page.tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_BASE_URL = 'http://localhost:8000';

interface RegularUser {
  id: number;
  public_id: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  full_name: string;
  status: string;
  email_verified: boolean;
  phone_verified: boolean;
  created_at: string;
  last_login: string;
  balance: number;
  risk_level: string;
  credit_score: number;
  national_id?: string;
  country?: string;
  city?: string;
}

interface ApiResponse {
  users: RegularUser[];
  total_count?: number;
}

export default function RegularUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<RegularUser | null>(null);
  const queryClient = useQueryClient();

  // دریافت کاربران واقعی از دیتابیس
  const { data: apiResponse, isLoading, error } = useQuery({
    queryKey: ['regularUsers', searchTerm, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const response = await fetch(`${API_BASE_URL}/api/central/regular-users?${params}`);
      if (!response.ok) throw new Error('خطا در دریافت کاربران از سرور');
      return response.json();
    }
  });

  // mutation برای تغییر وضعیت کاربر
  const updateStatusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: number; status: string }) => {
      const response = await fetch(`${API_BASE_URL}/api/central/regular-users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error('خطا در به‌روزرسانی وضعیت');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regularUsers'] });
    }
  });

  // mutation برای تأیید ایمیل
  const verifyEmailMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await fetch(`${API_BASE_URL}/api/central/regular-users/${userId}/verify-email`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('خطا در تأیید ایمیل');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regularUsers'] });
    }
  });

  // mutation برای تأیید تلفن
  const verifyPhoneMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await fetch(`${API_BASE_URL}/api/central/regular-users/${userId}/verify-phone`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('خطا در تأیید تلفن');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regularUsers'] });
    }
  });

  const handleStatusChange = (userId: number, newStatus: string) => {
    updateStatusMutation.mutate({ userId, status: newStatus });
  };

  const handleVerifyEmail = (userId: number) => {
    verifyEmailMutation.mutate(userId);
  };

  const handleVerifyPhone = (userId: number) => {
    verifyPhoneMutation.mutate(userId);
  };

  if (isLoading) return (
    <div className="flex justify-center items-center min-h-64">
      <div className="text-lg">در حال بارگذاری کاربران از دیتابیس...</div>
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center min-h-64">
      <div className="text-red-500 text-lg">خطا: {(error as Error).message}</div>
    </div>
  );

  // درست کردن userList - اگر apiResponse آرایه مستقیم است از آن استفاده کن، در غیر این صورت از apiResponse.users
  const userList: RegularUser[] = Array.isArray(apiResponse) ? apiResponse : (apiResponse?.users || []);

  // محاسبات آماری
  const totalUsers = userList.length;
  const activeUsers = userList.filter(u => u.status === 'active').length;
  const inactiveUsers = userList.filter(u => u.status === 'inactive').length;
  const highRiskUsers = userList.filter(u => u.risk_level === 'high').length;
  const needVerificationUsers = userList.filter(u => !u.email_verified || !u.phone_verified).length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">مدیریت کاربران عادی</h1>
          <p className="text-gray-600 mt-1">
            کاربران ثبت‌نام شده در سیستم: {totalUsers} نفر
          </p>
        </div>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="جستجو بر اساس نام، ایمیل یا تلفن..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="active">فعال</option>
            <option value="inactive">غیرفعال</option>
            <option value="suspended">معلق</option>
            <option value="pending">در انتظار</option>
          </select>
        </div>
      </div>

      {/* آمار کلی */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{totalUsers}</div>
          <div className="text-gray-600">کل کاربران</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">{activeUsers}</div>
          <div className="text-gray-600">کاربران فعال</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-red-600">{inactiveUsers}</div>
          <div className="text-gray-600">غیرفعال</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-yellow-600">{highRiskUsers}</div>
          <div className="text-gray-600">ریسک بالا</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-purple-600">{needVerificationUsers}</div>
          <div className="text-gray-600">نیاز به تأیید</div>
        </div>
      </div>

      {/* پیام زمانی که کاربری وجود ندارد */}
      {userList.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">هیچ کاربری یافت نشد</h3>
          <p className="text-yellow-700">
            {searchTerm || statusFilter !== 'all' 
              ? 'با فیلترهای فعلی هیچ کاربری مطابقت ندارد.' 
              : 'هنوز هیچ کاربری در سیستم ثبت‌نام نکرده است.'}
          </p>
        </div>
      ) : (
        /* جدول کاربران */
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">کاربر</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">اطلاعات تماس</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">موجودی</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">وضعیت</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">اقدامات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {userList.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{user.full_name}</div>
                    <div className="text-sm text-gray-500">ID: {user.public_id}</div>
                    {user.national_id && (
                      <div className="text-sm text-gray-500">کدملی: {user.national_id}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900">{user.email}</div>
                    <div className="text-sm text-gray-500">{user.phone}</div>
                    <div className="flex gap-2 mt-1">
                      {!user.email_verified && (
                        <button
                          onClick={() => handleVerifyEmail(user.id)}
                          disabled={verifyEmailMutation.isPending}
                          className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded hover:bg-yellow-200"
                        >
                          {verifyEmailMutation.isPending ? '...' : 'تأیید ایمیل'}
                        </button>
                      )}
                      {!user.phone_verified && (
                        <button
                          onClick={() => handleVerifyPhone(user.id)}
                          disabled={verifyPhoneMutation.isPending}
                          className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded hover:bg-yellow-200"
                        >
                          {verifyPhoneMutation.isPending ? '...' : 'تأیید تلفن'}
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{user.balance.toLocaleString()} ریال</div>
                    <div className={`text-xs px-2 py-1 rounded mt-1 ${
                      user.risk_level === 'low' ? 'bg-green-100 text-green-800' :
                      user.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      ریسک: {user.risk_level === 'low' ? 'کم' : user.risk_level === 'medium' ? 'متوسط' : 'بالا'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.status}
                      onChange={(e) => handleStatusChange(user.id, e.target.value)}
                      disabled={updateStatusMutation.isPending}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        user.status === 'active' ? 'bg-green-100 text-green-800' :
                        user.status === 'inactive' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      <option value="active">فعال</option>
                      <option value="inactive">غیرفعال</option>
                      <option value="suspended">معلق</option>
                      <option value="pending">در انتظار</option>
                    </select>
                    <div className="text-xs text-gray-500 mt-1">
                      عضویت: {new Date(user.created_at).toLocaleDateString('fa-IR')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        مشاهده جزئیات
                      </button>
                      <button className="text-green-600 hover:text-green-800 text-sm">
                        ویرایش اطلاعات
                      </button>
                      <button className="text-red-600 hover:text-red-800 text-sm">
                        ریست رمز
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* مودال جزئیات کاربر */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">جزئیات کاربر</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><strong>نام کامل:</strong> {selectedUser.full_name}</div>
              <div><strong>ایمیل:</strong> {selectedUser.email}</div>
              <div><strong>تلفن:</strong> {selectedUser.phone}</div>
              <div><strong>کدملی:</strong> {selectedUser.national_id || '---'}</div>
              <div><strong>شهر:</strong> {selectedUser.city || '---'}</div>
              <div><strong>کشور:</strong> {selectedUser.country || '---'}</div>
              <div><strong>موجودی:</strong> {selectedUser.balance.toLocaleString()} ریال</div>
              <div><strong>امتیاز اعتباری:</strong> {selectedUser.credit_score}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}