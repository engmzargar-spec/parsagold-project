from fastapi import APIRouter, Depends, HTTPException, status, Form
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app.database import get_db
from app.core.auth import (
    verify_password, get_password_hash, create_access_token, 
    create_refresh_token, verify_token, ACCESS_TOKEN_EXPIRE_MINUTES,
    get_current_user
)
from app.models.user_models import User, UserStatus, RegularUserProfile
from app.models.admin_models import AdminUser, AdminStatus
from app.core.audit_logger import log_audit
from app.security.core.hashing import password_manager

# تعریف router - باید در بالاترین قسمت باشد
router = APIRouter()

@router.post("/auth/admin/login")
async def admin_login(
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    """
    لاگین مخصوص ادمین
    """
    print(f"🔐 درخواست لاگین ادمین برای: {username}")
    
    admin_user = db.query(AdminUser).filter(
        (AdminUser.username == username) | 
        (AdminUser.email == username)
    ).first()
    
    if not admin_user:
        print(f"❌ ادمین پیدا نشد: {username}")
        await log_audit(
            action="admin_login",
            description=f"Failed admin login - user not found: {username}",
            status_code=401
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    if not verify_password(password, admin_user.password_hash):
        print(f"❌ پسورد اشتباه برای ادمین: {username}")
        await log_audit(
            action="admin_login",
            description=f"Failed admin login - wrong password: {username}",
            status_code=401
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    if admin_user.status != AdminStatus.ACTIVE:
        print(f"❌ ادمین غیرفعال: {username}")
        await log_audit(
            action="admin_login",
            description=f"Failed admin login - account not active: {username}",
            status_code=401
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is not active"
        )
    
    # ایجاد توکن
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"user_id": admin_user.id, "type": "admin", "role": admin_user.role.value},
        expires_delta=access_token_expires
    )
    
    print(f"✅ لاگین موفق ادمین: {username}")
    
    await log_audit(
        action="admin_login",
        resource_type="admin",
        resource_id=admin_user.id,
        description=f"Successful admin login: {username}",
        status_code=200
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_type": "admin",
        "user": {
            "id": admin_user.id,
            "username": admin_user.username,
            "email": admin_user.email,
            "role": admin_user.role.value,
            "first_name": admin_user.first_name,
            "last_name": admin_user.last_name
        }
    }

@router.post("/auth/login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    # ابتدا در ادمین‌ها جستجو کن
    admin_user = db.query(AdminUser).filter(
        (AdminUser.username == form_data.username) | 
        (AdminUser.email == form_data.username)
    ).first()
    
    if admin_user:
        # احراز هویت ادمین
        if not verify_password(form_data.password, admin_user.password_hash):
            await log_audit(
                action="login",
                resource_type="admin",
                resource_id=admin_user.id,
                description="Failed login attempt - wrong password",
                status_code=401
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        # ✅ اصلاح شده: استفاده از Enum برای بررسی وضعیت
        if admin_user.status != AdminStatus.ACTIVE:
            await log_audit(
                action="login", 
                resource_type="admin",
                resource_id=admin_user.id,
                description="Failed login attempt - account not active",
                status_code=401
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is not active"
            )
        
        # ایجاد توکن
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"user_id": admin_user.id, "type": "admin", "role": admin_user.role.value},
            expires_delta=access_token_expires
        )
        refresh_token = create_refresh_token(
            data={"user_id": admin_user.id, "type": "admin"}
        )
        
        await log_audit(
            action="login",
            resource_type="admin", 
            resource_id=admin_user.id,
            description="Successful admin login",
            status_code=200
        )
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user_type": "admin",
            "user": {
                "id": admin_user.id,
                "username": admin_user.username,
                "email": admin_user.email,
                "role": admin_user.role.value,
                "first_name": admin_user.first_name,
                "last_name": admin_user.last_name
            }
        }
    
    # اگر ادمین نبود، در کاربران عادی جستجو کن
    user = db.query(User).filter(
        (User.email == form_data.username) | 
        (User.phone == form_data.username)
    ).first()
    
    if user:
        if not verify_password(form_data.password, user.password_hash):
            await log_audit(
                action="login",
                resource_type="user",
                resource_id=user.id,
                description="Failed login attempt - wrong password", 
                status_code=401
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        # ✅ اصلاح شده: استفاده از Enum برای بررسی وضعیت کاربر
        if user.status != UserStatus.ACTIVE:
            await log_audit(
                action="login",
                resource_type="user",
                resource_id=user.id,
                description="Failed login attempt - account not active",
                status_code=401
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is not active"
            )
        
        # ایجاد توکن برای کاربر عادی
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"user_id": user.id, "type": "user"},
            expires_delta=access_token_expires
        )
        refresh_token = create_refresh_token(
            data={"user_id": user.id, "type": "user"}
        )
        
        await log_audit(
            action="login",
            resource_type="user",
            resource_id=user.id,
            description="Successful user login",
            status_code=200
        )
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user_type": "user",
            "user": {
                "id": user.id,
                "email": user.email,
                "phone": user.phone,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "status": user.status.value
            }
        }
    
    # اگر کاربری یافت نشد
    await log_audit(
        action="login",
        description=f"Failed login attempt - user not found: {form_data.username}",
        status_code=401
    )
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials"
    )

