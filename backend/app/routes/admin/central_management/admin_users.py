# backend/app/routes/central_management/admin_users.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.core.user_management import get_user_manager
from app.models.user_models import User, UserStatus
from app.core.auth import get_current_admin  # ✅ تغییر اینجا

router = APIRouter(prefix="/api/central/admin-users", tags=["Central Management - Admin Users"])

@router.get("/", response_model=list)
async def get_admin_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)  # ✅ تغییر اینجا
):
    """دریافت لیست ادمین‌ها"""
    try:
        user_manager = get_user_manager(db)
        
        filters = {}
        if search:
            filters['search'] = search
        
        admins = user_manager.get_users_by_type(
            user_type="admin",
            skip=skip,
            limit=limit,
            filters=filters
        )
        
        return [
            {
                "id": admin.id,
                "public_id": admin.public_id,
                "email": admin.email,
                "full_name": admin.full_name,
                "status": admin.status.value,
                "created_at": admin.created_at,
                "last_login": admin.last_login,
                "role": admin.admin_profile.role if admin.admin_profile else "admin",
                "department": admin.admin_profile.department if admin.admin_profile else None,
                "access_level": admin.admin_profile.access_level if admin.admin_profile else 1
            }
            for admin in admins
        ]
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"خطا در دریافت ادمین‌ها: {str(e)}"
        )