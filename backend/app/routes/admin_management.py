# backend/app/routes/admin_management.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from enum import Enum

from ..database import get_db
from ..models.models import User, UserRole, AdminUser, Gender
from ..security.auth import get_current_admin_user, create_access_token
from ..services.password_manager import get_password_hash, verify_password, generate_temporary_password  # ✅ استفاده از سرویس مرکزی
from ..schemas.schemas import AdminUserCreate, AdminUserUpdate, AdminUserResponse, AdminUserListResponse

# ✅ تغییر: prefix به "/management" و تغییر نام endpointها
router = APIRouter(prefix="/management", tags=["Admin Management"])

# ==================== مدل‌های درخواست ====================

class ApprovalAction(str, Enum):
    APPROVED = "approved"
    REJECTED = "rejected"

class ApprovalRequest(BaseModel):
    admin_id: int
    action: ApprovalAction

class VerifyPasswordRequest(BaseModel):
    password: str
    admin_id: int

class ResetPasswordRequest(BaseModel):
    admin_id: int

# ==================== مدیریت پیشرفته ادمین‌ها ====================

@router.post("/register", response_model=AdminUserResponse)
async def register_admin(
    admin_data: AdminUserCreate,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_admin_user)
):
    """ثبت ادمین جدید با سیستم پیشرفته"""
    try:
        # بررسی وجود کاربر با ایمیل یا نام کاربری
        existing_admin = db.query(AdminUser).filter(
            (AdminUser.email == admin_data.email) | 
            (AdminUser.username == admin_data.username)
        ).first()
        
        if existing_admin:
            if existing_admin.email == admin_data.email:
                raise HTTPException(
                    status_code=400,
                    detail="ادمین با این ایمیل قبلاً ثبت شده است"
                )
            else:
                raise HTTPException(
                    status_code=400,
                    detail="ادمین با این نام کاربری قبلاً ثبت شده است"
                )
        
        # بررسی تعداد Chiefها
        if admin_data.role == "chief":
            chief_count = db.query(AdminUser).filter(
                AdminUser.role == "chief",
                AdminUser.is_active == True
            ).count()
            if chief_count >= 3:  # حداکثر 3 Chief
                raise HTTPException(
                    status_code=400,
                    detail="حداکثر 3 Chief در سیستم مجاز است"
                )
        
        # ایجاد ادمین جدید - ✅ استفاده از سرویس مرکزی برای هش کردن
        new_admin = AdminUser(
            username=admin_data.username,
            email=admin_data.email,
            full_name=admin_data.full_name,
            password_hash=get_password_hash(admin_data.password),  # ✅ استفاده از سرویس مرکزی
            phone=admin_data.phone,
            gender=admin_data.gender,
            profile_image=admin_data.profile_image,
            organizational_position=admin_data.organizational_position,
            role=admin_data.role,
            access_level=admin_data.access_level,
            is_active=False,  # نیاز به تأیید دارد
            is_approved=False
        )
        
        db.add(new_admin)
        db.commit()
        db.refresh(new_admin)
        
        print(f"✅ ادمین جدید ایجاد شد: {new_admin.email} - نقش: {new_admin.role}")
        
        return AdminUserResponse(
            id=new_admin.id,
            username=new_admin.username,
            email=new_admin.email,
            full_name=new_admin.full_name,
            phone=new_admin.phone,
            gender=new_admin.gender,
            profile_image=new_admin.profile_image,
            organizational_position=new_admin.organizational_position,
            role=new_admin.role,
            access_level=new_admin.access_level,
            is_active=new_admin.is_active,
            is_approved=new_admin.is_approved,
            last_login=new_admin.last_login,
            created_at=new_admin.created_at,
            updated_at=new_admin.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ خطا در ایجاد ادمین: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="خطای سرور در ایجاد ادمین"
        )

