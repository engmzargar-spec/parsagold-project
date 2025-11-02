from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import os
import sys

# ✅ اضافه کردن مسیر پروژه به sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
sys.path.insert(0, backend_dir)

# ✅ ایمپورت SecurityMiddleware از پوشه security
from app.security.middleware import SecurityMiddleware

print(f"🔧 Python path: {sys.path}")

# استفاده از lifespan
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("✅ سرور پارسا گلد در حال راه‌اندازی...")
    
    # ایجاد جداول دیتابیس
    try:
        from app.database import engine, Base
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

# ✅ اضافه کردن middleware امنیتی از فایل جداگانه
app.add_middleware(SecurityMiddleware)

# CORS - کامل‌ترین تنظیمات
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # اجازه دادن به تمام originها
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"],
    allow_headers=[
        "*",
        "Authorization",
        "Content-Type",
        "Accept",
        "Origin",
        "X-Requested-With",
        "Access-Control-Allow-Origin",
        "Access-Control-Allow-Headers",
        "Access-Control-Allow-Methods",
        "Access-Control-Allow-Credentials",
        "Access-Control-Request-Headers",
        "Access-Control-Request-Method"
    ],
    expose_headers=[
        "*",
        "Authorization",
        "Content-Range",
        "X-Total-Count"
    ],
    max_age=3600,
)

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
        "timestamp": "2024"
    }

# هندلر برای OPTIONS requests (CORS preflight)
@app.options("/{rest_of_path:path}")
async def preflight_handler(rest_of_path: str):
    return {
        "message": "CORS preflight successful",
        "allowed_methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]
    }

# ایمپورت و include کردن روت‌ها - با try/except برای هر کدام
try:
    from app.routes import auth
    app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
    print("✅ روت auth بارگذاری شد")
except Exception as e:
    print(f"⚠️ خطا در بارگذاری روت auth: {e}")

try:
    from app.routes import admin
    app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
    print("✅ روت admin بارگذاری شد")
except Exception as e:
    print(f"⚠️ خطا در بارگذاری روت admin: {e}")

try:
    from app.routes import users
    app.include_router(users.router, prefix="/api/admin", tags=["Users"])
    print("✅ روت users بارگذاری شد")
except Exception as e:
    print(f"⚠️ خطا در بارگذاری روت users: {e}")

try:
    from app.routes import admin_management
    app.include_router(admin_management.router, prefix="/api", tags=["Admin Management"])
    print("✅ روت admin_management بارگذاری شد")
except Exception as e:
    print(f"⚠️ خطا در بارگذاری روت admin_management: {e}")

print("📋 روت‌های فعال:")
for route in app.routes:
    if hasattr(route, 'path') and hasattr(route, 'methods'):
        methods = ', '.join(route.methods) if route.methods else 'No methods'
        print(f"  - {route.path} ({methods})")

# هندلر برای خطاهای 404
@app.exception_handler(404)
async def not_found_exception_handler(request, exc):
    return {
        "detail": f"مسیر {request.url} یافت نشد",
        "available_routes": [
            "/api/health",
            "/api/auth/register",
            "/api/auth/login", 
            "/api/admin/login",
            "/docs"
        ]
    }

# هندلر برای خطاهای 500
@app.exception_handler(500)
async def internal_server_error_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": "خطای داخلی سرور"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)