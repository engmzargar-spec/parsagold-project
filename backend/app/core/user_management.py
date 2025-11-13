# backend/app/core/user_management.py
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError
from sqlalchemy.sql import func  # ✅ اضافه کردن این import
from contextlib import contextmanager
import logging
from typing import Optional, List, Dict, Any

from app.models.user_models import User, RegularUserProfile, AdminUserProfile, StaffUserProfile, UserStatus
from app.core.auth import pwd_context  # ✅ تغییر از security به auth
from app.core.audit_logger import log_audit  # ✅ تغییر از audit_logger به log_audit

logger = logging.getLogger(__name__)

class CentralUserManager:
    """سیستم مرکزی مدیریت همه انواع کاربران"""
    
    def __init__(self, db: Session):
        self.db = db
    
    @contextmanager
    def _transaction(self):
        """مدیریت تراکنش‌های دیتابیس"""
        try:
            yield
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            logger.error(f"Transaction failed: {str(e)}")
            raise
    
    def _check_duplicate_user(self, email: str, phone: Optional[str] = None) -> None:
        """بررسی تکراری نبودن کاربر"""
        existing_user = self.db.query(User).filter(
            (User.email == email) | (User.phone == phone)
        ).first()
        
        if existing_user:
            if existing_user.email == email:
                raise ValueError("ایمیل از قبل وجود دارد")
            if phone and existing_user.phone == phone:
                raise ValueError("شماره تلفن از قبل وجود دارد")
    
    def create_user(self, user_data: Dict[str, Any], user_type: str = "regular") -> User:
        """ایجاد کاربر جدید با پروفایل مناسب"""
        
        with self._transaction():
            # بررسی تکراری نبودن
            self._check_duplicate_user(user_data['email'], user_data.get('phone'))
            
            # ایجاد کاربر اصلی
            user = User(
                email=user_data['email'],
                phone=user_data.get('phone'),
                password_hash=pwd_context.hash(user_data['password']),
                first_name=user_data.get('first_name', ''),
                last_name=user_data.get('last_name', ''),
                user_type=user_type,
                status=UserStatus.ACTIVE
            )
            
            self.db.add(user)
            self.db.flush()  # گرفتن ID
            
            # ایجاد پروفایل خاص بر اساس نوع کاربر
            if user_type == "regular":
                profile = RegularUserProfile(
                    user_id=user.id,
                    balance=user_data.get('balance', 0),
                    risk_level=user_data.get('risk_level', 'low')
                )
            elif user_type == "admin":
                profile = AdminUserProfile(
                    user_id=user.id,
                    role=user_data.get('role', 'admin'),
                    permissions=user_data.get('permissions', []),
                    department=user_data.get('department')
                )
            elif user_type == "staff":
                profile = StaffUserProfile(
                    user_id=user.id,
                    employee_id=user_data['employee_id'],
                    position=user_data['position'],
                    department=user_data['department'],
                    hire_date=user_data['hire_date']
                )
            else:
                raise ValueError(f"نوع کاربر نامعتبر: {user_type}")
            
            self.db.add(profile)
            
            # لاگ کردن فعالیت (موقتاً غیرفعال - بعداً فعال می‌کنیم)
            # log_audit(
            #     action="USER_CREATED",
            #     resource_type="user",
            #     resource_id=user.id,
            #     description=f"User {user.email} created as {user_type}",
            #     new_values={"email": user.email, "user_type": user_type}
            # )
            
            return user
    
    def get_user_by_id(self, user_id: int, include_profile: bool = True) -> Optional[User]:
        """دریافت کاربر بر اساس ID"""
        query = self.db.query(User)
        
        if include_profile:
            query = query.options(
                joinedload(User.regular_profile),
                joinedload(User.admin_profile),
                joinedload(User.staff_profile)
            )
        
        return query.filter(User.id == user_id).first()
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        """دریافت کاربر بر اساس ایمیل"""
        return self.db.query(User).filter(User.email == email).first()
    
    def get_users_by_type(self, user_type: str, skip: int = 0, limit: int = 100, 
                         filters: Dict[str, Any] = None) -> List[User]:
        """دریافت کاربران بر اساس نوع"""
        query = self.db.query(User).filter(User.user_type == user_type)
        
        if filters:
            if filters.get('status'):
                query = query.filter(User.status == filters['status'])
            if filters.get('is_active') is not None:
                query = query.filter(User.is_active == filters['is_active'])
            if filters.get('search'):
                search_term = f"%{filters['search']}%"
                query = query.filter(
                    (User.email.ilike(search_term)) |
                    (User.full_name.ilike(search_term)) |
                    (User.phone.ilike(search_term))
                )
        
        return query.offset(skip).limit(limit).all()
    
    def authenticate_user(self, identifier: str, password: str, user_type: str = None) -> Optional[User]:
        """احراز هویت کاربر"""
        query = self.db.query(User)
        
        if user_type:
            query = query.filter(User.user_type == user_type)
        
        user = query.filter(
            (User.email == identifier) | (User.phone == identifier),
            User.status == UserStatus.ACTIVE
        ).first()
        
        if user and pwd_context.verify(password, user.password_hash):
            # به‌روزرسانی آخرین لاگین
            user.last_login = func.now()  # ✅ حالا func import شده
            user.login_attempts = 0
            self.db.commit()
            
            return user
        
        # افزایش شماره تلاش‌های ناموفق
        if user:
            user.login_attempts += 1
            self.db.commit()
        
        return None
    
    def update_user_status(self, user_id: int, status: UserStatus, reason: str = "") -> bool:
        """به‌روزرسانی وضعیت کاربر"""
        user = self.get_user_by_id(user_id, include_profile=False)
        if not user:
            return False
        
        old_status = user.status
        user.status = status
        
        # لاگ کردن تغییر وضعیت (موقتاً غیرفعال)
        # log_audit(
        #     action="USER_STATUS_CHANGED",
        #     resource_type="user", 
        #     resource_id=user_id,
        #     description=f"User status changed from {old_status.value} to {status.value}",
        #     old_values={"status": old_status.value},
        #     new_values={"status": status.value}
        # )
        
        self.db.commit()
        return True
    
    def delete_user(self, user_id: int, soft_delete: bool = True) -> bool:
        """حذف کاربر (سافت یا هارد دلیت)"""
        user = self.get_user_by_id(user_id, include_profile=False)
        if not user:
            return False
        
        if soft_delete:
            # سافت دلیت - غیرفعال کردن
            user.status = UserStatus.INACTIVE
            user.is_active = False
        else:
            # هارد دلیت - حذف فیزیکی
            self.db.delete(user)
        
        # لاگ کردن (موقتاً غیرفعال)
        # log_audit(
        #     action="USER_DELETED",
        #     resource_type="user",
        #     resource_id=user_id,
        #     description=f"User {'soft' if soft_delete else 'hard'} deleted",
        #     old_values={"email": user.email, "status": user.status.value}
        # )
        
        self.db.commit()
        return True

# ایجاد instance全局 (اختیاری)
user_manager = None

def get_user_manager(db: Session) -> CentralUserManager:
    """Get user manager instance (برای dependency injection)"""
    global user_manager
    if user_manager is None:
        user_manager = CentralUserManager(db)
    return user_manager