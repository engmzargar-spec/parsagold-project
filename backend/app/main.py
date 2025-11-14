# backend/app/main.py
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.models import *  
from app.routes.auth import authentication
from app.routes.users import user_management
from app.routes.admin import admin_management, admin_permissions
from app.routes.audit import audit_logs
from app.core.auth import get_current_user
from app.seed_data import seed_initial_data
from app.core.config import settings, get_settings

# اصلاح ایمپورت‌های central_management
from app.routes.admin.central_management.test_routes import router as test_routes_router
from app.routes.admin.central_management.regular_users import router as regular_users_router
from app.routes.admin.central_management.admin_users import router as admin_users_router
from app.routes.admin.central_management.staff_users import router as staff_users_router

# Create tables
Base.metadata.create_all(bind=engine)

# ✅ اجرای ایمن seed data با مدیریت خطا
try:
    print("🌱 در حال ایجاد داده‌های اولیه...")
    seed_initial_data()
    print("✅ داده‌های اولیه با موفقیت ایجاد شد")
except Exception as e:
    print(f"⚠️ خطا در ایجاد داده اولیه: {e}")
    print("🚀 ادامه اجرای سرور بدون داده اولیه...")

print(f"🚀 سرور روی پورت {settings.API_PORT} راه‌اندازی می‌شود...")

app = FastAPI(
    title="ParsaGold API",
    description="سیستم مدیریت معاملات طلا، نقره و نفت",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        f"http://localhost:{settings.API_PORT}",
        f"http://127.0.0.1:{settings.API_PORT}"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ اصلاح شده: تغییر prefix authentication به /api
app.include_router(authentication.router, prefix="/api", tags=["Authentication"])
app.include_router(user_management.router, prefix="/api/users", tags=["User Management"])
app.include_router(admin_management.router, prefix="/api/admin", tags=["Admin Management"])
app.include_router(admin_permissions.router, prefix="/api/admin/permissions", tags=["Admin Permissions"])
app.include_router(audit_logs.router, prefix="/api/audit", tags=["Audit Logs"])

# Include central management routers
app.include_router(regular_users_router, prefix="/api", tags=["Central Management - Regular Users"])
app.include_router(admin_users_router, prefix="/api", tags=["Central Management - Admin Users"])
app.include_router(staff_users_router, prefix="/api", tags=["Central Management - Staff Users"])
app.include_router(test_routes_router, prefix="/api", tags=["Central Management - Test"])

@app.get("/")
async def root():
    return {"message": "ParsaGold API System", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ParsaGold API"}

@app.get("/config")
async def get_config():
    """نمایش تنظیمات فعلی"""
    return {
        "port": settings.API_PORT,
        "host": settings.API_HOST,
        "base_url": settings.API_BASE_URL,
        "database_url": settings.DATABASE_URL
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app", 
        host=settings.API_HOST, 
        port=settings.API_PORT, 
        reload=True
    )