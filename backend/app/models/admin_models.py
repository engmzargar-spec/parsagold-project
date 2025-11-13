from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Enum, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base

class AdminRole(enum.Enum):
    SUPER_ADMIN = "super_admin"
    CHIEF = "chief" 
    ADMIN = "admin"
    SUPPORT = "support"
    VIEWER = "viewer"

class AdminStatus(enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"

class AdminUser(Base):
    __tablename__ = "admin_users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(100))
    last_name = Column(String(100))
    phone = Column(String(20))
    
    # نقش و دسترسی‌ها
    role = Column(Enum(AdminRole), default=AdminRole.VIEWER)
    permissions = Column(Text)  # JSON string of permissions
    
    # وضعیت
    status = Column(Enum(AdminStatus), default=AdminStatus.ACTIVE)
    last_login = Column(DateTime)
    login_attempts = Column(Integer, default=0)
    two_factor_enabled = Column(Boolean, default=False)
    
    # اطلاعات امنیتی
    password_changed_at = Column(DateTime, default=func.now())
    must_change_password = Column(Boolean, default=False)
    
    # timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    created_by = Column(Integer, ForeignKey("admin_users.id"))
    
    # روابط
    # audit_logs = relationship("AuditLog", back_populates="admin_user")

class Permission(Base):
    __tablename__ = "permissions"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text)
    category = Column(String(50))  # user_management, trade_management, etc.
    created_at = Column(DateTime, default=func.now())

class RolePermission(Base):
    __tablename__ = "role_permissions"
    
    id = Column(Integer, primary_key=True, index=True)
    role = Column(Enum(AdminRole), nullable=False)
    permission_id = Column(Integer, ForeignKey("permissions.id"), nullable=False)
    created_at = Column(DateTime, default=func.now())
    
    # رابطه
    permission = relationship("Permission")