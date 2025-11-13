from sqlalchemy import Column, Integer, String, DateTime, Text, Enum, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base

class AuditAction(enum.Enum):
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"
    LOGIN = "login"
    LOGOUT = "logout"
    PASSWORD_CHANGE = "password_change"
    PERMISSION_CHANGE = "permission_change"
    SUSPEND = "suspend"
    ACTIVATE = "activate"

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # کاربر مرتبط (می‌تواند کاربر عادی یا ادمین باشد)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    admin_user_id = Column(Integer, ForeignKey("admin_users.id"), nullable=True)
    
    # اطلاعات action
    action = Column(Enum(AuditAction), nullable=False)
    resource_type = Column(String(100))  # user, admin, trade, wallet, etc.
    resource_id = Column(Integer)  # ID of the affected resource
    description = Column(Text)
    
    # داده‌های تغییر یافته
    old_values = Column(JSON)  # Previous state
    new_values = Column(JSON)  # New state
    
    # اطلاعات درخواست
    ip_address = Column(String(45))  # Support IPv6
    user_agent = Column(Text)
    request_method = Column(String(10))  # GET, POST, PUT, DELETE
    request_url = Column(Text)
    
    # نتیجه action
    status_code = Column(Integer)  # HTTP status code
    error_message = Column(Text)
    
    # timestamps
    created_at = Column(DateTime, default=func.now())
    
    # روابط - کاملاً حذف شده
    # user = relationship("User", back_populates="audit_logs")
    # admin_user = relationship("AdminUser", back_populates="audit_logs")

class SystemLog(Base):
    __tablename__ = "system_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # سطح لاگ
    level = Column(String(20))  # INFO, WARNING, ERROR, CRITICAL
    
    # اطلاعات لاگ
    module = Column(String(100))  # auth, user_management, trade, etc.
    message = Column(Text, nullable=False)
    details = Column(JSON)  # Additional data
    
    # اطلاعات فنی
    traceback = Column(Text)  # For errors
    ip_address = Column(String(45))
    
    # timestamps
    created_at = Column(DateTime, default=func.now())