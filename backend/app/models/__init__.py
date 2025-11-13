# backend/app/models/__init__.py
# Import all models for easy access
from .user_models import User, UserVerification, PasswordReset, UserStatus, RegularUserProfile, AdminUserProfile, StaffUserProfile
from .admin_models import AdminUser, Permission, RolePermission, AdminRole, AdminStatus
from .audit_models import AuditLog, SystemLog, AuditAction

# List all models for Alembic migrations
__all__ = [
    # User models
    "User",
    "UserVerification", 
    "PasswordReset",
    "UserStatus",
    "RegularUserProfile",
    "AdminUserProfile", 
    "StaffUserProfile",
    
    # Admin models
    "AdminUser",
    "Permission",
    "RolePermission", 
    "AdminRole",
    "AdminStatus",
    
    # Audit models
    "AuditLog",
    "SystemLog",
    "AuditAction",
]