# بقیه توابع (quick_register, register, refresh, logout) بدون تغییر باقی می‌مانند
@router.post("/auth/quick-register")
async def quick_register(
    phone: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    """
    ثبت‌نام سریع کاربر با شماره موبایل و رمز عبور
    """
    try:
        print(f"🔔 درخواست ثبت‌نام برای شماره: {phone}")
        
        # بررسی وجود کاربر
        existing_user = db.query(User).filter(User.phone == phone).first()
        
        if existing_user:
            print(f"❌ کاربر از قبل وجود دارد: {phone}")
            await log_audit(
                action="quick_register",
                description=f"Failed quick registration - user already exists: {phone}",
                status_code=400
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="شماره موبایل قبلاً ثبت شده است"
            )

        # هش کردن پسورد
        try:
            hashed_password, algorithm = password_manager.hash_password(password)
            print(f"🔐 پسورد هش شده با الگوریتم: {algorithm}")
        except ValueError as e:
            print(f"❌ خطا در هش کردن پسورد: {e}")
            await log_audit(
                action="quick_register",
                description=f"Failed quick registration - invalid password: {phone}",
                status_code=400
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"رمز عبور معتبر نیست: {str(e)}"
            )

        # ایجاد کاربر جدید با تمام فیلدهای required
        new_user = User(
            phone=phone,
            email=f"{phone}@parsagold.com",  # ایمیل موقت
            password_hash=hashed_password,
            first_name="کاربر",              # نام پیش‌فرض
            last_name="جدید",                # نام خانوادگی پیش‌فرض
            country="ایران",                 # کشور پیش‌فرض
            status=UserStatus.ACTIVE,
            user_type="regular",
            full_name="کاربر جدید",          # full_name هم required هست
            email_verified=False,
            phone_verified=False,
            two_factor_enabled=False,
            login_attempts=0
        )
        
        print(f"👤 ایجاد کاربر جدید: {new_user.phone}")
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        print(f"✅ کاربر ایجاد شد با ID: {new_user.id}")

        # ایجاد پروفایل کاربر عادی
        user_profile = RegularUserProfile(
            user_id=new_user.id,
            balance=0,
            credit_score=50,
            risk_level="medium",
            trading_volume=0,
            preferred_assets=["gold", "silver"],
            trading_limits={},
            notification_preferences={}
        )
        
        db.add(user_profile)
        db.commit()

        print(f"✅ پروفایل کاربر ایجاد شد")

        # ایجاد توکن دسترسی
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"user_id": new_user.id, "type": "user"},
            expires_delta=access_token_expires
        )
        refresh_token = create_refresh_token(
            data={"user_id": new_user.id, "type": "user"}
        )
        
        print(f"✅ توکن ایجاد شد")

        await log_audit(
            action="quick_register",
            resource_type="user",
            resource_id=new_user.id,
            description=f"Successful quick registration: {phone}",
            status_code=201
        )
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user_type": "user",
            "user": {
                "id": new_user.id,
                "phone": new_user.phone,
                "email": new_user.email,
                "first_name": new_user.first_name,
                "last_name": new_user.last_name,
                "status": new_user.status.value,
                "profile_complete": False  # پرچم تکمیل نشدن پروفایل
            }
        }
        
    except HTTPException:
        # خطاهای HTTP که قبلاً مدیریت شده‌اند
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ خطای غیرمنتظره در ثبت‌نام: {e}")
        import traceback
        traceback.print_exc()
        
        await log_audit(
            action="quick_register",
            description=f"Quick registration error: {str(e)}",
            status_code=500
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"خطا در ثبت‌نام: {str(e)}"
        )

