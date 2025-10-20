# backend/app/routes/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import os
from dotenv import load_dotenv

from ..database import get_db
from ..models import User, UserRole
from ..services.admin_service import AdminRegistrationService

load_dotenv()

router = APIRouter()

# تنظیمات امنیتی
SECRET_KEY = os.getenv("SECRET_KEY", "parsa-gold-secret-key-2024")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/token")

# توابع کمکی
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def authenticate_user(db: Session, username: str, password: str):
    user = db.query(User).filter(User.email == username).first()
    if not user:
        return False
    if not verify_password(password, user.password):
        return False
    return user

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.email == username).first()
    if user is None:
        raise credentials_exception
    return user

async def get_current_admin_user(
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="دسترسی غیرمجاز. فقط ادمین‌ها می‌توانند به این بخش دسترسی داشته باشند"
        )
    return current_user

async def get_current_super_admin_user(
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.SUPER_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="دسترسی غیرمجاز. فقط سوپر ادمین‌ها می‌توانند به این بخش دسترسی داشته باشند"
        )
    return current_user

# endpoint های احراز هویت
@router.post("/token")
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="نام کاربری یا رمز عبور اشتباه است",
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "role": user.role.value
    }

@router.post("/register")
async def register_user(
    email: str,
    phone: str,
    first_name: str,
    last_name: str,
    national_id: str,
    password: str,
    db: Session = Depends(get_db)
):
    # تشخیص و نرمال‌سازی ایمیل ادمین
    admin_role = AdminRegistrationService.detect_admin_email(email)
    normalized_email = AdminRegistrationService.normalize_admin_email(email)
    
    # بررسی وجود کاربر
    existing_user = db.query(User).filter(
        (User.email == normalized_email) | (User.phone == phone) | (User.national_id == national_id)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="کاربر با این ایمیل، شماره تلفن یا کد ملی قبلاً ثبت شده است"
        )
    
    # ایجاد کاربر جدید
    role = UserRole(admin_role) if admin_role else UserRole.USER
    
    user = User(
        email=normalized_email,
        phone=phone,
        first_name=first_name,
        last_name=last_name,
        national_id=national_id,
        password=get_password_hash(password),
        role=role
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return {
        "message": "کاربر با موفقیت ایجاد شد",
        "user_id": user.id,
        "role": role.value,
        "email": normalized_email
    }