@router.post("/verify-password")
async def verify_admin_password(
    request: VerifyPasswordRequest,
    current_user: AdminUser = Depends(get_current_admin_user)
):
    """
    تأیید رمز عبور ادمین فعلی
    """
    try:
        print(f"🔐 درخواست تأیید رمز برای ادمین ID: {request.admin_id}")
        print(f"🔐 ادمین جاری: {current_user.username} (ID: {current_user.id})")
        print(f"🔐 طول رمز دریافتی: {len(request.password)}")
        
        # بررسی اینکه ادمین فقط می‌تواند رمز خودش را تأیید کند
        if current_user.id != request.admin_id:
            print(f"❌ خطای دسترسی: ادمین {current_user.id} سعی در تأیید رمز ادمین {request.admin_id}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="شما فقط می‌توانید رمز عبور خود را تأیید کنید"
            )
        
        # تأیید رمز عبور - ✅ استفاده از سرویس مرکزی
        is_correct_password = verify_password(request.password, current_user.password_hash)
        
        print(f"🔐 نتیجه تأیید رمز: {is_correct_password}")
        
        if is_correct_password:
            return {
                "success": True,
                "message": "رمز عبور صحیح است"
            }
        else:
            print(f"❌ رمز عبور اشتباه برای ادمین: {current_user.username}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="رمز عبور اشتباه است"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ خطا در تأیید رمز عبور: {str(e)}")
        import traceback
        print(f"❌ Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="خطا در تأیید رمز عبور"
        )

@router.post("/reset-password/{admin_id}")
async def reset_admin_password(
    admin_id: int,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_admin_user)
):
    """ریست رمز عبور ادمین و تولید رمز موقت"""
    # فقط Chiefها و سوپر ادمین‌ها می‌توانند رمز عبور ریست کنند
    if current_user.role not in ["chief", "super_admin"]:
        raise HTTPException(
            status_code=403,
            detail="فقط Chiefها و سوپر ادمین‌ها می‌توانند رمز عبور ریست کنند"
        )
    
    admin = db.query(AdminUser).filter(AdminUser.id == admin_id).first()
    
    if not admin:
        raise HTTPException(status_code=404, detail="ادمین مورد نظر یافت نشد")
    
    # کاربر نمی‌تواند رمز خودش را ریست کند
    if admin_id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="برای تغییر رمز عبور خود از بخش پروفایل استفاده کنید"
        )
    
    try:
        # تولید رمز موقت - ✅ استفاده از سرویس مرکزی
        temp_password = generate_temporary_password(10)
        hashed_password = get_password_hash(temp_password)  # ✅ استفاده از سرویس مرکزی
        
        # بروزرسانی رمز عبور
        admin.password_hash = hashed_password
        db.commit()
        
        print(f"🔑 رمز عبور ادمین {admin.email} ریست شد توسط {current_user.email}")
        
        return {
            "success": True,
            "message": "رمز عبور با موفقیت ریست شد",
            "temp_password": temp_password,
            "admin_email": admin.email
        }
        
    except Exception as e:
        db.rollback()
        print(f"❌ خطا در ریست رمز عبور: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="خطا در ریست رمز عبور"
        )

@router.get("/pending", response_model=List[AdminUserResponse])
async def get_pending_approvals(
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_admin_user)
):
    """دریافت ادمین‌های در انتظار تأیید"""
    # فقط Chiefها می‌توانند تأیید کنند
    if current_user.role != "chief":
        raise HTTPException(
            status_code=403,
            detail="فقط Chiefها می‌توانند درخواست‌ها را تأیید کنند"
        )
    
    pending_admins = db.query(AdminUser).filter(
        AdminUser.is_approved == False,
        AdminUser.is_active == False
    ).all()
    
    return [
        AdminUserResponse(
            id=admin.id,
            username=admin.username,
            email=admin.email,
            full_name=admin.full_name,
            phone=admin.phone,
            gender=admin.gender,
            profile_image=admin.profile_image,
            organizational_position=admin.organizational_position,
            role=admin.role,
            access_level=admin.access_level,
            is_active=admin.is_active,
            is_approved=admin.is_approved,
            last_login=admin.last_login,
            created_at=admin.created_at,
            updated_at=admin.updated_at
        )
        for admin in pending_admins
    ]

