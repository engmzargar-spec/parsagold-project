# backend/app/services/admin_service.py
import re
from typing import Optional, Dict, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_

class AdminRegistrationService:
    # کدهای تشخیص ادمین از ایمیل
    ADMIN_CODES = {
        "adminpg1357": "admin",
        "superadminpg2468": "super_admin"
    }
    
    # تنظیمات سیستم
    MAX_CHIEF_USERS = 3
    
    @classmethod
    def detect_admin_role_from_email(cls, email: str) -> Optional[str]:
        """
        تشخیص خودکار نقش ادمین بر اساس ایمیل
        
        Args:
            email: ایمیل کاربر
            
        Returns:
            نقش تشخیص داده شده یا None برای کاربر معمولی
        """
        email_lower = email.lower()
        
        for code, role in cls.ADMIN_CODES.items():
            if code in email_lower:
                return role
        return None
    
    @classmethod
    def normalize_email_for_display(cls, email: str) -> str:
        """
        نرمال‌سازی ایمیل برای نمایش (حذف کدهای ادمین)
        """
        email_lower = email.lower()
        
        for code in cls.ADMIN_CODES.keys():
            if code in email_lower:
                # حذف کد از ایمیل برای نمایش
                normalized = email_lower.replace(code, "").strip("@.-_")
                return normalized if normalized else email_lower
        
        return email_lower
    
    @classmethod
    def validate_admin_registration(cls, db: Session, user_data: dict) -> Tuple[bool, Optional[str]]:
        """
        اعتبارسنجی ثبت‌نام ادمین
        
        Args:
            db: session دیتابیس
            user_data: داده‌های کاربر
            
        Returns:
            tuple: (is_valid, error_message)
        """
        try:
            from ..models import User, AccessGrade
            
            # بررسی وجود کاربر با ایمیل، نام کاربری، تلفن یا کد ملی
            existing_user = db.query(User).filter(
                or_(
                    User.email == user_data.get('email'),
                    User.username == user_data.get('username'),
                    User.phone == user_data.get('phone'),
                    User.national_id == user_data.get('national_id')
                )
            ).first()
            
            if existing_user:
                if existing_user.email == user_data.get('email'):
                    return False, "کاربر با این ایمیل قبلاً ثبت شده است"
                elif existing_user.username == user_data.get('username'):
                    return False, "کاربر با این نام کاربری قبلاً ثبت شده است"
                elif existing_user.phone == user_data.get('phone'):
                    return False, "کاربر با این شماره تلفن قبلاً ثبت شده است"
                elif existing_user.national_id == user_data.get('national_id'):
                    return False, "کاربر با این کد ملی قبلاً ثبت شده است"
            
            # بررسی محدودیت Chiefها
            if user_data.get('access_grade') == AccessGrade.CHIEF:
                chief_count = db.query(User).filter(
                    User.access_grade == AccessGrade.CHIEF,
                    User.is_active == True
                ).count()
                
                if chief_count >= cls.MAX_CHIEF_USERS:
                    return False, f"حداکثر {cls.MAX_CHIEF_USERS} Chief در سیستم مجاز است"
            
            return True, None
            
        except Exception as e:
            return False, f"خطا در اعتبارسنجی: {str(e)}"
    
    @classmethod
    def create_admin_user(cls, db: Session, user_data: dict, created_by: Optional[int] = None) -> Dict:
        """
        ایجاد کاربر ادمین با تمام فیلدهای لازم
        
        Args:
            db: session دیتابیس
            user_data: داده‌های کاربر
            created_by: ID کاربر ایجادکننده (برای لاگ)
            
        Returns:
            dict: نتیجه عملیات
        """
        try:
            from ..models import User, UserRole, AccessGrade
            
            # تشخیص نقش از ایمیل
            detected_role = cls.detect_admin_role_from_email(user_data['email'])
            
            # اگر ایمیل حاوی کد ادمین نبود، از user_data استفاده کن
            if not detected_role:
                detected_role = user_data.get('role', 'user')
            
            # تنظیم نقش
            if detected_role == 'super_admin':
                role = UserRole.SUPER_ADMIN
                needs_approval = False
                is_verified = True
                is_active = True
            elif detected_role == 'admin':
                role = UserRole.ADMIN
                # بررسی آیا اولین ادمین است
                admin_count = db.query(User).filter(
                    User.role.in_([UserRole.ADMIN, UserRole.SUPER_ADMIN])
                ).count()
                
                needs_approval = admin_count > 0  # اولین ادمین نیاز به تأیید ندارد
                is_verified = admin_count == 0
                is_active = admin_count == 0
            else:
                role = UserRole.USER
                needs_approval = False
                is_verified = False
                is_active = True
            
            # تنظیم سطح دسترسی
            access_grade = user_data.get('access_grade')
            if role == UserRole.USER:
                access_grade = None
            elif not access_grade and role != UserRole.USER:
                access_grade = AccessGrade.GRADE1  # پیش‌فرض برای ادمین‌ها
            
            # ایجاد کاربر
            user = User(
                username=user_data['username'],
                email=user_data['email'],
                phone=user_data['phone'],
                first_name=user_data['first_name'],
                last_name=user_data['last_name'],
                national_id=user_data['national_id'],
                password=user_data['password'],  # باید hash شده باشد
                
                # فیلدهای جدید
                date_of_birth=user_data.get('date_of_birth'),
                gender=user_data.get('gender'),
                address=user_data.get('address'),
                postal_code=user_data.get('postal_code'),
                country=user_data.get('country'),
                city=user_data.get('city'),
                
                # تنظیمات ادمین
                role=role,
                access_grade=access_grade,
                needs_approval=needs_approval,
                is_verified=is_verified,
                is_active=is_active
            )
            
            db.add(user)
            db.commit()
            db.refresh(user)
            
            # لاگ کردن ایجاد کاربر
            print(f"✅ کاربر {role.value} ایجاد شد: {user.email} توسط کاربر {created_by}")
            
            return {
                "success": True,
                "message": "کاربر ادمین با موفقیت ایجاد شد",
                "user_id": user.id,
                "email": user.email,
                "role": user.role.value,
                "access_grade": user.access_grade.value if user.access_grade else None,
                "needs_approval": user.needs_approval,
                "normalized_email": cls.normalize_email_for_display(user.email)
            }
            
        except Exception as e:
            db.rollback()
            print(f"❌ خطا در ایجاد کاربر ادمین: {str(e)}")
            return {
                "success": False,
                "message": f"خطا در ایجاد کاربر ادمین: {str(e)}"
            }
    
    @classmethod
    def get_admin_stats(cls, db: Session) -> Dict:
        """
        دریافت آمار ادمین‌ها
        
        Returns:
            dict: آمار سیستم
        """
        try:
            from ..models import User, UserRole, AccessGrade
            
            total_admins = db.query(User).filter(
                User.role.in_([UserRole.ADMIN, UserRole.SUPER_ADMIN])
            ).count()
            
            active_admins = db.query(User).filter(
                User.role.in_([UserRole.ADMIN, UserRole.SUPER_ADMIN]),
                User.is_active == True
            ).count()
            
            chief_count = db.query(User).filter(
                User.access_grade == AccessGrade.CHIEF,
                User.is_active == True
            ).count()
            
            super_admin_count = db.query(User).filter(
                User.role == UserRole.SUPER_ADMIN,
                User.is_active == True
            ).count()
            
            pending_approvals = db.query(User).filter(
                User.role == UserRole.ADMIN,
                User.needs_approval == True
            ).count()
            
            return {
                "total_admins": total_admins,
                "active_admins": active_admins,
                "chief_count": chief_count,
                "super_admin_count": super_admin_count,
                "pending_approvals": pending_approvals,
                "max_chief_allowed": cls.MAX_CHIEF_USERS,
                "chief_available": cls.MAX_CHIEF_USERS - chief_count
            }
            
        except Exception as e:
            print(f"❌ خطا در دریافت آمار ادمین: {str(e)}")
            return {
                "total_admins": 0,
                "active_admins": 0,
                "chief_count": 0,
                "super_admin_count": 0,
                "pending_approvals": 0,
                "max_chief_allowed": cls.MAX_CHIEF_USERS,
                "chief_available": cls.MAX_CHIEF_USERS
            }
    
    @classmethod
    def can_create_chief(cls, db: Session) -> Tuple[bool, str]:
        """
        بررسی امکان ایجاد Chief جدید
        
        Returns:
            tuple: (can_create, message)
        """
        try:
            from ..models import User, AccessGrade
            
            chief_count = db.query(User).filter(
                User.access_grade == AccessGrade.CHIEF,
                User.is_active == True
            ).count()
            
            if chief_count >= cls.MAX_CHIEF_USERS:
                return False, f"حداکثر {cls.MAX_CHIEF_USERS} Chief مجاز است"
            
            return True, f"امکان ایجاد Chief جدید وجود دارد ({cls.MAX_CHIEF_USERS - chief_count} ظرفیت خالی)"
            
        except Exception as e:
            return False, f"خطا در بررسی امکان ایجاد Chief: {str(e)}"
    
    @classmethod
    def approve_admin_user(cls, db: Session, admin_id: int, approved_by: int) -> Dict:
        """
        تأیید کاربر ادمین
        
        Args:
            db: session دیتابیس
            admin_id: ID ادمین برای تأیید
            approved_by: ID کاربر تأییدکننده
            
        Returns:
            dict: نتیجه عملیات
        """
        try:
            from ..models import User
            
            admin = db.query(User).filter(
                User.id == admin_id,
                User.role.in_([UserRole.ADMIN, UserRole.SUPER_ADMIN])
            ).first()
            
            if not admin:
                return {
                    "success": False,
                    "message": "ادمین مورد نظر یافت نشد"
                }
            
            if not admin.needs_approval:
                return {
                    "success": False,
                    "message": "این ادمین نیازی به تأیید ندارد"
                }
            
            # تأیید ادمین
            admin.is_active = True
            admin.needs_approval = False
            admin.is_verified = True
            admin.approved_by = approved_by
            
            db.commit()
            
            print(f"✅ ادمین {admin.email} تأیید شد توسط کاربر {approved_by}")
            
            return {
                "success": True,
                "message": "ادمین با موفقیت تأیید شد",
                "user_id": admin.id,
                "email": admin.email
            }
            
        except Exception as e:
            db.rollback()
            print(f"❌ خطا در تأیید ادمین: {str(e)}")
            return {
                "success": False,
                "message": f"خطا در تأیید ادمین: {str(e)}"
            }


