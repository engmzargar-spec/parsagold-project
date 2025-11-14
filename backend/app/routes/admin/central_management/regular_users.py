# backend/app/routes/central_management/regular_users.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.core.user_management import get_user_manager
from app.models.user_models import User, UserStatus
from app.core.auth import get_current_admin

router = APIRouter(prefix="/api/central/regular-users", tags=["Central Management - Regular Users"])

@router.get("/", response_model=list)
async def get_regular_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    status: Optional[UserStatus] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    """دریافت لیست کاربران عادی از دیتابیس"""
    try:
        user_manager = get_user_manager(db)
        
        filters = {}
        if status:
            filters['status'] = status
        if search:
            filters['search'] = search
        
        users = user_manager.get_users_by_type(
            user_type="regular",
            skip=skip,
            limit=limit,
            filters=filters
        )
        
        return [
            {
                "id": user.id,
                "public_id": user.public_id,
                "email": user.email,
                "phone": user.phone,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "full_name": user.full_name,
                "status": user.status.value,
                "email_verified": user.email_verified,
                "phone_verified": user.phone_verified,
                "created_at": user.created_at.isoformat() if user.created_at else None,
                "last_login": user.last_login.isoformat() if user.last_login else None,
                "balance": user.regular_profile.balance if user.regular_profile else 0,
                "risk_level": user.regular_profile.risk_level if user.regular_profile else "low",
                "credit_score": user.regular_profile.credit_score if user.regular_profile else 0,
                "national_id": user.national_id,
                "country": user.country,
                "city": user.city
            }
            for user in users
        ]
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"خطا در دریافت کاربران: {str(e)}"
        )

@router.get("/{user_id}", response_model=dict)
async def get_regular_user_details(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    """دریافت جزئیات کامل کاربر عادی"""
    try:
        user_manager = get_user_manager(db)
        user = user_manager.get_user_by_id(user_id)
        
        if not user or user.user_type != "regular":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="کاربر پیدا نشد"
            )
        
        return {
            "id": user.id,
            "public_id": user.public_id,
            "email": user.email,
            "phone": user.phone,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "full_name": user.full_name,
            "national_id": user.national_id,
            "date_of_birth": user.date_of_birth.isoformat() if user.date_of_birth else None,
            "country": user.country,
            "city": user.city,
            "address": user.address,
            "postal_code": user.postal_code,
            "status": user.status.value,
            "email_verified": user.email_verified,
            "phone_verified": user.phone_verified,
            "profile_image": user.profile_image,
            "two_factor_enabled": user.two_factor_enabled,
            "last_login": user.last_login.isoformat() if user.last_login else None,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "profile": {
                "balance": user.regular_profile.balance if user.regular_profile else 0,
                "credit_score": user.regular_profile.credit_score if user.regular_profile else 0,
                "risk_level": user.regular_profile.risk_level if user.regular_profile else "low",
                "trading_volume": user.regular_profile.trading_volume if user.regular_profile else 0,
                "preferred_assets": user.regular_profile.preferred_assets if user.regular_profile else [],
                "trading_limits": user.regular_profile.trading_limits if user.regular_profile else {},
                "notification_preferences": user.regular_profile.notification_preferences if user.regular_profile else {}
            } if user.regular_profile else {}
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"خطا در دریافت اطلاعات کاربر: {str(e)}"
        )

@router.patch("/{user_id}/status")
async def update_regular_user_status(
    user_id: int,
    status: UserStatus,
    reason: str = "",
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    """به‌روزرسانی وضعیت کاربر عادی"""
    try:
        user_manager = get_user_manager(db)
        user = user_manager.get_user_by_id(user_id)
        
        if not user or user.user_type != "regular":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="کاربر پیدا نشد"
            )
        
        success = user_manager.update_user_status(user_id, status, reason)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="خطا در به‌روزرسانی وضعیت کاربر"
            )
        
        return {
            "message": "وضعیت کاربر با موفقیت به‌روزرسانی شد",
            "user_id": user_id,
            "new_status": status.value,
            "reason": reason
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"خطا در به‌روزرسانی وضعیت: {str(e)}"
        )

@router.post("/{user_id}/verify-email")
async def verify_user_email(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    """تأیید دستی ایمیل کاربر"""
    try:
        user_manager = get_user_manager(db)
        user = user_manager.get_user_by_id(user_id)
        
        if not user or user.user_type != "regular":
            raise HTTPException(status_code=404, detail="کاربر پیدا نشد")
        
        user.email_verified = True
        db.commit()
        
        return {"message": "ایمیل کاربر با موفقیت تأیید شد", "user_id": user_id}
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"خطا در تأیید ایمیل: {str(e)}")

@router.post("/{user_id}/verify-phone")
async def verify_user_phone(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    """تأیید دستی تلفن کاربر"""
    try:
        user_manager = get_user_manager(db)
        user = user_manager.get_user_by_id(user_id)
        
        if not user or user.user_type != "regular":
            raise HTTPException(status_code=404, detail="کاربر پیدا نشد")
        
        user.phone_verified = True
        db.commit()
        
        return {"message": "تلفن کاربر با موفقیت تأیید شد", "user_id": user_id}
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"خطا در تأیید تلفن: {str(e)}")