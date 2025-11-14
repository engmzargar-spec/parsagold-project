# backend/app/security/auth.py
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# import درست مدل‌ها - با مدیریت خطا
try:
    # روش ۱: از app.models
    from app.models import User, AdminUser, UserRole, AccessGrade, Gender
    print("✅ مدل‌ها در auth.py از app.models import شدند")
except ImportError as e1:
    try:
        # روش ۲: از app.models.models
        from app.models.models import User, AdminUser, UserRole, AccessGrade, Gender
        print("✅ مدل‌ها در auth.py از app.models.models import شدند")
    except ImportError as e2:
        try:
            # روش ۳: فقط مدل‌های ضروری
            from app.models import User, AdminUser
            print("✅ مدل‌های اصلی در auth.py از app.models import شدند")
            # تعریف مقادیر پیش‌فرض برای بقیه
            UserRole = str
            AccessGrade = str  
            Gender = str
        except ImportError as e3:
            print(f"❌ خطا در import مدل‌ها در auth.py: {e3}")
            # خروج با خطا
            raise ImportError("نمی‌توان مدل‌ها را import کرد") from e3

from app.database import SessionLocal

# تنظیمات JWT
SECRET_KEY = "your-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# تنظیمات رمزنگاری
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_user_by_phone(phone: str):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.phone == phone).first()
        return user
    finally:
        db.close()

def get_admin_by_username(username: str):
    db = SessionLocal()
    try:
        admin = db.query(AdminUser).filter(AdminUser.username == username).first()
        return admin
    finally:
        db.close()

def get_admin_by_email(email: str):
    db = SessionLocal()
    try:
        admin = db.query(AdminUser).filter(AdminUser.email == email).first()
        return admin
    finally:
        db.close()

def authenticate_user(phone: str, password: str):
    user = get_user_by_phone(phone)
    if not user:
        return False
    if not verify_password(password, user.password_hash):
        return False
    return user

def authenticate_admin(username: str, password: str):
    admin = get_admin_by_username(username)
    if not admin:
        return False
    if not verify_password(password, admin.password_hash):
        return False
    return admin

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == int(user_id)).first()
        if user is None:
            raise credentials_exception
        return user
    finally:
        db.close()

async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        admin_id: str = payload.get("sub")
        if admin_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    db = SessionLocal()
    try:
        admin = db.query(AdminUser).filter(AdminUser.id == int(admin_id)).first()
        if admin is None:
            raise credentials_exception
        return admin
    finally:
        db.close()