@router.post("/approve", response_model=AdminUserResponse)
async def approve_admin(
    approval_data: ApprovalRequest,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_admin_user)
):
    """تأیید یا رد ادمین جدید"""
    # فقط Chiefها می‌توانند تأیید کنند
    if current_user.role != "chief":
        raise HTTPException(
            status_code=403,
            detail="فقط Chiefها می‌توانند درخواست‌ها را تأیید کنند"
        )
    
    admin = db.query(AdminUser).filter(AdminUser.id == approval_data.admin_id).first()
    
    if not admin:
        raise HTTPException(status_code=404, detail="ادمین مورد نظر یافت نشد")
    
    if admin.is_approved:
        raise HTTPException(status_code=400, detail="این ادمین قبلاً تأیید شده است")
    
    if approval_data.action == ApprovalAction.APPROVED:
        admin.is_active = True
        admin.is_approved = True
        action_message = "تأیید شد"
    else:
        # در صورت رد درخواست، کاربر حذف می‌شود
        db.delete(admin)
        db.commit()
        raise HTTPException(status_code=200, detail="درخواست ادمین رد و حذف شد")
    
    db.commit()
    db.refresh(admin)
    
    print(f"✅ ادمین {admin.email} {action_message} توسط {current_user.email}")
    
    return AdminUserResponse(
        id=admin.id,
        username=admin.username,
        email=admin.email,
        full_name=admin.full_name,
        phone=admin.phone,
        gender=admin.gender,
        profile_image=admin.profile_image,
        organizational_position=admin.organizational_position,
        role=admin.role,
        access_level=admin.access_level,
        is_active=admin.is_active,
        is_approved=admin.is_approved,
        last_login=admin.last_login,
        created_at=admin.created_at,
        updated_at=admin.updated_at
    )

@router.get("/all", response_model=List[AdminUserResponse])
async def get_all_management_admins(
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_admin_user)
):
    """دریافت لیست تمام ادمین‌ها (مدیریت پیشرفته)"""
    # فقط Chiefها و سوپر ادمین‌ها دسترسی دارند
    if current_user.role not in ["chief", "super_admin"]:
        raise HTTPException(
            status_code=403,
            detail="فقط Chiefها و سوپر ادمین‌ها دسترسی دارند"
        )
    
    admins = db.query(AdminUser).all()
    
    return [
        AdminUserResponse(
            id=admin.id,
            username=admin.username,
            email=admin.email,
            full_name=admin.full_name,
            phone=admin.phone,
            gender=admin.gender,
            profile_image=admin.profile_image,
            organizational_position=admin.organizational_position,
            role=admin.role,
            access_level=admin.access_level,
            is_active=admin.is_active,
            is_approved=admin.is_approved,
            last_login=admin.last_login,
            created_at=admin.created_at,
            updated_at=admin.updated_at
        )
        for admin in admins
    ]

@router.get("/me", response_model=AdminUserResponse)
async def get_current_admin_info(
    current_user: AdminUser = Depends(get_current_admin_user)
):
    """دریافت اطلاعات ادمین جاری"""
    return AdminUserResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        full_name=current_user.full_name,
        phone=current_user.phone,
        gender=current_user.gender,
        profile_image=current_user.profile_image,
        organizational_position=current_user.organizational_position,
        role=current_user.role,
        access_level=current_user.access_level,
        is_active=current_user.is_active,
        is_approved=current_user.is_approved,
        last_login=current_user.last_login,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at
    )

