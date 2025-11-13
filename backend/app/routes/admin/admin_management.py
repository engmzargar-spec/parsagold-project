from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.core.auth import get_current_admin, get_password_hash
from app.core.permissions import require_permission, check_permission
from app.core.audit_logger import log_admin_activity
from app.models.admin_models import AdminUser, AdminRole, AdminStatus

router = APIRouter()

@router.get("/", response_model=List[dict])
@require_permission("admin:read")
async def get_admins(
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    دریافت لیست تمام ادمین‌ها
    """
    admins = db.query(AdminUser).all()
    
    return [
        {
            "id": admin.id,
            "username": admin.username,
            "email": admin.email,
            "first_name": admin.first_name,
            "last_name": admin.last_name,
            "role": admin.role.value,
            "status": admin.status.value,
            "last_login": admin.last_login,
            "created_at": admin.created_at,
            "created_by": admin.created_by
        }
        for admin in admins
    ]

@router.post("/", status_code=status.HTTP_201_CREATED)
@require_permission("admin:create")
async def create_admin(
    username: str,
    email: str,
    password: str,
    first_name: str,
    last_name: str,
    role: str,
    phone: str = None,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    ایجاد ادمین جدید
    """
    # بررسی وجود username و email تکراری
    existing_admin = db.query(AdminUser).filter(
        (AdminUser.username == username) | (AdminUser.email == email)
    ).first()
    
    if existing_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already exists"
        )
    
    # بررسی نقش معتبر
    try:
        admin_role = AdminRole(role)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role: {role}. Valid roles: {[r.value for r in AdminRole]}"
        )
    
    # ایجاد ادمین جدید
    new_admin = AdminUser(
        username=username,
        email=email,
        password_hash=get_password_hash(password),
        first_name=first_name,
        last_name=last_name,
        phone=phone,
        role=admin_role,
        created_by=current_admin.id
    )
    
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)
    
    await log_admin_activity(
        admin_user_id=current_admin.id,
        action="create",
        resource_type="admin",
        resource_id=new_admin.id,
        description=f"Created new admin: {username} with role: {role}",
        new_values={
            "username": username,
            "email": email,
            "role": role,
            "first_name": first_name,
            "last_name": last_name
        }
    )
    
    return {
        "message": "Admin created successfully",
        "admin_id": new_admin.id,
        "username": new_admin.username
    }

@router.put("/{admin_id}")
@require_permission("admin:update")
async def update_admin(
    admin_id: int,
    first_name: str = None,
    last_name: str = None,
    phone: str = None,
    role: str = None,
    status: str = None,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    ویرایش اطلاعات ادمین
    """
    admin = db.query(AdminUser).filter(AdminUser.id == admin_id).first()
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found"
        )
    
    old_values = {}
    new_values = {}
    
    # به‌روزرسانی فیلدها
    if first_name is not None and first_name != admin.first_name:
        old_values["first_name"] = admin.first_name
        admin.first_name = first_name
        new_values["first_name"] = first_name
    
    if last_name is not None and last_name != admin.last_name:
        old_values["last_name"] = admin.last_name
        admin.last_name = last_name
        new_values["last_name"] = last_name
    
    if phone is not None and phone != admin.phone:
        old_values["phone"] = admin.phone
        admin.phone = phone
        new_values["phone"] = phone
    
    if role is not None:
        try:
            admin_role = AdminRole(role)
            if admin_role != admin.role:
                old_values["role"] = admin.role.value
                admin.role = admin_role
                new_values["role"] = role
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid role: {role}"
            )
    
    if status is not None:
        try:
            admin_status = AdminStatus(status)
            if admin_status != admin.status:
                old_values["status"] = admin.status.value
                admin.status = admin_status
                new_values["status"] = status
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status: {status}"
            )
    
    if new_values:
        db.commit()
        
        await log_admin_activity(
            admin_user_id=current_admin.id,
            action="update",
            resource_type="admin",
            resource_id=admin_id,
            description="Updated admin information",
            old_values=old_values,
            new_values=new_values
        )
        
        return {
            "message": "Admin updated successfully",
            "admin_id": admin_id,
            "updated_fields": list(new_values.keys())
        }
    else:
        return {
            "message": "No changes detected",
            "admin_id": admin_id
        }

@router.delete("/{admin_id}")
@require_permission("admin:delete")
async def delete_admin(
    admin_id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    حذف ادمین (فقط برای super admin)
    """
    # کاربر نمی‌تواند خودش را حذف کند
    if admin_id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    admin = db.query(AdminUser).filter(AdminUser.id == admin_id).first()
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found"
        )
    
    db.delete(admin)
    db.commit()
    
    await log_admin_activity(
        admin_user_id=current_admin.id,
        action="delete",
        resource_type="admin",
        resource_id=admin_id,
        description=f"Deleted admin: {admin.username}",
        old_values={
            "username": admin.username,
            "email": admin.email,
            "role": admin.role.value
        }
    )
    
    return {
        "message": "Admin deleted successfully",
        "admin_id": admin_id
    }