from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict
from app.database import get_db
from app.core.auth import get_current_admin
from app.core.permissions import require_permission, PERMISSIONS, ROLE_PERMISSIONS
from app.core.audit_logger import log_admin_activity
from app.models.admin_models import AdminUser, AdminRole, Permission, RolePermission

router = APIRouter()

@router.get("/permissions")
@require_permission("admin:permission")
async def get_all_permissions(
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    دریافت لیست تمام دسترسی‌های سیستم
    """
    return {
        "permissions": PERMISSIONS,
        "role_permissions": {
            role.value: permissions 
            for role, permissions in ROLE_PERMISSIONS.items()
        }
    }

@router.get("/roles")
@require_permission("admin:permission")
async def get_roles(
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    دریافت لیست نقش‌های سیستم
    """
    roles = []
    for role in AdminRole:
        role_data = {
            "value": role.value,
            "name": role.name,
            "permissions": ROLE_PERMISSIONS.get(role, [])
        }
        roles.append(role_data)
    
    return {"roles": roles}

@router.get("/user/{admin_id}/permissions")
@require_permission("admin:permission")
async def get_admin_permissions(
    admin_id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    دریافت دسترسی‌های یک ادمین خاص
    """
    admin = db.query(AdminUser).filter(AdminUser.id == admin_id).first()
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found"
        )
    
    permissions = ROLE_PERMISSIONS.get(admin.role, [])
    
    return {
        "admin_id": admin_id,
        "username": admin.username,
        "role": admin.role.value,
        "permissions": permissions,
        "permission_details": {
            perm: PERMISSIONS.get(perm, "Unknown permission") 
            for perm in permissions
        }
    }

@router.put("/user/{admin_id}/role")
@require_permission("admin:permission")
async def update_admin_role(
    admin_id: int,
    new_role: str,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    تغییر نقش یک ادمین
    """
    # کاربر نمی‌تواند نقش خودش را تغییر دهد
    if admin_id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change your own role"
        )
    
    admin = db.query(AdminUser).filter(AdminUser.id == admin_id).first()
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found"
        )
    
    # بررسی نقش معتبر
    try:
        admin_role = AdminRole(new_role)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role: {new_role}. Valid roles: {[r.value for r in AdminRole]}"
        )
    
    old_role = admin.role.value
    
    # Super Admin نمی‌تواند نقشش تغییر کند
    if admin.role == AdminRole.SUPER_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change Super Admin role"
        )
    
    # فقط Super Admin می‌تواند نقش Chief را تغییر دهد
    if admin.role == AdminRole.CHIEF and current_admin.role != AdminRole.SUPER_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Super Admin can change Chief role"
        )
    
    admin.role = admin_role
    db.commit()
    
    await log_admin_activity(
        admin_user_id=current_admin.id,
        action="permission_change",
        resource_type="admin",
        resource_id=admin_id,
        description=f"Changed admin role from {old_role} to {new_role}",
        old_values={"role": old_role},
        new_values={"role": new_role}
    )
    
    return {
        "message": f"Admin role updated to {new_role}",
        "admin_id": admin_id,
        "old_role": old_role,
        "new_role": new_role,
        "new_permissions": ROLE_PERMISSIONS.get(admin_role, [])
    }

@router.get("/check")
async def check_permission_endpoint(
    permission: str,
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    بررسی دسترسی کاربر جاری برای یک permission خاص
    """
    user_permissions = ROLE_PERMISSIONS.get(current_admin.role, [])
    
    has_permission = permission in user_permissions
    
    return {
        "has_permission": has_permission,
        "permission": permission,
        "permission_description": PERMISSIONS.get(permission, "Unknown permission"),
        "user_role": current_admin.role.value,
        "user_permissions": user_permissions
    }

@router.get("/my-permissions")
async def get_my_permissions(
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    دریافت دسترسی‌های کاربر جاری
    """
    permissions = ROLE_PERMISSIONS.get(current_admin.role, [])
    
    return {
        "user_id": current_admin.id,
        "username": current_admin.username,
        "role": current_admin.role.value,
        "permissions": permissions,
        "permission_details": {
            perm: PERMISSIONS.get(perm, "Unknown permission") 
            for perm in permissions
        }
    }