@router.put("/{admin_id}", response_model=AdminUserResponse)
async def update_admin(
    admin_id: int,
    admin_data: AdminUserUpdate,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_admin_user)
):
    """بروزرسانی اطلاعات ادمین"""
    # فقط Chiefها و سوپر ادمین‌ها می‌توانند ادمین‌ها را بروزرسانی کنند
    if current_user.role not in ["chief", "super_admin"]:
        raise HTTPException(
            status_code=403,
            detail="فقط Chiefها و سوپر ادمین‌ها می‌توانند ادمین‌ها را بروزرسانی کنند"
        )
    
    admin = db.query(AdminUser).filter(AdminUser.id == admin_id).first()
    
    if not admin:
        raise HTTPException(status_code=404, detail="ادمین مورد نظر یافت نشد")
    
    # کاربر نمی‌تواند خودش را بروزرسانی کند (مگر از طریق پروفایل شخصی)
    if admin_id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="برای بروزرسانی پروفایل خود از بخش پروفایل استفاده کنید"
        )
    
    # بروزرسانی فیلدها
    update_data = admin_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(admin, field, value)
    
    db.commit()
    db.refresh(admin)
    
    print(f"📝 ادمین {admin.email} بروزرسانی شد توسط {current_user.email}")
    
    return AdminUserResponse(
        id=admin.id,
        username=admin.username,
        email=admin.email,
        full_name=admin.full_name,
        phone=admin.phone,
        gender=admin.gender,
        profile_image=admin.profile_image,
        organizational_position=admin.organizational_position,
        role=admin.role,
        access_level=admin.access_level,
        is_active=admin.is_active,
        is_approved=admin.is_approved,
        last_login=admin.last_login,
        created_at=admin.created_at,
        updated_at=admin.updated_at
    )

@router.delete("/{admin_id}")
async def delete_management_admin(
    admin_id: int,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_admin_user)
):
    """حذف ادمین (مدیریت پیشرفته)"""
    # فقط Chiefها می‌توانند ادمین حذف کنند
    if current_user.role != "chief":
        raise HTTPException(
            status_code=403,
            detail="فقط Chiefها می‌توانند ادمین حذف کنند"
        )
    
    # کاربر نمی‌تواند خودش را حذف کند
    if admin_id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="شما نمی‌توانید حساب خودتان را حذف کنید"
        )
    
    admin = db.query(AdminUser).filter(AdminUser.id == admin_id).first()
    
    if not admin:
        raise HTTPException(status_code=404, detail="ادمین مورد نظر یافت نشد")
    
    db.delete(admin)
    db.commit()
    
    print(f"🗑️ ادمین {admin.email} حذف شد توسط {current_user.email}")
    
    return {"message": "ادمین با موفقیت حذف شد"}

@router.post("/demote/{admin_id}", response_model=AdminUserResponse)
async def demote_admin(
    admin_id: int,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_admin_user)
):
    """کاهش سطح دسترسی Chief به admin"""
    if current_user.role != "chief":
        raise HTTPException(
            status_code=403,
            detail="فقط Chiefها می‌توانند این عمل را انجام دهند"
        )
    
    admin = db.query(AdminUser).filter(AdminUser.id == admin_id).first()
    
    if not admin:
        raise HTTPException(status_code=404, detail="ادمین مورد نظر یافت نشد")
    
    # کاربر نمی‌تواند خودش را downgrade کند
    if admin_id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="شما نمی‌توانید سطح دسترسی خودتان را کاهش دهید"
        )
    
    # فقط Chiefها می‌توانند downgrade شوند
    if admin.role != "chief":
        raise HTTPException(
            status_code=400,
            detail="فقط Chiefها می‌توانند downgrade شوند"
        )
    
    # کاهش سطح دسترسی
    admin.role = "admin"
    db.commit()
    db.refresh(admin)
    
    print(f"📉 ادمین {admin.email} به admin کاهش یافت توسط {current_user.email}")
    
    return AdminUserResponse(
        id=admin.id,
        username=admin.username,
        email=admin.email,
        full_name=admin.full_name,
        phone=admin.phone,
        gender=admin.gender,
        profile_image=admin.profile_image,
        organizational_position=admin.organizational_position,
        role=admin.role,
        access_level=admin.access_level,
        is_active=admin.is_active,
        is_approved=admin.is_approved,
        last_login=admin.last_login,
        created_at=admin.created_at,
        updated_at=admin.updated_at
    )

