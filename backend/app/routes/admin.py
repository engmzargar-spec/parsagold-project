# backend/app/routes/admin.py
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, EmailStr
import os
import secrets
import string
from ..database import get_db
from ..models.models import User, AdminUser
from ..security.auth import get_password_hash, verify_password, create_access_token, get_current_admin, get_current_chief_admin
import logging

# تنظیمات لاگینگ
logger = logging.getLogger(__name__)

router = APIRouter()

# ==================== مدل‌های درخواست ====================

class AdminLoginRequest(BaseModel):
    username: str
    password: str

class AdminUpdateRequest(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    gender: Optional[str] = None
    organizational_position: Optional[str] = None
    role: Optional[str] = None
    access_level: Optional[str] = None
    is_active: Optional[bool] = None
    is_approved: Optional[bool] = None

class VerifyPasswordRequest(BaseModel):
    password: str

class CreateAdminRequest(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    password: str
    role: str = "admin"
    phone: str
    national_id: str
    address: Optional[str] = None

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

# ==================== توابع کمکی ====================

def generate_secure_password(length: int = 12) -> str:
    """تولید رمز عبور امن"""
    characters = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(secrets.choice(characters) for _ in range(length))

def validate_admin_permissions(current_admin: AdminUser, target_admin_id: int = None) -> bool:
    """بررسی مجوزهای ادمین"""
    # مدیر ارشد به همه چیز دسترسی دارد
    if current_admin.role == "chief":
        return True
    
    # ادمین معمولی فقط به اطلاعات خودش دسترسی دارد
    if target_admin_id and current_admin.id == target_admin_id:
        return True
    
    return False

# ==================== endpointهای احراز هویت ====================

@router.post("/verify-password")
async def verify_admin_password(
    request: VerifyPasswordRequest,
    current_admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """تأیید رمز عبور ادمین فعلی - نسخه امن"""
    try:
        logger.info(f"درخواست تأیید رمز برای ادمین: {current_admin.username}")
        
        is_correct = verify_password(request.password, current_admin.password_hash)
        
        if not is_correct:
            logger.warning(f"رمز عبور اشتباه برای ادمین: {current_admin.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="رمز عبور اشتباه است"
            )
        
        logger.info(f"رمز عبور صحیح برای ادمین: {current_admin.username}")
        return {"message": "رمز عبور صحیح است", "verified": True}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"خطا در تأیید رمز عبور: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="خطا در اعتبارسنجی"
        )

@router.post("/login")
async def admin_login(
    request: AdminLoginRequest,
    db: Session = Depends(get_db)
):
    """ورود به سیستم مدیریتی"""
    try:
        logger.info(f"درخواست لاگین برای ادمین: {request.username}")
        
        # 🔍 اضافه کردن لاگ برای دیباگ
        print(f"🔍 درخواست لاگین از: {request.username}")
        
        admin = db.query(AdminUser).filter(AdminUser.username == request.username).first()
        if not admin:
            logger.warning(f"ادمین یافت نشد: {request.username}")
            print(f"❌ ادمین یافت نشد: {request.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="نام کاربری یا رمز عبور اشتباه"
            )
        
        print(f"✅ ادمین پیدا شد: {admin.username}, نقش: {admin.role}, فعال: {admin.is_active}")
        
        # بررسی رمز عبور
        print(f"🔑 بررسی رمز عبور برای: {admin.username}")
        password_valid = verify_password(request.password, admin.password_hash)
        print(f"🔑 نتیجه بررسی رمز: {password_valid}")
        
        if not password_valid:
            logger.warning(f"رمز عبور اشتباه برای ادمین: {request.username}")
            print(f"❌ رمز عبور اشتباه برای: {request.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="نام کاربری یا رمز عبور اشتباه"
            )
        
        # بررسی فعال بودن
        if not admin.is_active:
            logger.warning(f"ادمین غیرفعال سعی در لاگین: {request.username}")
            print(f"❌ ادمین غیرفعال: {request.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="حساب کاربری غیرفعال است"
            )
        
        # بررسی تأیید شدن (برای ادمین‌های غیر chief)
        if admin.role != "chief" and not admin.is_approved:
            logger.warning(f"ادمین تأیید نشده سعی در لاگین: {request.username}")
            print(f"❌ ادمین تأیید نشده: {request.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="حساب کاربری در انتظار تأیید است"
            )
        
        # ایجاد توکن
        token_data = {
            "sub": admin.username,
            "type": "admin",
            "admin_id": admin.id,
            "role": admin.role,
            "is_approved": admin.is_approved
        }
        access_token = create_access_token(token_data)
        
        logger.info(f"لاگین موفق برای ادمین: {admin.username}")
        print(f"🎉 لاگین موفق برای: {admin.username}")
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "admin": {
                "id": admin.id,
                "username": admin.username,
                "email": admin.email,
                "role": admin.role,
                "full_name": admin.full_name,
                "is_approved": admin.is_approved
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"خطا در لاگین ادمین: {str(e)}")
        print(f"💥 خطای سرور در لاگین: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="خطا در ورود به سیستم"
        )

# ==================== مدیریت ادمین‌ها ====================

@router.post("/create-admin")
async def create_admin(
    request: CreateAdminRequest,
    current_admin: AdminUser = Depends(get_current_chief_admin),  # ✅ فقط مدیر ارشد
    db: Session = Depends(get_db)
):
    """ایجاد ادمین جدید - فقط توسط مدیر ارشد"""
    try:
        # بررسی تکراری نبودن username
        existing_admin = db.query(AdminUser).filter(AdminUser.username == request.username).first()
        if existing_admin:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="نام کاربری قبلاً استفاده شده است"
            )
        
        # بررسی تکراری نبودن email
        if request.email:
            existing_email = db.query(AdminUser).filter(AdminUser.email == request.email).first()
            if existing_email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="ایمیل قبلاً استفاده شده است"
                )
        
        # بررسی تکراری نبودن phone و national_id
        if request.phone:
            existing_phone = db.query(AdminUser).filter(AdminUser.phone == request.phone).first()
            if existing_phone:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="شماره تلفن قبلاً استفاده شده است"
                )
        
        if request.national_id:
            existing_national_id = db.query(AdminUser).filter(AdminUser.national_id == request.national_id).first()
            if existing_national_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="کد ملی قبلاً استفاده شده است"
                )
        
        # ایجاد ادمین جدید
        new_admin = AdminUser(
            username=request.username,
            email=request.email,
            full_name=request.full_name,
            password_hash=get_password_hash(request.password),
            role=request.role,
            phone=request.phone,
            national_id=request.national_id,
            address=request.address,
            is_active=True,
            is_approved=False  # نیاز به تأیید مدیر ارشد
        )
        
        db.add(new_admin)
        db.commit()
        db.refresh(new_admin)
        
        logger.info(f"ادمین جدید ایجاد شد: {new_admin.username} توسط {current_admin.username}")
        
        return {
            "message": "ادمین جدید با موفقیت ایجاد شد و در انتظار تأیید است",
            "admin_id": new_admin.id,
            "username": new_admin.username
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"خطا در ایجاد ادمین: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="خطا در ایجاد ادمین"
        )

