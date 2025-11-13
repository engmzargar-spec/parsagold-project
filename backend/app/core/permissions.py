from fastapi import HTTPException, status
from app.models.admin_models import AdminRole

# تعریف دسترسی‌های سیستم
PERMISSIONS = {
    # مدیریت کاربران
    "user:read": "مشاهده کاربران",
    "user:create": "ایجاد کاربر جدید", 
    "user:update": "ویرایش کاربران",
    "user:delete": "حذف کاربران",
    "user:suspend": "تعلیق کاربران",
    
    # مدیریت ادمین‌ها
    "admin:read": "مشاهده ادمین‌ها",
    "admin:create": "ایجاد ادمین جدید",
    "admin:update": "ویرایش ادمین‌ها", 
    "admin:delete": "حذف ادمین‌ها",
    "admin:permission": "مدیریت دسترسی ادمین‌ها",
    
    # مدیریت معاملات
    "trade:read": "مشاهده معاملات",
    "trade:create": "ایجاد معامله",
    "trade:update": "ویرایش معاملات",
    "trade:delete": "حذف معاملات",
    
    # مدیریت کیف پول
    "wallet:read": "مشاهده کیف پول‌ها",
    "wallet:update": "ویرایش کیف پول‌ها",
    
    # گزارش‌گیری
    "report:read": "مشاهده گزارش‌ها",
    "report:export": "خروجی گرفتن از گزارش‌ها",
    
    # Audit Log
    "audit:read": "مشاهده لاگ سیستم",
}

# نقش‌ها و دسترسی‌های مربوطه
ROLE_PERMISSIONS = {
    AdminRole.SUPER_ADMIN: list(PERMISSIONS.keys()),  # تمام دسترسی‌ها
    
    AdminRole.CHIEF: [
        "user:read", "user:create", "user:update", "user:suspend",
        "admin:read", "admin:create", "admin:update", 
        "trade:read", "trade:create", "trade:update",
        "wallet:read", "wallet:update",
        "report:read", "report:export",
        "audit:read",
    ],
    
    AdminRole.ADMIN: [
        "user:read", "user:create", "user:update",
        "trade:read", "trade:create", "trade:update", 
        "wallet:read", "wallet:update",
        "report:read",
    ],
    
    AdminRole.SUPPORT: [
        "user:read", "user:update",
        "trade:read", 
        "wallet:read",
    ],
    
    AdminRole.VIEWER: [
        "user:read",
        "trade:read",
        "report:read",
    ],
}

def check_permission(current_user, required_permission: str):
    """
    بررسی دسترسی کاربر برای انجام عملیات
    """
    if not hasattr(current_user, 'role'):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User does not have permission system"
        )
    
    user_role = current_user.role
    user_permissions = ROLE_PERMISSIONS.get(user_role, [])
    
    if required_permission not in user_permissions:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Permission denied: {required_permission}"
        )
    
    return True

# دکوریتور برای بررسی دسترسی
def require_permission(permission: str):
    def decorator(func):
        async def wrapper(*args, **kwargs):
            current_user = kwargs.get('current_user')
            if not current_user:
                # اگر current_user در kwargs نبود، در args جستجو کن
                for arg in args:
                    if hasattr(arg, 'role'):
                        current_user = arg
                        break
            
            check_permission(current_user, permission)
            return await func(*args, **kwargs)
        return wrapper
    return decorator