# backend/app/routes/users.py
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models.models import User, UserRole, Gender
from ..security.auth import get_current_admin_user
from ..services.password_manager import get_password_hash, generate_temporary_password  # ✅ استفاده از سرویس مرکزی

# ✅ اصلاح: حذف prefix از اینجا
router = APIRouter(tags=["Admin Users"])

@router.get("/", response_model=dict)
async def get_all_users(
    skip: int = 0,
    limit: int = 100,
    search: str = None,
    role: str = None,
    is_active: bool = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    دریافت لیست تمام کاربران
    """
    try:
        query = db.query(User).filter(User.role == "user")
        
        # فیلتر جستجو
        if search:
            query = query.filter(
                (User.email.ilike(f"%{search}%")) |
                (User.phone.ilike(f"%{search}%")) |
                (User.first_name.ilike(f"%{search}%")) |
                (User.last_name.ilike(f"%{search}%"))
            )
        
        # فیلتر نقش
        if role:
            query = query.filter(User.role == role)
        
        # فیلتر وضعیت فعال
        if is_active is not None:
            query = query.filter(User.is_active == is_active)
        
        # مرتب‌سازی و محدودیت
        users = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()
        
        # تبدیل به دیکشنری
        users_data = []
        for user in users:
            user_data = {
                "id": user.id,
                "email": user.email,
                "phone": user.phone,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "national_id": user.national_id,
                "role": user.role.value if user.role else "user",
                "is_active": user.is_active,
                "is_verified": getattr(user, 'is_verified', False),
                "last_login": user.last_login.isoformat() if user.last_login else None,
                "created_at": user.created_at.isoformat() if user.created_at else None
            }
            users_data.append(user_data)
        
        return {
            "users": users_data,
            "total": len(users_data),
            "skip": skip,
            "limit": limit
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"خطا در دریافت لیست کاربران: {str(e)}"
        )

# endpointهای ساده‌تر برای تست
@router.post("/{user_id}/toggle-active")
async def toggle_user_active(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """تغییر وضعیت فعال/غیرفعال کاربر"""
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="کاربر یافت نشد")
        
        user.is_active = not user.is_active
        db.commit()
        
        return {
            "message": f"کاربر {'فعال' if user.is_active else 'غیرفعال'} شد",
            "user_id": user_id,
            "is_active": user.is_active
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"خطا در تغییر وضعیت کاربر: {str(e)}")

@router.post("/{user_id}/verify")
async def verify_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """تأیید کاربر"""
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="کاربر یافت نشد")
        
        user.is_verified = True
        db.commit()
        
        return {
            "message": "کاربر تأیید شد",
            "user_id": user_id,
            "is_verified": True
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"خطا در تأیید کاربر: {str(e)}")

@router.post("/{user_id}/reset-password")
async def reset_user_password(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """ریست کردن رمز عبور کاربر - ✅ استفاده از سرویس مرکزی"""
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="کاربر یافت نشد")
        
        # ایجاد رمز عبور موقت - ✅ استفاده از سرویس مرکزی
        temp_password = generate_temporary_password(10)  # رمز موقت امن
        user.password_hash = get_password_hash(temp_password)  # ✅ استفاده از سرویس مرکزی
        
        db.commit()
        
        print(f"🔑 رمز عبور کاربر {user.email} ریست شد توسط ادمین")
        
        return {
            "message": "رمز عبور با موفقیت ریست شد",
            "temp_password": temp_password,
            "user_id": user_id,
            "user_email": user.email
        }
        
    except Exception as e:
        db.rollback()
        print(f"❌ خطا در ریست رمز عبور کاربر: {str(e)}")
        raise HTTPException(status_code=500, detail=f"خطا در ریست رمز عبور: {str(e)}")