@router.post("/promote/{admin_id}", response_model=AdminUserResponse)
async def promote_admin(
    admin_id: int,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_admin_user)
):
    """ارتقاء ادمین به سوپر ادمین"""
    if current_user.role != "chief":
        raise HTTPException(
            status_code=403,
            detail="فقط Chiefها می‌توانند این عمل را انجام دهند"
        )
    
    admin = db.query(AdminUser).filter(AdminUser.id == admin_id).first()
    
    if not admin:
        raise HTTPException(status_code=404, detail="ادمین مورد نظر یافت نشد")
    
    # ارتقاء به سوپر ادمین
    admin.role = "super_admin"
    db.commit()
    db.refresh(admin)
    
    print(f"🚀 ادمین {admin.email} به سوپر ادمین ارتقاء یافت توسط {current_user.email}")
    
    return AdminUserResponse(
        id=admin.id,
        username=admin.username,
        email=admin.email,
        full_name=admin.full_name,
        phone=admin.phone,
        gender=admin.gender,
        profile_image=admin.profile_image,
        organizational_position=admin.organizational_position,
        role=admin.role,
        access_level=admin.access_level,
        is_active=admin.is_active,
        is_approved=admin.is_approved,
        last_login=admin.last_login,
        created_at=admin.created_at,
        updated_at=admin.updated_at
    )

@router.get("/stats")
async def get_management_stats(
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_admin_user)
):
    """آمار پیشرفته مدیریتی"""
    # فقط Chiefها و سوپر ادمین‌ها دسترسی دارند
    if current_user.role not in ["chief", "super_admin"]:
        raise HTTPException(
            status_code=403,
            detail="فقط Chiefها و سوپر ادمین‌ها دسترسی دارند"
        )
    
    total_users = db.query(User).count()
    total_admins = db.query(AdminUser).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    
    # آمار Chiefها
    chief_count = db.query(AdminUser).filter(
        AdminUser.role == "chief",
        AdminUser.is_active == True
    ).count()
    
    # آمار ادمین‌های در انتظار تأیید
    pending_admins_count = db.query(AdminUser).filter(
        AdminUser.is_approved == False
    ).count()
    
    # آمار سوپر ادمین‌ها
    super_admin_count = db.query(AdminUser).filter(
        AdminUser.role == "super_admin",
        AdminUser.is_active == True
    ).count()
    
    # آمار بر اساس جنسیت
    male_admins = db.query(AdminUser).filter(AdminUser.gender == Gender.MALE).count()
    female_admins = db.query(AdminUser).filter(AdminUser.gender == Gender.FEMALE).count()
    
    stats = {
        "total_users": total_users,
        "total_admins": total_admins,
        "active_users": active_users,
        "chief_count": chief_count,
        "super_admin_count": super_admin_count,
        "pending_admins_count": pending_admins_count,
        "male_admins": male_admins,
        "female_admins": female_admins,
        "max_chief_allowed": 3,
        "total_transactions": 0,
        "total_trades": 0,
        "pending_verifications": pending_admins_count,
        "system_health": "excellent"
    }
    
    return stats

@router.get("/{admin_id}", response_model=AdminUserResponse)
async def get_management_admin_by_id(
    admin_id: int,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_admin_user)
):
    """دریافت اطلاعات ادمین خاص (مدیریت پیشرفته)"""
    # فقط Chiefها و سوپر ادمین‌ها دسترسی دارند
    if current_user.role not in ["chief", "super_admin"]:
        raise HTTPException(
            status_code=403,
            detail="فقط Chiefها و سوپر ادمین‌ها دسترسی دارند"
        )
    
    admin = db.query(AdminUser).filter(AdminUser.id == admin_id).first()
    
    if not admin:
        raise HTTPException(status_code=404, detail="ادمین مورد نظر یافت نشد")
    
    return AdminUserResponse(
        id=admin.id,
        username=admin.username,
        email=admin.email,
        full_name=admin.full_name,
        phone=admin.phone,
        gender=admin.gender,
        profile_image=admin.profile_image,
        organizational_position=admin.organizational_position,
        role=admin.role,
        access_level=admin.access_level,
        is_active=admin.is_active,
        is_approved=admin.is_approved,
        last_login=admin.last_login,
        created_at=admin.created_at,
        updated_at=admin.updated_at
    )