# backend/app/security/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import JWTError, jwt
import os
from dotenv import load_dotenv

from ..database import get_db
from ..models.models import User, AdminUser, UserRole, AccessGrade, Gender
from ..schemas.schemas import Token, AdminToken, AdminLogin, UserLogin, UserCreate
from app.security.encryption import HashService

load_dotenv()

router = APIRouter()

# تنظیمات JWT
SECRET_KEY = os.getenv("SECRET_KEY", "parsa-gold-secret-key-2024")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 ساعت

# ✅ استفاده از سیستم هش کردن جدید
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """بررسی رمز عبور با سیستم جدید"""
    return HashService.verify_password(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """هش کردن رمز عبور با سیستم جدید"""
    return HashService.hash_password(password)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def authenticate_user(db: Session, username: str, password: str):
    """احراز هویت کاربران عادی"""
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return False
    if not verify_password(password, user.password_hash):
        return False
    return user

def authenticate_admin(db: Session, username: str, password: str):
    """احراز هویت ادمین‌ها از جدول admin_users"""
    admin = db.query(AdminUser).filter(AdminUser.username == username).first()
    if not admin:
        return False
    if not verify_password(password, admin.password_hash):
        return False
    return admin

def create_access_token(data: dict, expires_delta: timedelta = None):
    """ایجاد توکن JWT"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """دریافت کاربر جاری از توکن (کاربران عادی)"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        user_type: str = payload.get("type", "user")  # user یا admin
        
        if username is None:
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
    
    # اگر کاربر عادی باشد
    if user_type == "user":
        user = db.query(User).filter(User.username == username).first()
        if user is None:
            raise credentials_exception
        return user
    
    credentials_exception

async def get_current_admin(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """دریافت ادمین جاری از توکن"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate admin credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        user_type: str = payload.get("type", "user")
        
        if username is None or user_type != "admin":
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
    
    # پیدا کردن ادمین از جدول admin_users
    admin = db.query(AdminUser).filter(AdminUser.username == username).first()
    if admin is None:
        raise credentials_exception
        
    if not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin account is inactive"
        )
        
    return admin

async def get_current_chief_admin(current_admin: AdminUser = Depends(get_current_admin)):
    """بررسی اینکه ادمین جاری Chief است"""
    if current_admin.role != 'chief':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="دسترسی غیرمجاز. فقط مدیران ارشد (Chief) می‌توانند به این بخش دسترسی داشته باشند."
        )
    return current_admin

@router.post("/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """لاگین کاربران معمولی"""
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="نام کاربری یا رمز عبور نادرست",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="حساب کاربری غیرفعال است"
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "type": "user"}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/admin-login", response_model=AdminToken)
async def admin_login(login_data: AdminLogin, db: Session = Depends(get_db)):
    """لاگین ادمین‌ها از جدول admin_users"""
    print(f"🔐 درخواست لاگین ادمین: {login_data.username}")
    
    try:
        # استفاده از جدول جدید admin_users
        admin = db.query(AdminUser).filter(
            AdminUser.username == login_data.username
        ).first()
        
        if not admin:
            print(f"❌ کاربر ادمین یافت نشد: {login_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="نام کاربری یا رمز عبور نادرست"
            )
        
        print(f"✅ ادمین یافت شد: {admin.username}, نقش: {admin.role}")
        
        # بررسی فعال بودن
        if not admin.is_active:
            print(f"❌ ادمین غیرفعال است: {admin.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="حساب کاربری غیرفعال است"
            )
        
        # بررسی تایید شدن (برای ادمین‌های جدید)
        if not admin.is_approved and admin.role != 'chief':
            print(f"⚠️ ادمین نیاز به تایید دارد: {admin.username}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="حساب کاربری شما نیاز به تایید مدیر ارشد دارد"
            )
        
        # بررسی رمز عبور
        print(f"🔑 بررسی رمز عبور برای ادمین: {admin.username}")
        password_correct = verify_password(login_data.password, admin.password_hash)
        print(f"🔑 نتیجه بررسی رمز: {password_correct}")
        
        if not password_correct:
            print(f"❌ رمز عبور نادرست برای ادمین: {admin.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="نام کاربری یا رمز عبور نادرست"
            )
        
        # ایجاد توکن
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": admin.username, "type": "admin"}, expires_delta=access_token_expires
        )
        
        print(f"🎉 لاگین موفق برای ادمین: {admin.username}")
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "admin": admin
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ خطای سرور در لاگین ادمین: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="خطای سرور در پردازش درخواست"
        )

@router.post("/register")
async def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """ثبت نام کاربر جدید (فقط کاربران عادی)"""
    try:
        # بررسی وجود کاربر
        existing_user = db.query(User).filter(
            (User.email == user_data.email) | 
            (User.username == user_data.username) |
            (User.phone == user_data.phone) |
            (User.national_id == user_data.national_id)
        ).first()
        
        if existing_user:
            if existing_user.email == user_data.email:
                raise HTTPException(
                    status_code=400,
                    detail="کاربر با این ایمیل قبلاً ثبت شده است"
                )
            elif existing_user.username == user_data.username:
                raise HTTPException(
                    status_code=400,
                    detail="کاربر با این نام کاربری قبلاً ثبت شده است"
                )
            elif existing_user.phone == user_data.phone:
                raise HTTPException(
                    status_code=400,
                    detail="کاربر با این شماره تلفن قبلاً ثبت شده است"
                )
            elif existing_user.national_id == user_data.national_id:
                raise HTTPException(
                    status_code=400,
                    detail="کاربر با این کد ملی قبلاً ثبت شده است"
                )
        
        # ایجاد کاربر عادی
        user = User(
            username=user_data.username,
            email=user_data.email,
            phone=user_data.phone,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            national_id=user_data.national_id,
            password_hash=get_password_hash(user_data.password),
            
            # فیلدهای جدید
            date_of_birth=user_data.date_of_birth,
            gender=user_data.gender,
            address=user_data.address,
            postal_code=user_data.postal_code,
            country=user_data.country,
            city=user_data.city,
            
            role=UserRole.USER,
            is_active=True,
            is_verified=False
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        print(f"✅ کاربر جدید ثبت نام کرد: {user.email} - {user.first_name} {user.last_name}")
        
        return {
            "message": "کاربر با موفقیت ایجاد شد", 
            "user_id": user.id,
            "email": user.email,
            "role": user.role.value
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ خطا در ثبت نام کاربر: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="خطای سرور در ثبت نام کاربر"
        )

@router.get("/verify-token")
async def verify_token(current_user: User = Depends(get_current_user)):
    """بررسی اعتبار توکن کاربران عادی"""
    return {
        "valid": True,
        "user": {
            "username": current_user.username,
            "email": current_user.email,
            "role": current_user.role.value,
            "first_name": current_user.first_name,
            "last_name": current_user.last_name
        }
    }

@router.get("/admin/verify-token")
async def verify_admin_token(current_admin: AdminUser = Depends(get_current_admin)):
    """بررسی اعتبار توکن ادمین"""
    return {
        "valid": True,
        "admin": {
            "username": current_admin.username,
            "email": current_admin.email,
            "role": current_admin.role,
            "full_name": current_admin.full_name,
            "permissions": current_admin.permissions
        }
    }

# اضافه کردن endpoint برای بررسی وضعیت سیستم
@router.get("/system/status")
async def get_system_status(db: Session = Depends(get_db)):
    """بررسی وضعیت سیستم"""
    admin_count = db.query(AdminUser).filter(
        AdminUser.is_active == True
    ).count()
    
    user_count = db.query(User).filter(
        User.is_active == True
    ).count()
    
    chief_count = db.query(AdminUser).filter(
        AdminUser.role == 'chief',
        AdminUser.is_active == True
    ).count()
    
    return {
        "chief_admins": chief_count,
        "total_admins": admin_count,
        "total_users": user_count,
        "system_health": "healthy",
        "tables_separated": True
    }