@router.get("/admins")
async def get_all_admins(
    current_admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: str = Query(None),
    role: str = Query(None),
    is_active: str = Query(None),
    is_approved: str = Query(None),
    gender: str = Query(None),
    access_level: str = Query(None)
):
    """دریافت لیست تمام ادمین‌ها با فیلترهای پیشرفته"""
    try:
        query = db.query(AdminUser)
        
        # مدیران معمولی فقط ادمین‌های تأیید شده را می‌بینند
        if current_admin.role != "chief":
            query = query.filter(AdminUser.is_approved == True)
        
        # فیلتر جستجو
        if search:
            query = query.filter(
                (AdminUser.username.ilike(f"%{search}%")) |
                (AdminUser.email.ilike(f"%{search}%")) |
                (AdminUser.full_name.ilike(f"%{search}%")) |
                (AdminUser.phone.ilike(f"%{search}%")) |
                (AdminUser.national_id.ilike(f"%{search}%")) |
                (AdminUser.organizational_position.ilike(f"%{search}%"))
            )
        
        # فیلتر نقش
        if role and role != "all":
            query = query.filter(AdminUser.role == role)
        
        # فیلتر وضعیت فعال
        if is_active and is_active != "all":
            if is_active == "active":
                query = query.filter(AdminUser.is_active == True)
            elif is_active == "inactive":
                query = query.filter(AdminUser.is_active == False)
        
        # فیلتر وضعیت تأیید
        if is_approved and is_approved != "all" and current_admin.role == "chief":
            if is_approved == "approved":
                query = query.filter(AdminUser.is_approved == True)
            elif is_approved == "pending":
                query = query.filter(AdminUser.is_approved == False)
        
        # فیلتر جنسیت
        if gender and gender != "all":
            query = query.filter(AdminUser.gender == gender)
        
        # فیلتر سطح دسترسی
        if access_level and access_level != "all":
            query = query.filter(AdminUser.access_level == access_level)
        
        # شمارش کل رکوردها قبل از pagination
        total_count = query.count()
        
        # اعمال pagination
        admins = query.order_by(AdminUser.created_at.desc()).offset(skip).limit(limit).all()
        
        admins_data = []
        for admin in admins:
            admin_data = {
                "id": admin.id,
                "username": admin.username,
                "email": admin.email,
                "full_name": admin.full_name,
                "gender": admin.gender,
                "role": admin.role,
                "access_level": admin.access_level,
                "organizational_position": admin.organizational_position,
                "is_active": admin.is_active,
                "is_approved": admin.is_approved,
                "phone": admin.phone,
                "national_id": admin.national_id if current_admin.role == "chief" else None,
                "profile_image": admin.profile_image,
                "last_login": admin.last_login.isoformat() if admin.last_login else None,
                "created_at": admin.created_at.isoformat() if admin.created_at else None,
                "updated_at": admin.updated_at.isoformat() if admin.updated_at else None
            }
            admins_data.append(admin_data)
        
        return {
            "admins": admins_data, 
            "total": total_count,
            "skip": skip,
            "limit": limit
        }
        
    except Exception as e:
        logger.error(f"خطا در دریافت لیست ادمین‌ها: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="خطا در دریافت لیست ادمین‌ها"
        )

