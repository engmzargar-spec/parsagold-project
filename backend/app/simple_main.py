# backend/app/simple_main.py
from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("✅ سرور پارسا گلد در حال راه‌اندازی...")
    
    # ایجاد جداول دیتابیس
    try:
        from database import engine, Base
        Base.metadata.create_all(bind=engine)
        print("✅ جداول دیتابیس ایجاد شدند!")
    except Exception as e:
        print(f"⚠️ خطا در ایجاد دیتابیس: {e}")
    
    yield
    
    # Shutdown
    print("🔴 سرور در حال خاموش شدن...")

app = FastAPI(
    title="ParsaGold API",
    description="سیستم معاملات طلا، نقره و نفت پارساگلد",
    version="2.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ایجاد روت‌ها مستقیم در main
auth_router = APIRouter()
admin_router = APIRouter()

# ==================== روت‌های احراز هویت ====================
@auth_router.get("/test")
async def auth_test():
    return {"status": "success", "message": "سیستم احراز هویت پارسا گلد فعال است"}

@auth_router.post("/register")
async def register_user(
    email: str,
    phone: str,
    first_name: str,
    last_name: str,
    national_id: str,
    password: str
):
    """ثبت‌نام کاربر با قابلیت تشخیص ادمین"""
    # کدهای تشخیص ادمین
    admin_codes = {
        "adminpg1357": "admin",
        "superadminpg2468": "super_admin"
    }
    
    # تشخیص نقش
    role = "user"
    normalized_email = email
    
    for code, admin_role in admin_codes.items():
        if code in email:
            role = admin_role
            normalized_email = email.replace(f"{code}-", "")
            break
    
    return {
        "message": "ثبت‌نام با موفقیت انجام شد",
        "user_data": {
            "email": normalized_email,
            "role": role,
            "first_name": first_name,
            "last_name": last_name
        }
    }

# ==================== روت‌های مدیریتی ====================
@admin_router.get("/test")
async def admin_test():
    return {"status": "success", "message": "داشبورد مدیریتی پارسا گلد فعال است"}

@admin_router.get("/dashboard/stats")
async def get_admin_stats():
    """آمار کلی برای داشبورد مدیریتی"""
    return {
        "total_users": 156,
        "total_admins": 3,
        "active_users": 142,
        "pending_verifications": 8,
        "total_transactions": 1247,
        "total_trades": 892,
        "total_deposits": 2450000000,  # 2.45 میلیارد تومان
        "total_withdrawals": 1830000000  # 1.83 میلیارد تومان
    }

@admin_router.get("/users/search")
async def search_users(
    q: str = "",
    search_type: str = "all"
):
    """جستجوی پیشرفته کاربران"""
    
    # کاربران نمونه (در واقعیت از دیتابیس میاد)
    sample_users = [
        {
            "id": 1,
            "email": "user1@example.com",
            "phone": "09123456789",
            "first_name": "علی",
            "last_name": "محمدی",
            "national_id": "0012345678",
            "role": "user",
            "is_active": True,
            "created_at": "2024-01-15T10:30:00",
            "last_login": "2024-10-27T08:45:00"
        },
        {
            "id": 2,
            "email": "admin@example.com",
            "phone": "09129876543",
            "first_name": "رضا",
            "last_name": "کریمی",
            "national_id": "0023456789",
            "role": "admin",
            "is_active": True,
            "created_at": "2024-01-10T09:15:00",
            "last_login": "2024-10-27T09:20:00"
        },
        {
            "id": 3,
            "email": "superadmin@example.com", 
            "phone": "09127654321",
            "first_name": "مریم",
            "last_name": "احمدی",
            "national_id": "0034567890",
            "role": "super_admin",
            "is_active": True,
            "created_at": "2024-01-05T14:20:00",
            "last_login": "2024-10-27T10:15:00"
        }
    ]
    
    # فیلتر کردن بر اساس جستجو
    if q:
        filtered_users = []
        for user in sample_users:
            if (search_type == "all" or search_type == "email") and q.lower() in user["email"].lower():
                filtered_users.append(user)
            elif (search_type == "all" or search_type == "phone") and q in user["phone"]:
                filtered_users.append(user)
            elif (search_type == "all" or search_type == "name") and (q in user["first_name"] or q in user["last_name"]):
                filtered_users.append(user)
            elif (search_type == "all" or search_type == "nationalId") and q in user["national_id"]:
                filtered_users.append(user)
    else:
        filtered_users = sample_users
    
    return {
        "users": filtered_users,
        "total_results": len(filtered_users),
        "search_query": q,
        "search_type": search_type
    }

@admin_router.get("/users/{user_id}")
async def get_user_details(user_id: int):
    """دریافت اطلاعات کامل یک کاربر"""
    
    # کاربران نمونه
    users = {
        1: {
            "id": 1,
            "email": "user1@example.com",
            "phone": "09123456789", 
            "first_name": "علی",
            "last_name": "محمدی",
            "national_id": "0012345678",
            "role": "user",
            "is_active": True,
            "is_verified": True,
            "created_at": "2024-01-15T10:30:00",
            "last_login": "2024-10-27T08:45:00",
            "ip_address": "192.168.1.100",
            "location": {"country": "ایران", "city": "تهران"},
            "device_info": {"os": "Windows", "browser": "Chrome"}
        },
        2: {
            "id": 2,
            "email": "admin@example.com",
            "phone": "09129876543",
            "first_name": "رضا", 
            "last_name": "کریمی",
            "national_id": "0023456789",
            "role": "admin",
            "is_active": True,
            "is_verified": True,
            "created_at": "2024-01-10T09:15:00",
            "last_login": "2024-10-27T09:20:00",
            "ip_address": "192.168.1.101",
            "location": {"country": "ایران", "city": "مشهد"},
            "device_info": {"os": "macOS", "browser": "Safari"}
        }
    }
    
    user = users.get(user_id)
    if not user:
        return {"error": "کاربر یافت نشد", "user_id": user_id}
    
    return {"user": user}

@admin_router.post("/users/{user_id}/reset-password")
async def reset_user_password(user_id: int):
    """ریست کردن رمز عبور کاربر"""
    return {
        "message": "رمز عبور با موفقیت ریست شد",
        "user_id": user_id,
        "temp_password": "Temp@12345",
        "note": "این رمز موقت است و کاربر باید آن را تغییر دهد"
    }

# اضافه کردن روت‌ها به اپ
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(admin_router, prefix="/api/admin", tags=["Admin"])

# روت‌های اصلی
@app.get("/")
async def root():
    return {
        "message": "خوش آمدید به پارسا گلد", 
        "status": "active",
        "version": "2.0.0"
    }

@app.get("/api/test")
async def test_api():
    return {"message": "API پارسا گلد کار می‌کند!", "status": "success"}

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "ParsaGold", 
        "database": "PostgreSQL",
        "timestamp": "2024"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)