@router.post("/auth/register")
async def register_user(
    phone: str = Form(...),
    password: str = Form(...),
    first_name: str = Form("کاربر"),
    last_name: str = Form("جدید"),
    email: str = Form(None),
    db: Session = Depends(get_db)
):
    """
    ثبت‌نام کاربر جدید با شماره موبایل
    """
    try:
        # بررسی وجود کاربر
        existing_user = db.query(User).filter(
            (User.phone == phone) | (User.email == email)
        ).first()
        
        if existing_user:
            await log_audit(
                action="register",
                description=f"Failed registration - user already exists: {phone}",
                status_code=400
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="شماره موبایل یا ایمیل قبلاً ثبت شده است"
            )

        # اگر ایمیل ارائه نشده، از شماره موبایل استفاده کن
        user_email = email if email else f"{phone}@parsagold.com"

        # هش کردن پسورد با سیستم پیشرفته
        try:
            hashed_password, algorithm = password_manager.hash_password(password)
        except ValueError as e:
            await log_audit(
                action="register",
                description=f"Failed registration - invalid password: {phone}",
                status_code=400
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"رمز عبور معتبر نیست: {str(e)}"
            )

        # ایجاد کاربر جدید
        new_user = User(
            phone=phone,
            email=user_email,
            password_hash=hashed_password,
            first_name=first_name,
            last_name=last_name,
            country="ایران",
            status=UserStatus.ACTIVE,
            user_type="regular",
            full_name=f"{first_name} {last_name}",
            email_verified=False,
            phone_verified=False
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # ایجاد پروفایل کاربر عادی
        user_profile = RegularUserProfile(
            user_id=new_user.id,
            balance=0,
            credit_score=50,
            risk_level="medium",
            preferred_assets=["gold", "silver"]
        )
        
        db.add(user_profile)
        db.commit()

        # ایجاد توکن دسترسی
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"user_id": new_user.id, "type": "user"},
            expires_delta=access_token_expires
        )
        refresh_token = create_refresh_token(
            data={"user_id": new_user.id, "type": "user"}
        )
        
        await log_audit(
            action="register",
            resource_type="user",
            resource_id=new_user.id,
            description=f"Successful user registration: {phone}",
            status_code=201
        )
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user_type": "user",
            "user": {
                "id": new_user.id,
                "phone": new_user.phone,
                "email": new_user.email,
                "first_name": new_user.first_name,
                "last_name": new_user.last_name,
                "status": new_user.status.value
            }
        }
        
    except Exception as e:
        db.rollback()
        await log_audit(
            action="register",
            description=f"Registration error: {str(e)}",
            status_code=500
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"خطا در ثبت‌نام: {str(e)}"
        )

@router.post("/refresh")
async def refresh_token(
    refresh_token: str,
    db: Session = Depends(get_db)
):
    payload = verify_token(refresh_token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    user_id = payload.get("user_id")
    user_type = payload.get("type")
    
    if user_type == "admin":
        user = db.query(AdminUser).filter(AdminUser.id == user_id).first()
    else:
        user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    # ایجاد توکن جدید
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"user_id": user.id, "type": user_type, "role": getattr(user, 'role', None)},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.post("/logout")
async def logout(current_user = Depends(get_current_user)):
    await log_audit(
        action="logout",
        resource_type="user" if hasattr(current_user, 'email') else "admin",
        resource_id=current_user.id,
        description="User logged out successfully",
        status_code=200
    )
    
    return {"message": "Successfully logged out"}