@router.put("/update-admin/{admin_id}")
async def update_admin(
    admin_id: int,
    request: AdminUpdateRequest,
    current_admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """ویرایش اطلاعات ادمین"""
    try:
        # بررسی مجوز
        if not validate_admin_permissions(current_admin, admin_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="شما مجوز ویرایش این ادمین را ندارید"
            )
        
        admin = db.query(AdminUser).filter(AdminUser.id == admin_id).first()
        if not admin:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="ادمین یافت نشد"
            )
        
        # بروزرسانی فیلدها
        update_data = {}
        if request.username is not None:
            existing = db.query(AdminUser).filter(AdminUser.username == request.username, AdminUser.id != admin_id).first()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="نام کاربری قبلاً استفاده شده است"
                )
            admin.username = request.username
        
        if request.email is not None:
            existing = db.query(AdminUser).filter(AdminUser.email == request.email, AdminUser.id != admin_id).first()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="ایمیل قبلاً استفاده شده است"
                )
            admin.email = request.email
        
        if request.full_name is not None:
            admin.full_name = request.full_name
        
        if request.phone is not None:
            admin.phone = request.phone
        
        if request.gender is not None:
            admin.gender = request.gender
        
        if request.organizational_position is not None:
            admin.organizational_position = request.organizational_position
        
        if request.role is not None and current_admin.role == "chief":
            admin.role = request.role
        
        if request.access_level is not None:
            admin.access_level = request.access_level
        
        if request.is_active is not None and current_admin.role == "chief":
            admin.is_active = request.is_active
        
        if request.is_approved is not None and current_admin.role == "chief":
            admin.is_approved = request.is_approved
        
        db.commit()
        
        logger.info(f"اطلاعات ادمین {admin_id} توسط {current_admin.username} بروزرسانی شد")
        
        return {"message": "اطلاعات ادمین با موفقیت بروزرسانی شد", "admin_id": admin_id}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"خطا در ویرایش ادمین: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="خطا در ویرایش ادمین"
        )

@router.post("/reset-password/{admin_id}")
async def reset_admin_password(
    admin_id: int,
    current_admin: AdminUser = Depends(get_current_chief_admin),
    db: Session = Depends(get_db)
):
    """ریست رمز عبور ادمین - فقط توسط مدیر ارشد"""
    try:
        admin = db.query(AdminUser).filter(AdminUser.id == admin_id).first()
        if not admin:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="ادمین یافت نشد"
            )
        
        # ایجاد رمز عبور امن
        temp_password = generate_secure_password()
        admin.password_hash = get_password_hash(temp_password)
        
        db.commit()
        
        logger.info(f"رمز عبور ادمین {admin_id} توسط {current_admin.username} ریست شد")
        
        return {
            "message": "رمز عبور با موفقیت ریست شد",
            "temp_password": temp_password,
            "admin_id": admin_id
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"خطا در ریست رمز عبور: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="خطا در ریست رمز عبور"
        )