class AdminDetectionService:
    """
    سرویس تشخیص و مدیریت ادمین‌ها
    """
    
    @staticmethod
    def is_admin_user(user) -> bool:
        """بررسی اینکه کاربر ادمین است یا نه"""
        return user and user.role in ['admin', 'super_admin']
    
    @staticmethod
    def is_super_admin(user) -> bool:
        """بررسی اینکه کاربر سوپر ادمین است یا نه"""
        return user and user.role == 'super_admin'
    
    @staticmethod
    def is_chief_admin(user) -> bool:
        """بررسی اینکه کاربر Chief است یا نه"""
        return user and user.access_grade == 'chief'
    
    @staticmethod
    def get_admin_hierarchy(user) -> Dict:
        """
        دریافت سلسله مراتب دسترسی ادمین
        
        Returns:
            dict: اطلاعات سلسله مراتب
        """
        if not user:
            return {"level": "user", "permissions": []}
        
        hierarchy = {
            "user": {"level": "user", "permissions": ["basic"]},
            "admin_grade3": {"level": "admin", "permissions": ["view_users", "view_reports"]},
            "admin_grade2": {"level": "admin", "permissions": ["manage_users", "view_financial"]},
            "admin_grade1": {"level": "admin", "permissions": ["manage_admins", "financial_ops"]},
            "chief": {"level": "chief", "permissions": ["full_system_access"]},
            "super_admin": {"level": "super_admin", "permissions": ["system_owner"]}
        }
        
        if user.role == 'super_admin':
            return hierarchy['super_admin']
        elif user.access_grade == 'chief':
            return hierarchy['chief']
        elif user.access_grade == 'grade1':
            return hierarchy['admin_grade1']
        elif user.access_grade == 'grade2':
            return hierarchy['admin_grade2']
        elif user.access_grade == 'grade3':
            return hierarchy['admin_grade3']
        else:
            return hierarchy['user']