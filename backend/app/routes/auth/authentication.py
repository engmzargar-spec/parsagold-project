from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app.database import get_db
from app.core.auth import (
    verify_password, get_password_hash, create_access_token, 
    create_refresh_token, verify_token, ACCESS_TOKEN_EXPIRE_MINUTES,
    get_current_user
)
from app.models.user_models import User, UserStatus
from app.models.admin_models import AdminUser, AdminStatus
from app.core.audit_logger import log_audit

router = APIRouter()

@router.post("/login")
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