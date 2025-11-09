from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import os
import sys

# 🔧 اضافه کردن مسیر پروژه به sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
sys.path.insert(0, backend_dir)

# ✅ ایمپورت‌های امنیتی و دیتابیس
from app.security.middleware import SecurityMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("✅ راه‌اندازی سرور پارسا گلد...")

    try:
        from app.database import engine, Base
        Base.metadata.create_all(bind=engine)
        print("✅ جداول دیتابیس ساخته شدند")
    except Exception as e:
        print(f"⚠️ خطا در ساخت دیتابیس: {e}")

    try:
        from app.seed_data import seed_initial_data
        seed_initial_data()
        print("✅ داده‌های اولیه بارگذاری شدند")
    except Exception as e:
        print(f"⚠️ خطا در بارگذاری داده‌های اولیه: {e}")

    yield
    print("🔴 خاموش شدن سرور...")

app = FastAPI(
    title="ParsaGold API",
    description="سیستم معاملات طلا، نقره و نفت پارساگلد",
    version="2.0.0",
    lifespan=lifespan,
    debug=True
)

# ✅ Middleware امنیتی
app.add_middleware(SecurityMiddleware)

# ✅ تنظیمات کامل CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# ✅ مسیرهای تست و سلامت
@app.get("/")
async def root():
    return {"message": "خوش آمدید به پارسا گلد", "status": "active", "version": "2.0.0"}

@app.get("/api/test")
async def test_api():
    return {"message": "API پارسا گلد فعال است", "status": "success"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "ParsaGold"}

@app.options("/{rest_of_path:path}")
async def preflight_handler(rest_of_path: str):
    return {"message": "CORS preflight successful"}

# ✅ ثبت routeها
try:
    from app.routes import auth
    app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
except Exception as e:
    print(f"⚠️ خطا در بارگذاری auth: {e}")

try:
    from app.routes import admin
    app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
except Exception as e:
    print(f"⚠️ خطا در بارگذاری admin: {e}")

try:
    from app.routes import admin_management
    app.include_router(admin_management.router, prefix="/api/management", tags=["Admin Management"])
except Exception as e:
    print(f"⚠️ خطا در بارگذاری admin_management: {e}")

try:
    from app.routes import prices
    app.include_router(prices.router, prefix="/api", tags=["Market Prices"])
except Exception as e:
    print(f"⚠️ خطا در بارگذاری prices: {e}")

try:
    from app.routes import trades
    app.include_router(trades.router, prefix="/api", tags=["Trades"])
except Exception as e:
    print(f"⚠️ خطا در بارگذاری trades: {e}")

# ✅ نمایش مسیرهای فعال
print("📋 مسیرهای فعال:")
for route in app.routes:
    if hasattr(route, 'path') and '/api/' in route.path:
        methods = ', '.join(route.methods)
        print(f"  - {route.path} ({methods})")

# ✅ هندلر خطاها
@app.exception_handler(404)
async def not_found_exception_handler(request: Request, exc):
    return JSONResponse(
        status_code=404,
        content={
            "detail": f"مسیر {request.url} یافت نشد",
            "available_routes": [
                "/api/health",
                "/api/auth/login",
                "/api/admin/login",
                "/api/admin/users",
                "/api/admin/admins",
                "/api/management/admins",
                "/docs"
            ]
        }
    )

@app.exception_handler(500)
async def internal_server_error_handler(request: Request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": "خطای داخلی سرور"}
    )

# ✅ اجرای مستقیم
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
