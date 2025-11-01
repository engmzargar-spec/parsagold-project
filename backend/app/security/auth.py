# backend/app/security/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import JWTError, jwt
import os
from dotenv import load_dotenv

from ..database import get_db
from ..models.models import User, UserRole, AccessGrade, Gender  # ✅ تغییر شده
from ..schemas.schemas import Token, AdminToken, AdminLogin, UserLogin, UserCreate  # ✅ تغییر شده
from app.security.encryption import HashService  # ✅ اضافه کردن سیستم رمزنگاری جدید

load_dotenv()

router = APIRouter()

# تنظیمات JWT
SECRET_KEY = os.getenv("SECRET_KEY", "parsa-gold-secret-key-2024")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 ساعت

# تنظیمات سیستم
MAX_CHIEF_USERS = 3  # حداکثر تعداد کاربران چیف

# ✅ استفاده از سیستم هش کردن جدید
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """بررسی رمز عبور با سیستم جدید"""
    return HashService.verify_password(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """هش کردن رمز عبور با سیستم جدید"""
    return HashService.hash_password(password)

def detect_admin_role_from_email(email: str):
    """تشخیص خودکار نقش ادمین بر اساس ایمیل"""
    admin_codes = {
        "adminpg1357": UserRole.ADMIN,
        "superadminpg2468": UserRole.SUPER_ADMIN
    }
    
    for code, role in admin_codes.items():
        if code in email:
            return role
    return None

def check_chief_limit(db: Session) -> bool:
    """بررسی تعداد کاربران چیف"""
    chief_count = db.query(User).filter(
        User.access_grade == AccessGrade.CHIEF,
        User.is_active == True
    ).count()
    return chief_count < MAX_CHIEF_USERS

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def authenticate_user(db: Session, username: str, password: str):
    """احراز هویت کاربر"""
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return False
    if not verify_password(password, user.password):
        return False
    return user

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
    """دریافت کاربر جاری از توکن"""
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
    
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

async def get_current_admin_user(current_user: User = Depends(get_current_user)):
    """بررسی اینکه کاربر جاری ادمین است"""
    if not current_user.is_admin():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="دسترسی غیرمجاز. فقط ادمین‌ها می‌توانند به این بخش دسترسی داشته باشند."
        )
    return current_user

async def get_current_chief_user(current_user: User = Depends(get_current_admin_user)):
    """بررسی اینکه کاربر جاری Chief است"""
    if current_user.access_grade != AccessGrade.CHIEF:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="دسترسی غیرمجاز. فقط مدیران ارشد (Chief) می‌توانند به این بخش دسترسی داشته باشند."
        )
    return current_user

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
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/admin-login", response_model=AdminToken)
async def admin_login(login_data: AdminLogin, db: Session = Depends(get_db)):
    """لاگین ادمین‌ها - تغییر از ایمیل به نام کاربری"""
    print(f"🔐 درخواست لاگین ادمین: {login_data.username}")
    
    try:
        # تغییر فیلتر از email به username
        user = db.query(User).filter(
            User.username == login_data.username,
            User.role.in_([UserRole.ADMIN, UserRole.SUPER_ADMIN])
        ).first()
        
        if not user:
            print(f"❌ کاربر ادمین یافت نشد: {login_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="نام کاربری یا رمز عبور نادرست"
            )
        
        print(f"✅ کاربر یافت شد: {user.username}, نقش: {user.role}")
        
        # بررسی فعال بودن
        if not user.is_active:
            print(f"❌ کاربر غیرفعال است: {user.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="حساب کاربری غیرفعال است"
            )
        
        # بررسی نیاز به تایید (برای ادمین‌های جدید)
        if user.needs_approval and user.role != UserRole.SUPER_ADMIN:
            print(f"⚠️ کاربر نیاز به تایید دارد: {user.username}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="حساب کاربری شما نیاز به تایید مدیر ارشد دارد"
            )
        
        # بررسی رمز عبور
        print(f"🔑 بررسی رمز عبور برای کاربر: {user.username}")
        password_correct = verify_password(login_data.password, user.password)
        print(f"🔑 نتیجه بررسی رمز: {password_correct}")
        
        if not password_correct:
            print(f"❌ رمز عبور نادرست برای کاربر: {user.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="نام کاربری یا رمز عبور نادرست"
            )
        
        # ایجاد توکن
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.username}, expires_delta=access_token_expires
        )
        
        print(f"🎉 لاگین موفق برای: {user.username}")
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "admin": user
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ خطای سرور در لاگین: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="خطای سرور در پردازش درخواست"
        )

