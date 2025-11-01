// frontend/src/app/admin/admins/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Shield, 
  Crown, 
  Search,
  Edit,
  Plus,
  Key,
  RefreshCw,
  AlertCircle,
  XCircle,
  CheckCircle,
  Mail,
  Phone,
  IdCard,
  Calendar,
  LogOut,
  Sun,
  Moon,
  ArrowLeft,
  Settings,
  CheckSquare,
  Square
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';

interface Admin {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  national_id: string;
  role: string;
  access_grade: 'chief' | 'grade1' | 'grade2' | 'grade3';
  is_active: boolean;
  needs_approval: boolean;
  balance: number;
  created_at: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface AdminPermissions {
  id: number;
  admin_id: number;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

const PERMISSIONS: Permission[] = [
  // مدیریت ادمین‌ها
  {
    id: 'create_admin',
    name: 'ایجاد کاربر ادمین جدید',
    description: 'اجازه ایجاد ادمین جدید در سیستم',
    category: 'مدیریت ادمین‌ها'
  },
  {
    id: 'approve_admin',
    name: 'تأیید کاربر ادمین جدید',
    description: 'اجازه تأیید ادمین‌های در انتظار تأیید',
    category: 'مدیریت ادمین‌ها'
  },
  {
    id: 'toggle_admin_active',
    name: 'فعال‌سازی و غیرفعال‌سازی کاربر ادمین',
    description: 'اجازه فعال و غیرفعال کردن ادمین‌ها',
    category: 'مدیریت ادمین‌ها'
  },
  {
    id: 'edit_admin_info',
    name: 'ویرایش اطلاعات کاربران ادمین',
    description: 'اجازه ویرایش اطلاعات ادمین‌ها',
    category: 'مدیریت ادمین‌ها'
  },
  {
    id: 'reset_admin_password',
    name: 'ریست رمز عبور ادمین',
    description: 'اجازه ریست رمز عبور ادمین‌ها',
    category: 'مدیریت ادمین‌ها'
  },

  // مدیریت کاربران عادی
  {
    id: 'view_users',
    name: 'مشاهده اطلاعات کاربران عادی',
    description: 'اجازه مشاهده لیست و اطلاعات کاربران عادی',
    category: 'مدیریت کاربران'
  },
  {
    id: 'edit_users',
    name: 'ویرایش اطلاعات کاربران عادی',
    description: 'اجازه ویرایش اطلاعات کاربران عادی',
    category: 'مدیریت کاربران'
  },

  // پشتیبانی و اطلاع‌رسانی
  {
    id: 'view_tickets',
    name: 'مشاهده تیکت‌ها و اعلان‌ها',
    description: 'اجازه مشاهده تیکت‌های پشتیبانی و اعلان‌ها',
    category: 'پشتیبانی'
  },
  {
    id: 'manage_tickets',
    name: 'پاسخ به تیکت‌ها و ارسال اعلان و ایمیل',
    description: 'اجازه پاسخ به تیکت‌ها و ارسال اطلاع‌رسانی',
    category: 'پشتیبانی'
  },

  // مالی و تراکنش‌ها
  {
    id: 'view_wallets',
    name: 'مشاهده کیف پول کاربران عادی',
    description: 'اجازه مشاهده موجودی و کیف پول کاربران',
    category: 'مالی'
  },
  {
    id: 'view_deposit_withdraw',
    name: 'مشاهده تاریخچه واریز و برداشت',
    description: 'اجازه مشاهده تاریخچه واریز و برداشت کاربران',
    category: 'مالی'
  },
  {
    id: 'view_portfolios',
    name: 'مشاهده تاریخچه پورتفوهای کاربران',
    description: 'اجازه مشاهده سبدهای سرمایه‌گذاری کاربران',
    category: 'مالی'
  },
  {
    id: 'view_trades',
    name: 'مشاهده تاریخچه معاملات کاربران',
    description: 'اجازه مشاهده تاریخچه معاملات کاربران عادی',
    category: 'مالی'
  }
];

const AdminManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'inactive'>('all');
  const [gradeFilter, setGradeFilter] = useState<'all' | 'chief' | 'grade1' | 'grade2' | 'grade3'>('all');
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [selectedAdminForPermission, setSelectedAdminForPermission] = useState<Admin | null>(null);
  const [adminPermissions, setAdminPermissions] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  // State برای ایجاد ادمین جدید
  const [newAdmin, setNewAdmin] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    national_id: '',
    password: '',
    access_grade: 'grade3' as 'grade1' | 'grade2' | 'grade3'
  });

  // State برای ویرایش ادمین
  const [editAdmin, setEditAdmin] = useState({
    id: 0,
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    national_id: '',
    access_grade: 'grade3' as 'grade1' | 'grade2' | 'grade3'
  });

  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const API_BASE = 'http://localhost:8000';

  useEffect(() => {
    // بررسی تم ذخیره شده
    const savedTheme = localStorage.getItem('admin_theme');
    const initialTheme = savedTheme ? savedTheme === 'dark' : true;
    setIsDarkMode(initialTheme);
    applyThemeToDocument(initialTheme);

    // دریافت اطلاعات کاربر
    fetchCurrentUser();
    
    // بروزرسانی زمان
    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const applyThemeToDocument = (dark: boolean) => {
    const html = document.documentElement;
    
    if (dark) {
      html.classList.add('dark');
      html.classList.remove('light');
      html.style.colorScheme = 'dark';
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      html.classList.add('light');
      html.classList.remove('dark');
      html.style.colorScheme = 'light';
      document.body.classList.add('light');
      document.body.classList.remove('light');
    }
  };

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('admin_theme', newTheme ? 'dark' : 'light');
    applyThemeToDocument(newTheme);
  };

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const response = await fetch('http://localhost:8000/api/auth/admin/check-access', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setCurrentUser(data.user);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    }
  };

  const updateDateTime = () => {
    const now = new Date();
    
    const time = now.toLocaleTimeString('fa-IR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
    setCurrentTime(time);
    
    const jalaliDate = now.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
    setCurrentDate(jalaliDate);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_theme');
    router.push('/admin/login');
  };

  // Fetch admins
  const { data: admins = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admins'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('توکن یافت نشد');

      const response = await fetch(`${API_BASE}/api/admin/admins`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`خطا در دریافت ادمین‌ها: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    },
    retry: 1,
  });

  // Fetch pending approvals
  const { data: pendingAdmins = [] } = useQuery({
    queryKey: ['pending-admins'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('توکن یافت نشد');

      const response = await fetch(`${API_BASE}/api/admin/pending-approvals`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        return [];
      }
      
      return response.json();
    },
    retry: 1,
  });

  // Calculate stats from admins data
  const stats = React.useMemo(() => {
    const totalAdmins = admins.length;
    const activeAdmins = admins.filter((admin: Admin) => admin.is_active && !admin.needs_approval).length;
    const pendingCount = pendingAdmins.length;
    const chiefCount = admins.filter((admin: Admin) => 
      admin.access_grade === 'chief' && admin.is_active && !admin.needs_approval
    ).length;

    return {
      total_admins: totalAdmins,
      active_admins: activeAdmins,
      pending_approvals: pendingCount,
      chief_count: chiefCount,
    };
  }, [admins, pendingAdmins]);

  // ایجاد ادمین جدید
  const createAdminMutation = useMutation({
    mutationFn: async (adminData: any) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/api/admin/create-admin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adminData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'خطای سرور' }));
        throw new Error(errorData.detail || 'خطا در ایجاد ادمین');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      setShowCreateModal(false);
      setNewAdmin({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        phone: '',
        national_id: '',
        password: '',
        access_grade: 'grade3'
      });
      alert('ادمین جدید با موفقیت ایجاد شد و در انتظار تأیید است');
    },
    onError: (error: any) => {
      alert(error.message);
    },
  });

  // ویرایش ادمین
  const editAdminMutation = useMutation({
    mutationFn: async ({ adminId, adminData }: { adminId: number; adminData: any }) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/api/admin/update-admin/${adminId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adminData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'خطای سرور' }));
        throw new Error(errorData.detail || 'خطا در ویرایش ادمین');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      setShowEditModal(false);
      alert('اطلاعات ادمین با موفقیت ویرایش شد');
    },
    onError: (error: any) => {
      alert(error.message);
    },
  });

  // تأیید ادمین
  const approveAdminMutation = useMutation({
    mutationFn: async (adminId: number) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/api/admin/approve-admin/${adminId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'خطای سرور' }));
        throw new Error(errorData.detail || 'خطا در تأیید ادمین');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins', 'pending-admins'] });
      setShowAdminModal(false);
      alert('ادمین با موفقیت تأیید و فعال شد');
    },
    onError: (error: any) => {
      alert(error.message);
    },
  });

  // تغییر سطح دسترسی
  const changeGradeMutation = useMutation({
    mutationFn: async ({ adminId, newGrade }: { adminId: number; newGrade: string }) => {
      const token = localStorage.getItem('auth_token');
      
      if (newGrade === 'grade1') {
        const response = await fetch(`${API_BASE}/api/admin/demote-to-grade1/${adminId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ detail: 'خطای سرور' }));
          throw new Error(errorData.detail || 'خطا در تغییر سطح دسترسی');
        }
        return response.json();
      }
      
      throw new Error('تغییر سطح دسترسی در حال حاضر فقط برای تبدیل Chief به Grade1 پشتیبانی می‌شود');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      setActionLoading('');
      setShowAdminModal(false);
    },
    onError: (error: any) => {
      setActionLoading('');
      alert(error.message);
    },
  });

  // فعال/غیرفعال کردن ادمین
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ adminId, active }: { adminId: number; active: boolean }) => {
      const token = localStorage.getItem('auth_token');
      const endpoint = active ? 'activate-admin' : 'deactivate-admin';
      const response = await fetch(`${API_BASE}/api/admin/${endpoint}/${adminId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'خطای سرور' }));
        throw new Error(errorData.detail || 'خطا در تغییر وضعیت ادمین');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      setActionLoading('');
      setShowAdminModal(false);
    },
    onError: (error: any) => {
      setActionLoading('');
      alert(error.message);
    },
  });

  // ریست رمز عبور
  const resetPasswordMutation = useMutation({
    mutationFn: async (adminId: number) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/api/admin/reset-password/${adminId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'خطای سرور' }));
        throw new Error(errorData.detail || 'خطا در ریست رمز عبور');
      }
      
      return response.json();
    },
    onSuccess: (data: any) => {
      setActionLoading('');
      alert(data.message || 'رمز عبور با موفقیت ریست شد');
      setShowAdminModal(false);
    },
    onError: (error: any) => {
      setActionLoading('');
      alert(error.message);
    },
  });

  // مدیریت دسترسی‌ها
  const fetchAdminPermissions = async (adminId: number) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/api/admin/permissions/${adminId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setAdminPermissions(data.permissions || []);
      } else {
        setAdminPermissions([]);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setAdminPermissions([]);
    }
  };

  const updateAdminPermissionsMutation = useMutation({
    mutationFn: async ({ adminId, permissions }: { adminId: number; permissions: string[] }) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/api/admin/permissions/${adminId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ permissions }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'خطای سرور' }));
        throw new Error(errorData.detail || 'خطا در بروزرسانی دسترسی‌ها');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      setShowPermissionModal(false);
      alert('دسترسی‌ها با موفقیت بروزرسانی شد');
    },
    onError: (error: any) => {
      alert(error.message);
    },
  });

  const handlePermissionToggle = (permissionId: string) => {
    setAdminPermissions(prev => 
      prev.includes(permissionId) 
        ? prev.filter(p => p !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleOpenPermissionModal = (admin: Admin) => {
    setSelectedAdminForPermission(admin);
    fetchAdminPermissions(admin.id);
    setShowPermissionModal(true);
  };

  const handleSavePermissions = () => {
    if (selectedAdminForPermission) {
      updateAdminPermissionsMutation.mutate({
        adminId: selectedAdminForPermission.id,
        permissions: adminPermissions
      });
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'chief': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'grade1': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'grade2': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'grade3': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getGradeIcon = (grade: string) => {
    switch (grade) {
      case 'chief': return <Crown className="w-4 h-4" />;
      case 'grade1': return <Shield className="w-4 h-4" />;
      case 'grade2': return <Users className="w-4 h-4" />;
      case 'grade3': return <Users className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getGradeText = (grade: string) => {
    switch (grade) {
      case 'chief': return 'مدیر ارشد';
      case 'grade1': return 'سطح ۱';
      case 'grade2': return 'سطح ۲';
      case 'grade3': return 'سطح ۳';
      default: return grade;
    }
  };

  // بررسی دسترسی کاربر فعلی
  const canCreateAdmin = () => {
    return currentUser && (currentUser.access_grade === 'grade1' || currentUser.role === 'super_admin');
  };

  const canEditAdmin = (admin: Admin) => {
    if (!currentUser) return false;
    if (currentUser.id === admin.id) return false;
    return currentUser.access_grade === 'grade1' || currentUser.access_grade === 'grade2';
  };

  const canResetPassword = (admin: Admin) => {
    if (!currentUser) return false;
    if (currentUser.id === admin.id) return false;
    return currentUser.access_grade === 'grade1' || currentUser.access_grade === 'grade2';
  };

  const canToggleActive = (admin: Admin) => {
    if (!currentUser) return false;
    if (currentUser.id === admin.id) return false;
    return currentUser.access_grade === 'grade1';
  };

  const canApproveAdmin = (admin: Admin) => {
    if (!currentUser) return false;
    if (currentUser.id === admin.id) return false;
    return currentUser.access_grade === 'grade1' || currentUser.access_grade === 'grade2';
  };

  const canManagePermissions = (admin: Admin) => {
    if (!currentUser) return false;
    if (currentUser.id === admin.id) return false;
    return currentUser.access_grade === 'chief' || currentUser.access_grade === 'grade1';
  };

  // Filter admins based on search and filters
  const filteredAdmins = admins.filter((admin: Admin) => {
    const matchesSearch = 
      admin.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.phone?.includes(searchTerm) ||
      admin.username?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'active' && admin.is_active && !admin.needs_approval) ||
      (statusFilter === 'pending' && admin.needs_approval) ||
      (statusFilter === 'inactive' && !admin.is_active);

    const matchesGrade = 
      gradeFilter === 'all' || admin.access_grade === gradeFilter;

    return matchesSearch && matchesStatus && matchesGrade;
  });

  const handleViewAdmin = (admin: Admin) => {
    setSelectedAdmin(admin);
    setShowAdminModal(true);
  };

  const handleEditAdmin = (admin: Admin) => {
    setEditAdmin({
      id: admin.id,
      username: admin.username,
      email: admin.email,
      first_name: admin.first_name,
      last_name: admin.last_name,
      phone: admin.phone,
      national_id: admin.national_id,
      access_grade: admin.access_grade
    });
    setShowEditModal(true);
  };

  const handleCreateAdmin = () => {
    createAdminMutation.mutate(newAdmin);
  };

  const handleUpdateAdmin = () => {
    editAdminMutation.mutate({
      adminId: editAdmin.id,
      adminData: editAdmin
    });
  };

  const handleApproveAdmin = (adminId: number) => {
    if (window.confirm('آیا از تأیید این ادمین مطمئن هستید؟')) {
      approveAdminMutation.mutate(adminId);
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className={isDarkMode ? 'text-white' : 'text-gray-900'}>در حال بارگذاری ادمین‌ها...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-center h-64 flex-col">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <div className={isDarkMode ? 'text-red-400 text-lg' : 'text-red-600 text-lg'}>خطا در بارگذاری داده‌ها</div>
          <div className={isDarkMode ? 'text-gray-400 mt-2' : 'text-gray-600 mt-2'}>{(error as Error).message}</div>
          <button 
            onClick={() => refetch()}
            className={`mt-4 px-4 py-2 rounded-lg flex items-center transition-colors ${
              isDarkMode 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            <RefreshCw className="w-4 h-4 ml-2" />
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* هدر یکپارچه */}
      <header className={`border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4 sm:p-6`}>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          {/* سمت راست - لوگو و اطلاعات */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/admin/dashboard')}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 relative">
                <Image
                  src="/logo/parsagold-main-logo.png"
                  alt="پارسا گلد"
                  width={40}
                  height={40}
                  className="object-contain"
                  priority
                />
              </div>
              <div>
                <h1 className="text-xl font-bold">پارسا گلد - مدیریت ادمین‌ها</h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  مدیریت کامل حساب‌های مدیریتی سیستم
                </p>
              </div>
            </div>
          </div>

          {/* وسط - تاریخ و زمان */}
          <div className={`px-4 py-2 rounded-lg border text-center ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="text-lg font-bold text-blue-500">{currentTime}</div>
            <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {currentDate}
            </div>
          </div>

          {/* سمت چپ - اطلاعات کاربر و دکمه‌ها */}
          <div className="flex items-center gap-4">
            {/* اطلاعات کاربر */}
            {currentUser && (
              <div className={`flex items-center gap-3 px-4 py-2 rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {currentUser.first_name?.[0]}{currentUser.last_name?.[0]}
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {currentUser.first_name} {currentUser.last_name}
                  </div>
                  <div className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    @{currentUser.username}
                  </div>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(currentUser.access_grade || currentUser.role)}`}>
                  <Shield className="w-3 h-3 ml-1" />
                  {getGradeText(currentUser.access_grade || currentUser.role)}
                </span>
              </div>
            )}

            {/* دکمه تغییر تم */}
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              aria-label="تغییر تم"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* دکمه خروج */}
            <button 
              onClick={handleLogout}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
              aria-label="خروج از سیستم"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard 
            title="کل ادمین‌ها" 
            value={stats.total_admins} 
            icon="🛡️" 
            subtitle={`${stats.active_admins} فعال`}
            color="blue"
            isDarkMode={isDarkMode}
          />
          <StatCard 
            title="ادمین‌های فعال" 
            value={stats.active_admins} 
            icon="✅" 
            subtitle={`${stats.total_admins - stats.active_admins} غیرفعال`}
            color="green"
            isDarkMode={isDarkMode}
          />
          <StatCard 
            title="در انتظار تأیید" 
            value={stats.pending_approvals} 
            icon="⏳" 
            subtitle="نیازمند تأیید"
            color="yellow"
            isDarkMode={isDarkMode}
          />
          <StatCard 
            title="مدیران ارشد" 
            value={stats.chief_count} 
            icon="👑" 
            subtitle="دسترسی کامل"
            color="purple"
            isDarkMode={isDarkMode}
          />
        </div>

        {/* Filters and Search */}
        <div className={`p-4 sm:p-6 rounded-lg border transition-colors ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="جستجو بر اساس نام، ایمیل، شماره تماس..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pr-10 pl-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">همه وضعیت‌ها</option>
                <option value="active">فعال</option>
                <option value="pending">در انتظار تأیید</option>
                <option value="inactive">غیرفعال</option>
              </select>

              {/* Grade Filter */}
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value as any)}
                className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">همه سطوح</option>
                <option value="chief">مدیر ارشد</option>
                <option value="grade1">سطح ۱</option>
                <option value="grade2">سطح ۲</option>
                <option value="grade3">سطح ۳</option>
              </select>
            </div>
          </div>
        </div>

        {/* دکمه‌های action */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">لیست ادمین‌ها</h2>
            <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              مدیریت کامل حساب‌های مدیریتی سیستم
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => refetch()}
              className={`px-4 py-2 rounded-lg flex items-center transition-colors ${
                isDarkMode 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              <RefreshCw className="w-4 h-4 ml-2" />
              بروزرسانی
            </button>
            
            {/* دکمه ایجاد ادمین جدید - فقط برای سطح 1 و سوپر ادمین */}
            {canCreateAdmin() && (
              <button 
                onClick={() => setShowCreateModal(true)}
                className={`px-4 py-2 rounded-lg flex items-center transition-colors ${
                  isDarkMode 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                <Plus className="w-4 h-4 ml-2" />
                ایجاد ادمین جدید
              </button>
            )}
          </div>
        </div>

        {/* Admins Table */}
        <div className={`rounded-lg border overflow-hidden transition-colors ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-500'}>ادمین</span>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-500'}>سطح دسترسی</span>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-500'}>وضعیت</span>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-500'}>تاریخ ایجاد</span>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-500'}>اقدامات</span>
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${
                isDarkMode ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white'
              }`}>
                {filteredAdmins.map((admin: Admin) => (
                  <tr 
                    key={admin.id} 
                    className={`transition-colors ${
                      isDarkMode ? 'hover:bg-gray-750' : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                          isDarkMode ? 'bg-blue-900' : 'bg-blue-100'
                        }`}>
                          <Users className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                        </div>
                        <div className="mr-4">
                          <div className="text-sm font-medium">
                            {admin.first_name} {admin.last_name}
                          </div>
                          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {admin.email}
                          </div>
                          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {admin.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGradeColor(admin.access_grade)}`}>
                        {getGradeIcon(admin.access_grade)}
                        <span className="mr-1">{getGradeText(admin.access_grade)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {admin.needs_approval ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                            <UserCheck className="w-3 h-3 ml-1" />
                            در انتظار تأیید
                          </span>
                        ) : admin.is_active ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            <CheckCircle className="w-3 h-3 ml-1" />
                            فعال
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                            <UserX className="w-3 h-3 ml-1" />
                            غیرفعال
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                        {new Date(admin.created_at).toLocaleDateString('fa-IR')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-wrap gap-2">
                        {/* دکمه مشاهده جزئیات */}
                        <button 
                          onClick={() => handleViewAdmin(admin)}
                          className={`inline-flex items-center px-3 py-1 rounded-md text-sm transition-colors ${
                            isDarkMode
                              ? 'bg-blue-900 text-blue-300 hover:bg-blue-800'
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          }`}
                        >
                          <Edit className="w-3 h-3 ml-1" />
                          مشاهده
                        </button>
                        
                        {/* دکمه ویرایش - برای سطح 1 و 2 */}
                        {canEditAdmin(admin) && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditAdmin(admin);
                            }}
                            className={`inline-flex items-center px-3 py-1 rounded-md text-sm transition-colors ${
                              isDarkMode
                                ? 'bg-green-900 text-green-300 hover:bg-green-800'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            <Edit className="w-3 h-3 ml-1" />
                            ویرایش
                          </button>
                        )}
                        
                        {/* دکمه ریست رمز عبور - برای سطح 1 و 2 */}
                        {canResetPassword(admin) && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`آیا از ریست رمز عبور "${admin.first_name} ${admin.last_name}" مطمئن هستید؟`)) {
                                setActionLoading('reset-password');
                                resetPasswordMutation.mutate(admin.id);
                              }
                            }}
                            disabled={actionLoading === 'reset-password'}
                            className={`inline-flex items-center px-3 py-1 rounded-md text-sm transition-colors ${
                              isDarkMode
                                ? 'bg-red-900 text-red-300 hover:bg-red-800'
                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                            } disabled:opacity-50`}
                          >
                            <Key className="w-3 h-3 ml-1" />
                            ریست رمز
                          </button>
                        )}
                        
                        {/* دکمه فعال/غیرفعال - فقط برای سطح 1 */}
                        {canToggleActive(admin) && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              const action = admin.is_active ? 'غیرفعال' : 'فعال';
                              if (window.confirm(`آیا از ${action} کردن "${admin.first_name} ${admin.last_name}" مطمئن هستید؟`)) {
                                setActionLoading('toggle-active');
                                toggleActiveMutation.mutate({ 
                                  adminId: admin.id, 
                                  active: !admin.is_active 
                                });
                              }
                            }}
                            disabled={actionLoading === 'toggle-active'}
                            className={`inline-flex items-center px-3 py-1 rounded-md text-sm transition-colors ${
                              isDarkMode
                                ? 'bg-orange-900 text-orange-300 hover:bg-orange-800'
                                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                            } disabled:opacity-50`}
                          >
                            {admin.is_active ? <UserX className="w-3 h-3 ml-1" /> : <UserCheck className="w-3 h-3 ml-1" />}
                            {admin.is_active ? 'غیرفعال' : 'فعال'}
                          </button>
                        )}
                        
                        {/* دکمه تأیید ادمین - برای سطح 1 و 2 */}
                        {admin.needs_approval && canApproveAdmin(admin) && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`آیا از تأیید "${admin.first_name} ${admin.last_name}" مطمئن هستید؟`)) {
                                approveAdminMutation.mutate(admin.id);
                              }
                            }}
                            className={`inline-flex items-center px-3 py-1 rounded-md text-sm transition-colors ${
                              isDarkMode
                                ? 'bg-green-900 text-green-300 hover:bg-green-800'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            <CheckCircle className="w-3 h-3 ml-1" />
                            تأیید
                          </button>
                        )}
                        
                        {/* دکمه تعیین دسترسی‌ها - برای مدیر ارشد و سطح 1 */}
                        {canManagePermissions(admin) && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenPermissionModal(admin);
                            }}
                            className={`inline-flex items-center px-3 py-1 rounded-md text-sm transition-colors ${
                              isDarkMode
                                ? 'bg-purple-900 text-purple-300 hover:bg-purple-800'
                                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                            }`}
                          >
                            <Settings className="w-3 h-3 ml-1" />
                            دسترسی‌ها
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAdmins.length === 0 && (
            <div className="text-center py-12">
              <Users className={`mx-auto h-12 w-12 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              <h3 className={`mt-2 text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                ادمینی یافت نشد
              </h3>
              <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {admins.length === 0 
                  ? 'هنوز هیچ ادمینی در سیستم ثبت نشده است.' 
                  : 'هیچ ادمینی با فیلترهای انتخاب شده مطابقت ندارد.'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal ایجاد ادمین جدید */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto transition-colors ${
            isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          }`}>
            <div className={`p-6 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">ایجاد ادمین جدید</h3>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className={isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>نام</label>
                <input
                  type="text"
                  value={newAdmin.first_name}
                  onChange={(e) => setNewAdmin({...newAdmin, first_name: e.target.value})}
                  className={`w-full p-2 border rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>نام خانوادگی</label>
                <input
                  type="text"
                  value={newAdmin.last_name}
                  onChange={(e) => setNewAdmin({...newAdmin, last_name: e.target.value})}
                  className={`w-full p-2 border rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>نام کاربری</label>
                <input
                  type="text"
                  value={newAdmin.username}
                  onChange={(e) => setNewAdmin({...newAdmin, username: e.target.value})}
                  className={`w-full p-2 border rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>ایمیل</label>
                <input
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                  className={`w-full p-2 border rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>شماره تماس</label>
                <input
                  type="tel"
                  value={newAdmin.phone}
                  onChange={(e) => setNewAdmin({...newAdmin, phone: e.target.value})}
                  className={`w-full p-2 border rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>کد ملی</label>
                <input
                  type="text"
                  value={newAdmin.national_id}
                  onChange={(e) => setNewAdmin({...newAdmin, national_id: e.target.value})}
                  className={`w-full p-2 border rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>رمز عبور</label>
                <input
                  type="password"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                  className={`w-full p-2 border rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>سطح دسترسی</label>
                <select
                  value={newAdmin.access_grade}
                  onChange={(e) => setNewAdmin({...newAdmin, access_grade: e.target.value as any})}
                  className={`w-full p-2 border rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="grade3">سطح ۳</option>
                  <option value="grade2">سطح ۲</option>
                  <option value="grade1">سطح ۱</option>
                </select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className={`flex-1 px-4 py-2 border rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  انصراف
                </button>
                <button
                  onClick={handleCreateAdmin}
                  disabled={createAdminMutation.isPending}
                  className={`flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors`}
                >
                  {createAdminMutation.isPending ? 'در حال ایجاد...' : 'ایجاد ادمین'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal ویرایش ادمین */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto transition-colors ${
            isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          }`}>
            <div className={`p-6 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">ویرایش ادمین</h3>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className={isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>نام</label>
                <input
                  type="text"
                  value={editAdmin.first_name}
                  onChange={(e) => setEditAdmin({...editAdmin, first_name: e.target.value})}
                  className={`w-full p-2 border rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>نام خانوادگی</label>
                <input
                  type="text"
                  value={editAdmin.last_name}
                  onChange={(e) => setEditAdmin({...editAdmin, last_name: e.target.value})}
                  className={`w-full p-2 border rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>نام کاربری</label>
                <input
                  type="text"
                  value={editAdmin.username}
                  onChange={(e) => setEditAdmin({...editAdmin, username: e.target.value})}
                  className={`w-full p-2 border rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>ایمیل</label>
                <input
                  type="email"
                  value={editAdmin.email}
                  onChange={(e) => setEditAdmin({...editAdmin, email: e.target.value})}
                  className={`w-full p-2 border rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>شماره تماس</label>
                <input
                  type="tel"
                  value={editAdmin.phone}
                  onChange={(e) => setEditAdmin({...editAdmin, phone: e.target.value})}
                  className={`w-full p-2 border rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>کد ملی</label>
                <input
                  type="text"
                  value={editAdmin.national_id}
                  onChange={(e) => setEditAdmin({...editAdmin, national_id: e.target.value})}
                  className={`w-full p-2 border rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>سطح دسترسی</label>
                <select
                  value={editAdmin.access_grade}
                  onChange={(e) => setEditAdmin({...editAdmin, access_grade: e.target.value as any})}
                  className={`w-full p-2 border rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="grade3">سطح ۳</option>
                  <option value="grade2">سطح ۲</option>
                  <option value="grade1">سطح ۱</option>
                </select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className={`flex-1 px-4 py-2 border rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  انصراف
                </button>
                <button
                  onClick={handleUpdateAdmin}
                  disabled={editAdminMutation.isPending}
                  className={`flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors`}
                >
                  {editAdminMutation.isPending ? 'در حال ویرایش...' : 'ذخیره تغییرات'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal مدیریت دسترسی‌ها */}
      {showPermissionModal && selectedAdminForPermission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto transition-colors ${
            isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          }`}>
            <div className={`p-6 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">مدیریت دسترسی‌ها</h3>
                  <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {selectedAdminForPermission.first_name} {selectedAdminForPermission.last_name}
                  </p>
                </div>
                <button 
                  onClick={() => setShowPermissionModal(false)}
                  className={isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {PERMISSIONS.map(permission => (
                  <div 
                    key={permission.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      adminPermissions.includes(permission.id)
                        ? isDarkMode 
                          ? 'bg-green-900 border-green-700' 
                          : 'bg-green-50 border-green-200'
                        : isDarkMode 
                          ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={() => handlePermissionToggle(permission.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{permission.name}</span>
                      {adminPermissions.includes(permission.id) ? (
                        <CheckSquare className="w-4 h-4 text-green-500" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <p className={`text-xs ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {permission.description}
                    </p>
                    <span className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
                      isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {permission.category}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowPermissionModal(false)}
                  className={`flex-1 px-4 py-2 border rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  انصراف
                </button>
                <button
                  onClick={handleSavePermissions}
                  disabled={updateAdminPermissionsMutation.isPending}
                  className={`flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors`}
                >
                  {updateAdminPermissionsMutation.isPending ? 'در حال ذخیره...' : 'ذخیره دسترسی‌ها'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Details Modal */}
      {showAdminModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-colors ${
            isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          }`}>
            <div className={`p-6 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">مشخصات ادمین</h3>
                <button 
                  onClick={() => setShowAdminModal(false)}
                  className={isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* اطلاعات پایه */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>نام و نام خانوادگی</label>
                  <div className={`p-2 rounded border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}>
                    {selectedAdmin.first_name} {selectedAdmin.last_name}
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>نام کاربری</label>
                  <div className={`p-2 rounded border flex items-center ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <IdCard className="w-4 h-4 ml-2 text-gray-400" />
                    {selectedAdmin.username}
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>ایمیل</label>
                  <div className={`p-2 rounded border flex items-center ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <Mail className="w-4 h-4 ml-2 text-gray-400" />
                    {selectedAdmin.email}
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>شماره تماس</label>
                  <div className={`p-2 rounded border flex items-center ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <Phone className="w-4 h-4 ml-2 text-gray-400" />
                    {selectedAdmin.phone}
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>کد ملی</label>
                  <div className={`p-2 rounded border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}>
                    {selectedAdmin.national_id}
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>سطح دسترسی</label>
                  <div className={`p-2 rounded border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGradeColor(selectedAdmin.access_grade)}`}>
                      {getGradeIcon(selectedAdmin.access_grade)}
                      <span className="mr-1">{getGradeText(selectedAdmin.access_grade)}</span>
                    </span>
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>تاریخ ایجاد</label>
                  <div className={`p-2 rounded border flex items-center ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <Calendar className="w-4 h-4 ml-2 text-gray-400" />
                    {new Date(selectedAdmin.created_at).toLocaleDateString('fa-IR')}
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>وضعیت</label>
                  <div className="p-2">
                    {selectedAdmin.needs_approval ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                        <UserCheck className="w-3 h-3 ml-1" />
                        در انتظار تأیید
                      </span>
                    ) : selectedAdmin.is_active ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        <CheckCircle className="w-3 h-3 ml-1" />
                        فعال
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                        <UserX className="w-3 h-3 ml-1" />
                        غیرفعال
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* اقدامات */}
              <div className={`border-t pt-6 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h4 className="font-medium mb-4">مدیریت ادمین</h4>
                <div className="flex flex-wrap gap-3">
                  {/* تأیید ادمین - برای سطح 1 و 2 */}
                  {selectedAdmin.needs_approval && canApproveAdmin(selectedAdmin) && (
                    <button
                      onClick={() => handleApproveAdmin(selectedAdmin.id)}
                      className="flex items-center px-4 py-2 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4 ml-2" />
                      تأیید ادمین
                    </button>
                  )}

                  {/* ویرایش ادمین - برای سطح 1 و 2 */}
                  {canEditAdmin(selectedAdmin) && (
                    <button
                      onClick={() => handleEditAdmin(selectedAdmin)}
                      className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                    >
                      <Edit className="w-4 h-4 ml-2" />
                      ویرایش اطلاعات
                    </button>
                  )}

                  {/* ریست رمز عبور - برای سطح 1 و 2 */}
                  {canResetPassword(selectedAdmin) && (
                    <button
                      onClick={() => {
                        if (window.confirm(`آیا از ریست رمز عبور "${selectedAdmin.first_name} ${selectedAdmin.last_name}" مطمئن هستید؟`)) {
                          setActionLoading('reset-password');
                          resetPasswordMutation.mutate(selectedAdmin.id);
                        }
                      }}
                      disabled={actionLoading === 'reset-password'}
                      className="flex items-center px-4 py-2 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 disabled:opacity-50 transition-colors"
                    >
                      <Key className="w-4 h-4 ml-2" />
                      {actionLoading === 'reset-password' ? 'در حال ریست...' : 'ریست رمز عبور'}
                    </button>
                  )}

                  {/* فعال/غیرفعال کردن - فقط برای سطح 1 */}
                  {canToggleActive(selectedAdmin) && (
                    <button
                      onClick={() => {
                        const action = selectedAdmin.is_active ? 'غیرفعال' : 'فعال';
                        if (window.confirm(`آیا از ${action} کردن "${selectedAdmin.first_name} ${selectedAdmin.last_name}" مطمئن هستید؟`)) {
                          setActionLoading('toggle-active');
                          toggleActiveMutation.mutate({ 
                            adminId: selectedAdmin.id, 
                            active: !selectedAdmin.is_active 
                          });
                        }
                      }}
                      disabled={actionLoading === 'toggle-active'}
                      className="flex items-center px-4 py-2 bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-800 disabled:opacity-50 transition-colors"
                    >
                      {selectedAdmin.is_active ? <UserX className="w-4 h-4 ml-2" /> : <UserCheck className="w-4 h-4 ml-2" />}
                      {actionLoading === 'toggle-active' ? 'در حال تغییر...' : selectedAdmin.is_active ? 'غیرفعال کردن' : 'فعال کردن'}
                    </button>
                  )}

                  {/* تغییر سطح دسترسی */}
                  {selectedAdmin.access_grade === 'chief' && canToggleActive(selectedAdmin) && (
                    <button
                      onClick={() => {
                        if (window.confirm(`آیا از تغییر سطح دسترسی "${selectedAdmin.first_name} ${selectedAdmin.last_name}" از مدیر ارشد به سطح ۱ مطمئن هستید؟`)) {
                          setActionLoading('change-grade');
                          changeGradeMutation.mutate({ 
                            adminId: selectedAdmin.id, 
                            newGrade: 'grade1' 
                          });
                        }
                      }}
                      disabled={actionLoading === 'change-grade'}
                      className="flex items-center px-4 py-2 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 disabled:opacity-50 transition-colors"
                    >
                      <Shield className="w-4 h-4 ml-2" />
                      {actionLoading === 'change-grade' ? 'در حال تغییر...' : 'تغییر به سطح ۱'}
                    </button>
                  )}

                  {/* مدیریت دسترسی‌ها - برای مدیر ارشد و سطح 1 */}
                  {canManagePermissions(selectedAdmin) && (
                    <button
                      onClick={() => handleOpenPermissionModal(selectedAdmin)}
                      className="flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
                    >
                      <Settings className="w-4 h-4 ml-2" />
                      مدیریت دسترسی‌ها
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// کامپوننت کارت آمار مشابه داشبورد
function StatCard({ title, value, icon, subtitle, color, isDarkMode }: {
  title: string
  value: string | number
  icon: string
  subtitle: string
  color: string
  isDarkMode: boolean
}) {
  const colorClasses = {
    blue: 'hover:border-blue-500',
    green: 'hover:border-green-500',
    purple: 'hover:border-purple-500',
    yellow: 'hover:border-yellow-500'
  }

  const textColors = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    purple: 'text-purple-500', 
    yellow: 'text-yellow-500'
  }

  return (
    <div className={`p-4 sm:p-6 rounded-lg border transition-colors ${
      isDarkMode 
        ? `bg-gray-800 border-gray-700 ${colorClasses[color as keyof typeof colorClasses]}` 
        : `bg-white border-gray-200 ${colorClasses[color as keyof typeof colorClasses]} shadow-sm`
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{title}</h3>
          <p className={`text-2xl sm:text-3xl font-bold ${textColors[color as keyof typeof textColors]}`}>
            {typeof value === 'number' ? new Intl.NumberFormat('fa-IR').format(value) : value}
          </p>
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
      <div className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{subtitle}</div>
    </div>
  )
}

export default AdminManagementPage;
