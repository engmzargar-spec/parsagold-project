from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.core.auth import get_current_admin
from app.core.permissions import require_permission, check_permission
from app.core.audit_logger import log_admin_activity
from app.models.user_models import User, UserStatus
from app.models.admin_models import AdminUser

router = APIRouter()

@router.get("/", response_model=List[dict])
@require_permission("user:read")
async def get_users(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    دریافت لیست کاربران با قابلیت فیلتر و جستجو
    """
    query = db.query(User)
    
    # فیلتر بر اساس وضعیت
    if status:
        query = query.filter(User.status == UserStatus(status))
    
    # جستجو در نام، ایمیل و تلفن
    if search:
        search_filter = (
            (User.first_name.ilike(f"%{search}%")) |
            (User.last_name.ilike(f"%{search}%")) |
            (User.email.ilike(f"%{search}%")) |
            (User.phone.ilike(f"%{search}%"))
        )
        query = query.filter(search_filter)
    
    users = query.offset(skip).limit(limit).all()
    
    return [
        {
            "id": user.id,
            "email": user.email,
            "phone": user.phone,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "status": user.status.value,
            "country": user.country,
            "city": user.city,
            "email_verified": user.email_verified,
            "phone_verified": user.phone_verified,
            "created_at": user.created_at,
            "last_login": user.last_login
        }
        for user in users
    ]

@router.get("/{user_id}", response_model=dict)
@require_permission("user:read")
async def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    دریافت اطلاعات کامل یک کاربر
    """
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {
        "id": user.id,
        "email": user.email,
        "phone": user.phone,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "national_id": user.national_id,
        "date_of_birth": user.date_of_birth,
        "country": user.country,
        "city": user.city,
        "address": user.address,
        "postal_code": user.postal_code,
        "status": user.status.value,
        "email_verified": user.email_verified,
        "phone_verified": user.phone_verified,
        "profile_image": user.profile_image,
        "two_factor_enabled": user.two_factor_enabled,
        "login_attempts": user.login_attempts,
        "last_login": user.last_login,
        "created_at": user.created_at,
        "updated_at": user.updated_at
    }

@router.put("/{user_id}/status")
@require_permission("user:suspend")
async def update_user_status(
    user_id: int,
    new_status: str,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    تغییر وضعیت کاربر (فعال/غیرفعال/تعلیق)
    """
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    old_status = user.status.value
    
    try:
        user.status = UserStatus(new_status)
        db.commit()
        
        await log_admin_activity(
            admin_user_id=current_admin.id,
            action="update",
            resource_type="user",
            resource_id=user_id,
            description=f"Changed user status from {old_status} to {new_status}",
            old_values={"status": old_status},
            new_values={"status": new_status}
        )
        
        return {
            "message": f"User status updated to {new_status}",
            "user_id": user_id,
            "old_status": old_status,
            "new_status": new_status
        }
        
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status: {new_status}. Valid statuses: {[s.value for s in UserStatus]}"
        )

@router.get("/count/stats")
@require_permission("user:read")
async def get_user_stats(
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    دریافت آمار کاربران
    """
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.status == UserStatus.ACTIVE).count()
    pending_users = db.query(User).filter(User.status == UserStatus.PENDING).count()
    suspended_users = db.query(User).filter(User.status == UserStatus.SUSPENDED).count()
    
    return {
        "total_users": total_users,
        "active_users": active_users,
        "pending_users": pending_users,
        "suspended_users": suspended_users
    }