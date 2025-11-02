from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import JWTError, jwt
from typing import Optional
import bcrypt
import sys
import os

# ✅ اضافه کردن مسیر برای importهای صحیح
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(os.path.dirname(current_dir))
sys.path.insert(0, backend_dir)

# ✅ اصلاح importها
from app.database import get_db
from app.models.models import User, UserRole, AccessGrade, Gender, AdminUser
from app.schemas.schemas import Token, AdminToken, AdminLogin, UserLogin, UserCreate

router = APIRouter()

# تنظیمات JWT
SECRET_KEY = "parsa-gold-super-secret-key-2024-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 ساعت

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """بررسی رمز عبور با bcrypt"""
    try:
        if hashed_password.startswith("$2b$"):
            return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
        else:
            import hashlib
            return hashed_password == hashlib.sha256(plain_password.encode()).hexdigest()
    except Exception as e:
        print(f"❌ خطا در verify_password: {e}")
        return False

def get_password_hash(password: str) -> str:
    """هش کردن رمز عبور با bcrypt"""
    try:
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    except Exception as e:
        print(f"❌ خطا در get_password_hash: {e}")
        import hashlib
        return hashlib.sha256(password.encode()).hexdigest()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def authenticate_user(db: Session, username: str, password: str):
    """احراز هویت کاربران عادی - CASE SENSITIVE"""
    user = db.query(User).filter(User.username == username).first()  # ✅ دقیقاً همون
    if not user:
        return False
    if not verify_password(password, user.password_hash):
        return False
    return user

def authenticate_admin(db: Session, username: str, password: str):
    """احراز هویت ادمین‌ها از جدول admin_users - CASE SENSITIVE"""
    admin = db.query(AdminUser).filter(AdminUser.username == username).first()  # ✅ دقیقاً همون
    
    if not admin:
        print(f"❌ کاربر ادمین یافت نشد: {username}")
        return False
    
    if not verify_password(password, admin.password_hash):
        print(f"❌ رمز عبور اشتباه برای: {username}")
        return False
    
    print(f"✅ ادمین یافت شد: {admin.username}, نقش: {admin.role}")
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

@router.post("/admin-login")
async def admin_login(login_data: AdminLogin, db: Session = Depends(get_db)):
    """لاگین ادمین‌ها از جدول admin_users - CASE SENSITIVE"""
    print(f"🔐 درخواست لاگین ادمین: {login_data.username}")
    
    try:
        # ✅ استفاده از case-sensitive query (دقیقاً همون)
        admin = db.query(AdminUser).filter(
            AdminUser.username == login_data.username  # ✅ دقیقاً همون چیزی که کاربر فرستاده
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
            "admin": {
                "id": admin.id,
                "username": admin.username,
                "email": admin.email,
                "role": admin.role,
                "full_name": admin.full_name,
                "is_active": admin.is_active,
                "is_approved": admin.is_approved
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ خطای سرور در لاگین ادمین: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="خطای سرور در پردازش درخواست"
        )

@router.get("/health")
async def auth_health():
    return {"status": "healthy", "service": "auth"}

if __name__ == "__main__":
    print("✅ auth router loaded successfully")