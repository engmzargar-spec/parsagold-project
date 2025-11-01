# backend/app/routes/users.py
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models.models import User, UserRole, Gender
from ..schemas.schemas import (
    UserDetailResponse, 
    UserUpdate, 
    UserStatsResponse,
    UserFilter,
    UserVerificationRequest,
    UserSearch
)
from app.security.auth import get_current_admin_user

# اصلاح: حذف /api از prefix
router = APIRouter(prefix="/admin/users", tags=["admin-users"])

@router.get("/", response_model=List[UserDetailResponse])
def get_all_users(
    skip: int = 0,
    limit: int = 100,
    filter: UserFilter = Depends(),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    دریافت لیست تمام کاربران با قابلیت فیلتر کردن
    """
    try:
        query = db.query(User)
        
        # اعمال فیلترها
        if filter.role:
            query = query.filter(User.role == filter.role)
        if filter.is_active is not None:
            query = query.filter(User.is_active == filter.is_active)
        if filter.is_verified is not None:
            query = query.filter(User.is_verified == filter.is_verified)
        if filter.gender:
            query = query.filter(User.gender == filter.gender)
        if filter.country:
            query = query.filter(User.country.ilike(f"%{filter.country}%"))
        if filter.city:
            query = query.filter(User.city.ilike(f"%{filter.city}%"))
        if filter.access_grade:
            query = query.filter(User.access_grade == filter.access_grade)
        if filter.date_from:
            query = query.filter(User.created_at >= filter.date_from)
        if filter.date_to:
            query = query.filter(User.created_at <= filter.date_to)
        
        users = query.offset(skip).limit(limit).all()
        return users
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"خطا در دریافت لیست کاربران: {str(e)}"
        )

# بقیه endpointها همونطور باقی می‌مونن...