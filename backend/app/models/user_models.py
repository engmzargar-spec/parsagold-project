from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Enum, ForeignKey, JSON, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base
import uuid

class UserStatus(enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive" 
    SUSPENDED = "suspended"
    PENDING = "pending"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    public_id = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))  # جدید
    
    # اطلاعات احراز هویت (حفظ فیلدهای موجود)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20), unique=True, index=True)
    password_hash = Column(String(255), nullable=False)
    
    # اطلاعات شخصی (حفظ فیلدهای موجود)
    first_name = Column(String(100))
    last_name = Column(String(100))
    national_id = Column(String(20), unique=True)
    date_of_birth = Column(DateTime)
    country = Column(String(100))
    city = Column(String(100))
    address = Column(Text)
    postal_code = Column(String(20))
    
    # وضعیت کاربر (حفظ فیلدهای موجود)
    status = Column(Enum(UserStatus), default=UserStatus.PENDING)
    email_verified = Column(Boolean, default=False)
    phone_verified = Column(Boolean, default=False)
    
    # اطلاعات تماس (حفظ فیلدهای موجود)
    profile_image = Column(String(500))
    
    # تنظیمات امنیتی (حفظ فیلدهای موجود + اضافه شدن)
    two_factor_enabled = Column(Boolean, default=False)
    login_attempts = Column(Integer, default=0)
    last_login = Column(DateTime)
    
    # فیلدهای جدید برای سیستم مرکزی
    user_type = Column(String(20), default="regular")  # regular, admin, staff, support
    full_name = Column(String(200))  # ترکیب first_name + last_name
    
    # timestamps (حفظ فیلدهای موجود)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    last_password_change = Column(DateTime, default=func.now())  # جدید
    
    # روابط جدید برای پروفایل‌های خاص
    regular_profile = relationship("RegularUserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    admin_profile = relationship("AdminUserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    staff_profile = relationship("StaffUserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    
    __table_args__ = (
        Index('idx_user_type_status', 'user_type', 'status'),
        Index('idx_email_phone', 'email', 'phone'),
    )
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # محاسبه full_name از first_name و last_name
        if self.first_name and self.last_name:
            self.full_name = f"{self.first_name} {self.last_name}"

class RegularUserProfile(Base):
    """پروفایل مخصوص کاربران عادی - برای اطلاعات مالی و تجاری"""
    __tablename__ = "regular_user_profiles"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), unique=True)
    
    # اطلاعات مالی و تجاری
    balance = Column(Integer, default=0)
    credit_score = Column(Integer, default=0)
    risk_level = Column(String(20), default='low')
    trading_volume = Column(Integer, default=0)
    preferred_assets = Column(JSON, default=list)  # طلا، نقره، نفت
    
    # تنظیمات تجاری
    trading_limits = Column(JSON, default=dict)
    notification_preferences = Column(JSON, default=dict)
    
    user = relationship("User", back_populates="regular_profile")
    
    __table_args__ = (
        Index('idx_regular_risk_balance', 'risk_level', 'balance'),
    )

class AdminUserProfile(Base):
    """پروفایل مخصوص ادمین‌ها - برای اطلاعات دسترسی و مدیریت"""
    __tablename__ = "admin_user_profiles"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), unique=True)
    
    # اطلاعات دسترسی
    role = Column(String(50), default="admin")  # admin, super_admin, chief
    permissions = Column(JSON, default=list)
    department = Column(String(100), nullable=True)
    access_level = Column(Integer, default=1)
    
    # تنظیمات مدیریتی
    admin_preferences = Column(JSON, default=dict)
    allowed_sections = Column(JSON, default=list)
    
    user = relationship("User", back_populates="admin_profile")

class StaffUserProfile(Base):
    """پروفایل مخصوص پرسنل - برای اطلاعات سازمانی"""
    __tablename__ = "staff_user_profiles"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), unique=True)
    
    # اطلاعات پرسنلی
    employee_id = Column(String(20), unique=True, index=True)
    position = Column(String(100), nullable=False)
    department = Column(String(100), nullable=False)
    hire_date = Column(DateTime, nullable=False)
    salary_level = Column(String(50), nullable=True)
    
    # دسترسی‌های کاری
    staff_permissions = Column(JSON, default=list)
    work_schedule = Column(JSON, nullable=True)
    assigned_tasks = Column(JSON, default=list)
    
    user = relationship("User", back_populates="staff_profile")

# حفظ مدل‌های موجود بدون تغییر
class UserVerification(Base):
    __tablename__ = "user_verifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    verification_type = Column(String(50))  # email, phone
    token = Column(String(255), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())

class PasswordReset(Base):
    __tablename__ = "password_resets"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token = Column(String(255), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())