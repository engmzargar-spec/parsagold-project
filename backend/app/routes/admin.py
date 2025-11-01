# backend/app/routes/admin.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.models import User, UserRole

router = APIRouter()

@router.get("/test")
async def admin_test():
    return {"message": "داشبورد مدیریتی پارسا گلد فعال است"}

@router.get("/dashboard/stats")
async def get_admin_stats(db: Session = Depends(get_db)):
    """آمار کلی برای داشبورد مدیریتی"""
    try:
        total_users = db.query(User).count()
        total_admins = db.query(User).filter(User.role.in_([UserRole.ADMIN, UserRole.SUPER_ADMIN])).count()
        active_users = db.query(User).filter(User.is_active == True).count()
        
        return {
            "total_users": total_users,
            "total_admins": total_admins,
            "active_users": active_users,
            "pending_verifications": 0,  # بعداً کامل میشه
            "total_transactions": 0,
            "total_trades": 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطا در دریافت آمار: {str(e)}")

@router.get("/users/search")
async def search_users(
    q: str = Query(..., description="عبارت جستجو"),
    search_type: str = Query("all", description="نوع جستجو"),
    db: Session = Depends(get_db)
):
    """جستجوی پیشرفته کاربران"""
    try:
        query = db.query(User)
        
        if search_type == "all" or search_type == "email":
            query = query.filter(User.email.ilike(f"%{q}%"))
        elif search_type == "phone":
            query = query.filter(User.phone.ilike(f"%{q}%"))
        elif search_type == "name":
            query = query.filter(
                (User.first_name.ilike(f"%{q}%")) | 
                (User.last_name.ilike(f"%{q}%"))
            )
        elif search_type == "nationalId":
            query = query.filter(User.national_id.ilike(f"%{q}%"))
        
        users = query.limit(20).all()
        
        # تبدیل به دیکشنری و حذف پسورد
        users_data = []
        for user in users:
            user_data = {
                "id": user.id,
                "email": user.email,
                "phone": user.phone,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "national_id": user.national_id,
                "role": user.role.value,
                "is_active": user.is_active,
                "created_at": user.created_at.isoformat() if user.created_at else None
            }
            users_data.append(user_data)
        
        return {
            "users": users_data,
            "total_results": len(users_data)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطا در جستجو: {str(e)}")

@router.get("/users/{user_id}")
async def get_user_details(user_id: int, db: Session = Depends(get_db)):
    """دریافت اطلاعات کامل یک کاربر"""
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="کاربر یافت نشد")
        
        user_data = {
            "id": user.id,
            "email": user.email,
            "phone": user.phone,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "national_id": user.national_id,
            "role": user.role.value,
            "is_active": user.is_active,
            "is_verified": user.is_verified if hasattr(user, 'is_verified') else False,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "last_login": user.last_login.isoformat() if user.last_login else None
        }
        
        return {"user": user_data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطا در دریافت اطلاعات کاربر: {str(e)}")

@router.post("/users/{user_id}/reset-password")
async def reset_user_password(user_id: int, db: Session = Depends(get_db)):
    """ریست کردن رمز عبور کاربر"""
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="کاربر یافت نشد")
        
        # ایجاد رمز عبور موقت
        temp_password = "Temp@12345"
        # در واقعیت باید هش بشه
        user.password = temp_password
        
        db.commit()
        
        return {
            "message": "رمز عبور با موفقیت ریست شد",
            "temp_password": temp_password,
            "user_id": user_id
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"خطا در ریست رمز عبور: {str(e)}")