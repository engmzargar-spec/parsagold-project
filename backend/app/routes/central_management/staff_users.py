# backend/app/routes/central_management/staff_users.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.core.user_management import get_user_manager
from app.models.user_models import User, UserStatus
from app.core.auth import get_current_admin  # ✅ تغییر اینجا

router = APIRouter(prefix="/api/central/staff-users", tags=["Central Management - Staff Users"])

@router.get("/", response_model=list)
async def get_staff_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    department: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)  # ✅ تغییر اینجا
):
    """دریافت لیست پرسنل"""
    try:
        user_manager = get_user_manager(db)
        
        filters = {}
        if search:
            filters['search'] = search
        
        staff_members = user_manager.get_users_by_type(
            user_type="staff",
            skip=skip,
            limit=limit,
            filters=filters
        )
        
        # فیلتر بر اساس دپارتمان
        if department:
            staff_members = [
                staff for staff in staff_members 
                if staff.staff_profile and staff.staff_profile.department == department
            ]
        
        return [
            {
                "id": staff.id,
                "public_id": staff.public_id,
                "email": staff.email,
                "full_name": staff.full_name,
                "status": staff.status.value,
                "created_at": staff.created_at,
                "last_login": staff.last_login,
                "employee_id": staff.staff_profile.employee_id if staff.staff_profile else "",
                "position": staff.staff_profile.position if staff.staff_profile else "",
                "department": staff.staff_profile.department if staff.staff_profile else "",
                "hire_date": staff.staff_profile.hire_date if staff.staff_profile else None
            }
            for staff in staff_members
        ]
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"خطا در دریافت پرسنل: {str(e)}"
        )