@router.post("/register")
async def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """ثبت نام کاربر جدید با فیلدهای کامل و تشخیص خودکار ادمین"""
    try:
        # بررسی وجود کاربر با ایمیل، نام کاربری، تلفن یا کد ملی
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
        
        # تشخیص خودکار نقش از ایمیل
        detected_role = detect_admin_role_from_email(user_data.email)
        is_admin = detected_role is not None
        
        # تنظیم نقش و وضعیت تایید
        if is_admin:
            role = detected_role
            needs_approval = True  # ادمین‌ها نیاز به تایید دارند
            is_verified = False
            access_grade = AccessGrade.GRADE1  # سطح دسترسی پیش‌فرض برای ادمین‌ها
            
            # اگر سوپر ادمین باشد، نیازی به تایید ندارد
            if role == UserRole.SUPER_ADMIN:
                needs_approval = False
                is_verified = True
        else:
            role = UserRole.USER
            needs_approval = False
            is_verified = False
            access_grade = None
        
        # ایجاد کاربر جدید با تمام فیلدها
        user = User(
            username=user_data.username,
            email=user_data.email,
            phone=user_data.phone,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            national_id=user_data.national_id,
            password=get_password_hash(user_data.password),
            
            # فیلدهای جدید
            date_of_birth=user_data.date_of_birth,
            gender=user_data.gender,
            address=user_data.address,
            postal_code=user_data.postal_code,
            country=user_data.country,
            city=user_data.city,
            
            role=role,
            access_grade=access_grade,
            needs_approval=needs_approval,
            is_active=True,
            is_verified=is_verified
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        user_type = "ادمین" if is_admin else "کاربر معمولی"
        print(f"✅ {user_type} جدید ثبت نام کرد: {user.email} - {user.first_name} {user.last_name}")
        
        return {
            "message": "کاربر با موفقیت ایجاد شد", 
            "user_id": user.id,
            "email": user.email,
            "role": user.role.value,
            "is_admin": is_admin,
            "requires_approval": needs_approval,
            "requires_verification": not is_verified
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
    """بررسی اعتبار توکن"""
    return {
        "valid": True,
        "user": {
            "username": current_user.username,
            "email": current_user.email,
            "role": current_user.role.value,
            "first_name": current_user.first_name,
            "last_name": current_user.last_name,
            "is_admin": current_user.is_admin()
        }
    }

@router.get("/admin/check-access")
async def check_admin_access(current_user: User = Depends(get_current_admin_user)):
    """بررسی دسترسی ادمین"""
    return {
        "has_access": True,
        "user": {
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email,
            "role": current_user.role.value,
            "access_grade": current_user.access_grade.value if current_user.access_grade else None,
            "first_name": current_user.first_name,
            "last_name": current_user.last_name,
            "needs_approval": current_user.needs_approval
        }
    }

# اضافه کردن endpoint برای بررسی وضعیت سیستم
@router.get("/system/status")
async def get_system_status(db: Session = Depends(get_db)):
    """بررسی وضعیت سیستم و محدودیت‌ها"""
    chief_count = db.query(User).filter(
        User.access_grade == AccessGrade.CHIEF,
        User.is_active == True
    ).count()
    
    admin_count = db.query(User).filter(
        User.role.in_([UserRole.ADMIN, UserRole.SUPER_ADMIN]),
        User.is_active == True
    ).count()
    
    return {
        "chief_users": {
            "current": chief_count,
            "max_allowed": MAX_CHIEF_USERS,
            "available": MAX_CHIEF_USERS - chief_count
        },
        "admin_users": admin_count,
        "system_health": "healthy"
    }