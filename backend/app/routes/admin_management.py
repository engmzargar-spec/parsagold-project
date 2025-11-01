from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.models import User, UserRole, AccessGrade, Gender
from ..schemas.schemas import AdminCreate, AdminResponse, ApprovalAction
from app.security.auth import get_current_admin_user, get_password_hash, MAX_CHIEF_USERS

# ✅ تغییر: prefix به "/management" تغییر کرد
router = APIRouter(prefix="/management", tags=["Admin Management"])

# ایجاد ادمین جدید
@router.post("/register-admin", response_model=AdminResponse)
async def register_admin(
    admin_data: AdminCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    try:
        # بررسی وجود کاربر با تمام فیلدهای منحصربفرد
        existing_user = db.query(User).filter(
            (User.email == admin_data.email) | 
            (User.username == admin_data.username) |
            (User.phone == admin_data.phone) | 
            (User.national_id == admin_data.national_id)
        ).first()
        
        if existing_user:
            if existing_user.email == admin_data.email:
                raise HTTPException(
                    status_code=400,
                    detail="کاربر با این ایمیل قبلاً ثبت شده است"
                )
            elif existing_user.username == admin_data.username:
                raise HTTPException(
                    status_code=400,
                    detail="کاربر با این نام کاربری قبلاً ثبت شده است"
                )
            elif existing_user.phone == admin_data.phone:
                raise HTTPException(
                    status_code=400,
                    detail="کاربر با این شماره تلفن قبلاً ثبت شده است"
                )
            elif existing_user.national_id == admin_data.national_id:
                raise HTTPException(
                    status_code=400,
                    detail="کاربر با این کد ملی قبلاً ثبت شده است"
                )
        
        # بررسی تعداد Chiefها
        if admin_data.access_grade == AccessGrade.CHIEF:
            chief_count = db.query(User).filter(
                User.access_grade == AccessGrade.CHIEF,
                User.is_active == True
            ).count()
            if chief_count >= MAX_CHIEF_USERS:
                raise HTTPException(
                    status_code=400,
                    detail=f"حداکثر {MAX_CHIEF_USERS} Chief در سیستم مجاز است"
                )
        
        # بررسی آیا این اولین ادمین است
        is_first_admin = db.query(User).filter(
            User.role.in_([UserRole.ADMIN, UserRole.SUPER_ADMIN])
        ).count() == 0
        
        # اگر سوپر ادمین باشد، نیازی به تأیید ندارد
        is_super_admin = current_user.role == UserRole.SUPER_ADMIN if current_user else False
        needs_approval = not (is_first_admin or is_super_admin)
        
        # ایجاد کاربر ادمین با تمام فیلدها
        user = User(
            username=admin_data.username,
            email=admin_data.email,
            phone=admin_data.phone,
            first_name=admin_data.first_name,
            last_name=admin_data.last_name,
            national_id=admin_data.national_id,
            password=get_password_hash(admin_data.password),
            
            # فیلدهای جدید
            date_of_birth=admin_data.date_of_birth,
            gender=admin_data.gender,
            address=admin_data.address,
            postal_code=admin_data.postal_code,
            country=admin_data.country,
            city=admin_data.city,
            
            role=UserRole.ADMIN,
            access_grade=admin_data.access_grade,
            is_active=is_first_admin or is_super_admin,  # اولین ادمین یا سوپر ادمین فعال است
            needs_approval=needs_approval,
            is_verified=is_first_admin or is_super_admin  # اولین ادمین یا سوپر ادمین تأیید شده است
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        print(f"✅ ادمین جدید ایجاد شد: {user.email} - سطح دسترسی: {user.access_grade.value}")
        
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ خطا در ایجاد ادمین: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="خطای سرور در ایجاد ادمین"
        )

# دریافت لیست ادمین‌های در انتظار تأیید
@router.get("/pending-approvals", response_model=List[AdminResponse])
async def get_pending_approvals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    # فقط Chiefها و سوپر ادمین‌ها می‌توانند تأیید کنند
    if current_user.access_grade != AccessGrade.CHIEF and current_user.role != UserRole.SUPER_ADMIN:
        raise HTTPException(
            status_code=403,
            detail="فقط Chiefها و سوپر ادمین‌ها می‌توانند درخواست‌ها را تأیید کنند"
        )
    
    pending_admins = db.query(User).filter(
        User.role == UserRole.ADMIN,
        User.needs_approval == True,
        User.is_active == False
    ).all()
    
    return pending_admins

# تأیید ادمین
@router.post("/approve-admin", response_model=AdminResponse)
async def approve_admin(
    approval_data: ApprovalAction,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    # فقط Chiefها و سوپر ادمین‌ها می‌توانند تأیید کنند
    if current_user.access_grade != AccessGrade.CHIEF and current_user.role != UserRole.SUPER_ADMIN:
        raise HTTPException(
            status_code=403,
            detail="فقط Chiefها و سوپر ادمین‌ها می‌توانند درخواست‌ها را تأیید کنند"
        )
    
    admin = db.query(User).filter(
        User.id == approval_data.admin_id,
        User.role == UserRole.ADMIN
    ).first()
    
    if not admin:
        raise HTTPException(
            status_code=404,
            detail="ادمین مورد نظر یافت نشد"
        )
    
    if not admin.needs_approval:
        raise HTTPException(
            status_code=400,
            detail="این ادمین نیازی به تأیید ندارد"
        )
    
    if approval_data.action.value == "approved":
        admin.is_active = True
        admin.needs_approval = False
        admin.is_verified = True
        admin.approved_by = current_user.id
        action_message = "تأیید شد"
    else:
        # در صورت رد درخواست، کاربر غیرفعال می‌شود
        admin.is_active = False
        admin.needs_approval = False
        action_message = "رد شد"
    
    db.commit()
    db.refresh(admin)
    
    print(f"✅ ادمین {admin.email} {action_message} توسط {current_user.email}")
    
    return admin

# دریافت لیست تمام ادمین‌ها
@router.get("/admins", response_model=List[AdminResponse])
async def get_all_admins(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    admins = db.query(User).filter(
        User.role.in_([UserRole.ADMIN, UserRole.SUPER_ADMIN])
    ).all()
    
    return admins

# دریافت اطلاعات ادمین جاری
@router.get("/me", response_model=AdminResponse)
async def get_current_admin_info(
    current_user: User = Depends(get_current_admin_user)
):
    return current_user

# حذف ادمین
@router.delete("/admins/{admin_id}")
async def delete_admin(
    admin_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    # فقط Chiefها و سوپر ادمین‌ها می‌توانند ادمین حذف کنند
    if current_user.access_grade != AccessGrade.CHIEF and current_user.role != UserRole.SUPER_ADMIN:
        raise HTTPException(
            status_code=403,
            detail="فقط Chiefها و سوپر ادمین‌ها می‌توانند ادمین حذف کنند"
        )
    
    # کاربر نمی‌تواند خودش را حذف کند
    if admin_id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="شما نمی‌توانید حساب خودتان را حذف کنید"
        )
    
    admin = db.query(User).filter(
        User.id == admin_id,
        User.role.in_([UserRole.ADMIN, UserRole.SUPER_ADMIN])
    ).first()
    
    if not admin:
        raise HTTPException(
            status_code=404,
            detail="ادمین مورد نظر یافت نشد"
        )
    
    # جلوگیری از حذف آخرین سوپر ادمین
    if admin.role == UserRole.SUPER_ADMIN:
        super_admin_count = db.query(User).filter(
            User.role == UserRole.SUPER_ADMIN,
            User.is_active == True
        ).count()
        
        if super_admin_count <= 1:
            raise HTTPException(
                status_code=400,
                detail="نمی‌توان آخرین سوپر ادمین سیستم را حذف کرد"
            )
    
    db.delete(admin)
    db.commit()
    
    print(f"🗑️ ادمین {admin.email} حذف شد توسط {current_user.email}")
    
    return {"message": "ادمین با موفقیت حذف شد"}

# کاهش سطح دسترسی Chief به Grade1
@router.post("/demote-to-grade1/{admin_id}", response_model=AdminResponse)
async def demote_to_grade1(
    admin_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """کاهش سطح دسترسی Chief به Grade1 (به جای حذف)"""
    if current_user.access_grade != AccessGrade.CHIEF and current_user.role != UserRole.SUPER_ADMIN:
        raise HTTPException(
            status_code=403,
            detail="فقط Chiefها و سوپر ادمین‌ها می‌توانند این عمل را انجام دهند"
        )
    
    admin = db.query(User).filter(
        User.id == admin_id,
        User.role.in_([UserRole.ADMIN, UserRole.SUPER_ADMIN])
    ).first()
    
    if not admin:
        raise HTTPException(
            status_code=404,
            detail="ادمین مورد نظر یافت نشد"
        )
    
    # کاربر نمی‌تواند خودش را downgrade کند
    if admin_id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="شما نمی‌توانید سطح دسترسی خودتان را کاهش دهید"
        )
    
    # سوپر ادمین نمی‌تواند downgrade شود
    if admin.role == UserRole.SUPER_ADMIN:
        raise HTTPException(
            status_code=400,
            detail="نمی‌توان سطح دسترسی سوپر ادمین را تغییر داد"
        )
    
    # کاهش سطح دسترسی
    admin.access_grade = AccessGrade.GRADE1
    db.commit()
    db.refresh(admin)
    
    print(f"📉 ادمین {admin.email} به Grade1 کاهش یافت توسط {current_user.email}")
    
    return admin

# غیرفعال کردن ادمین
@router.post("/deactivate-admin/{admin_id}", response_model=AdminResponse)
async def deactivate_admin(
    admin_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """غیرفعال کردن ادمین (به جای حذف)"""
    if current_user.access_grade != AccessGrade.CHIEF and current_user.role != UserRole.SUPER_ADMIN:
        raise HTTPException(
            status_code=403,
            detail="فقط Chiefها و سوپر ادمین‌ها می‌توانند ادمین غیرفعال کنند"
        )
    
    admin = db.query(User).filter(
        User.id == admin_id,
        User.role.in_([UserRole.ADMIN, UserRole.SUPER_ADMIN])
    ).first()
    
    if not admin:
        raise HTTPException(
            status_code=404,
            detail="ادمین مورد نظر یافت نشد"
        )
    
    # کاربر نمی‌تواند خودش را غیرفعال کند
    if admin_id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="شما نمی‌توانید حساب خودتان را غیرفعال کنید"
        )
    
    # جلوگیری از غیرفعال کردن آخرین سوپر ادمین
    if admin.role == UserRole.SUPER_ADMIN:
        active_super_admins = db.query(User).filter(
            User.role == UserRole.SUPER_ADMIN,
            User.is_active == True
        ).count()
        
        if active_super_admins <= 1:
            raise HTTPException(
                status_code=400,
                detail="نمی‌توان آخرین سوپر ادمین فعال را غیرفعال کرد"
            )
    
    # غیرفعال کردن ادمین
    admin.is_active = False
    db.commit()
    db.refresh(admin)
    
    print(f"🚫 ادمین {admin.email} غیرفعال شد توسط {current_user.email}")
    
    return admin

# فعال کردن ادمین غیرفعال
@router.post("/activate-admin/{admin_id}", response_model=AdminResponse)
async def activate_admin(
    admin_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """فعال کردن ادمین غیرفعال شده"""
    if current_user.access_grade != AccessGrade.CHIEF and current_user.role != UserRole.SUPER_ADMIN:
        raise HTTPException(
            status_code=403,
            detail="فقط Chiefها و سوپر ادمین‌ها می‌توانند ادمین فعال کنند"
        )
    
    admin = db.query(User).filter(
        User.id == admin_id,
        User.role.in_([UserRole.ADMIN, UserRole.SUPER_ADMIN])
    ).first()
    
    if not admin:
        raise HTTPException(
            status_code=404,
            detail="ادمین مورد نظر یافت نشد"
        )
    
    # فعال کردن ادمین
    admin.is_active = True
    db.commit()
    db.refresh(admin)
    
    print(f"✅ ادمین {admin.email} فعال شد توسط {current_user.email}")
    
    return admin

# آمار داشبورد مدیریتی
@router.get("/dashboard-stats")
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    total_users = db.query(User).filter(User.role == UserRole.USER).count()
    total_admins = db.query(User).filter(User.role.in_([UserRole.ADMIN, UserRole.SUPER_ADMIN])).count()
    active_users = db.query(User).filter(
        User.role == UserRole.USER, 
        User.is_active == True
    ).count()
    
    # آمار Chiefها
    chief_count = db.query(User).filter(
        User.access_grade == AccessGrade.CHIEF,
        User.is_active == True
    ).count()
    
    # آمار ادمین‌های در انتظار تأیید
    pending_admins_count = db.query(User).filter(
        User.role == UserRole.ADMIN,
        User.needs_approval == True
    ).count()
    
    # آمار سوپر ادمین‌ها
    super_admin_count = db.query(User).filter(
        User.role == UserRole.SUPER_ADMIN,
        User.is_active == True
    ).count()
    
    stats = {
        "total_users": total_users,
        "total_admins": total_admins,
        "active_users": active_users,
        "chief_count": chief_count,
        "super_admin_count": super_admin_count,
        "pending_admins_count": pending_admins_count,
        "max_chief_allowed": MAX_CHIEF_USERS,
        "total_transactions": 0,
        "total_trades": 0,
        "pending_verifications": pending_admins_count,
        "total_volume": 0,
        "total_profit": 0,
        "total_loss": 0,
        "active_tickets": 0,
        "unread_messages": 0,
        "system_health": "excellent"
    }
    
    return stats

# دریافت اطلاعات ادمین خاص
@router.get("/admins/{admin_id}", response_model=AdminResponse)
async def get_admin_by_id(
    admin_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    admin = db.query(User).filter(
        User.id == admin_id,
        User.role.in_([UserRole.ADMIN, UserRole.SUPER_ADMIN])
    ).first()
    
    if not admin:
        raise HTTPException(
            status_code=404,
            detail="ادمین مورد نظر یافت نشد"
        )
    
    return admin

# ارتقاء ادمین به سوپر ادمین
@router.post("/promote-to-super-admin/{admin_id}", response_model=AdminResponse)
async def promote_to_super_admin(
    admin_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """ارتقاء ادمین به سوپر ادمین (فقط توسط سوپر ادمین‌های موجود)"""
    if current_user.role != UserRole.SUPER_ADMIN:
        raise HTTPException(
            status_code=403,
            detail="فقط سوپر ادمین‌ها می‌توانند این عمل را انجام دهند"
        )
    
    admin = db.query(User).filter(
        User.id == admin_id,
        User.role == UserRole.ADMIN
    ).first()
    
    if not admin:
        raise HTTPException(
            status_code=404,
            detail="ادمین مورد نظر یافت نشد"
        )
    
    # ارتقاء به سوپر ادمین
    admin.role = UserRole.SUPER_ADMIN
    admin.needs_approval = False
    admin.is_verified = True
    admin.is_active = True
    
    db.commit()
    db.refresh(admin)
    
    print(f"🚀 ادمین {admin.email} به سوپر ادمین ارتقاء یافت توسط {current_user.email}")
    
    return admin