@router.post("/approve-admin/{admin_id}")
async def approve_admin(
    admin_id: int, 
    current_admin: AdminUser = Depends(get_current_chief_admin),
    db: Session = Depends(get_db)
):
    """تأیید ادمین جدید - فقط توسط chief"""
    try:
        admin = db.query(AdminUser).filter(AdminUser.id == admin_id).first()
        if not admin:
            raise HTTPException(status_code=404, detail="ادمین یافت نشد")
        
        if admin.is_approved:
            raise HTTPException(status_code=400, detail="این ادمین قبلاً تأیید شده است")
        
        admin.is_approved = True
        db.commit()
        
        return {
            "message": "ادمین با موفقیت تأیید شد",
            "admin_id": admin_id,
            "username": admin.username
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"خطا در تأیید ادمین: {str(e)}")

@router.get("/activity-logs/{admin_id}")
async def get_admin_activity_logs(
    admin_id: int,
    current_admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """دریافت تاریخچه فعالیت ادمین"""
    try:
        # بررسی مجوز
        if not validate_admin_permissions(current_admin, admin_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="شما مجوز مشاهده فعالیت این ادمین را ندارید"
            )
        
        # در اینجا می‌توانید لاگ‌های فعالیت را از دیتابیس بخوانید
        # فعلاً داده‌های نمونه برمی‌گردانیم
        sample_logs = [
            {
                "id": 1,
                "action": "login",
                "description": "ورود به سیستم",
                "timestamp": "2024-01-15T10:30:00",
                "ip_address": "192.168.1.100"
            },
            {
                "id": 2,
                "action": "user_management",
                "description": "ویرایش اطلاعات کاربر",
                "timestamp": "2024-01-15T11:15:00",
                "ip_address": "192.168.1.100"
            }
        ]
        
        return {"logs": sample_logs}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"خطا در دریافت تاریخچه فعالیت: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="خطا در دریافت تاریخچه فعالیت"
        )

@router.post("/upload-profile-image/{admin_id}")
async def upload_profile_image(
    admin_id: int,
    profile_image: UploadFile = File(...),
    current_admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """آپلود عکس پروفایل برای ادمین"""
    try:
        # پیدا کردن ادمین
        admin = db.query(AdminUser).filter(AdminUser.id == admin_id).first()
        if not admin:
            raise HTTPException(status_code=404, detail="ادمین یافت نشد")
        
        # بررسی مجوز (فقط خود ادمین یا chief می‌توانند آپلود کنند)
        if current_admin.role != "chief" and current_admin.id != admin_id:
            raise HTTPException(status_code=403, detail="شما مجوز آپلود عکس برای این ادمین را ندارید")
        
        # بررسی نوع فایل
        if not profile_image.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="فایل باید تصویر باشد")
        
        # خواندن محتوای فایل
        contents = await profile_image.read()
        
        # بررسی حجم فایل (حداکثر 5MB)
        if len(contents) > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="حجم فایل نباید بیشتر از 5 مگابایت باشد")
        
        # ایجاد نام فایل جدید
        file_extension = profile_image.filename.split('.')[-1]
        filename = f"admin_{admin_id}_profile.{file_extension}"
        
        # مسیر ذخیره‌سازی
        upload_dir = "uploads/profiles"
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, filename)
        
        # ذخیره فایل جدید
        with open(file_path, "wb") as f:
            f.write(contents)
        
        # آدرس فایل برای ذخیره در دیتابیس
        file_url = f"/static/profiles/{filename}"
        
        # بروزرسانی مسیر عکس در دیتابیس
        admin.profile_image = file_url
        db.commit()
        
        return {
            "message": "عکس پروفایل با موفقیت آپلود شد",
            "file_url": file_url
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"خطا در آپلود عکس: {str(e)}")

# ==================== endpointهای عمومی ====================

@router.get("/test")
async def admin_test(current_admin: AdminUser = Depends(get_current_admin)):
    return {"message": "داشبورد مدیریتی پارسا گلد فعال است", "user": current_admin.username}

@router.get("/dashboard/stats")
async def get_admin_stats(
    current_admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """آمار کلی برای داشبورد مدیریتی"""
    try:
        total_users = db.query(User).count()
        total_admins = db.query(AdminUser).count()
        active_users = db.query(User).filter(User.is_active == True).count()
        active_admins = db.query(AdminUser).filter(AdminUser.is_active == True).count()
        
        stats = {
            "total_users": total_users,
            "total_admins": total_admins,
            "active_users": active_users,
            "active_admins": active_admins,
        }
        
        # فقط مدیر ارشد می‌تواند آمار حساس را ببیند
        if current_admin.role == "chief":
            pending_admins = db.query(AdminUser).filter(AdminUser.is_approved == False).count()
            stats["pending_approvals"] = pending_admins
        
        return stats
        
    except Exception as e:
        logger.error(f"خطا در دریافت آمار: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="خطا در دریافت آمار"
        )