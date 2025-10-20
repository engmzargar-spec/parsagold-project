# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

# استفاده از lifespan
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

# ایمپورت و include کردن روت‌ها
try:
    from routes.auth import router as auth_router
    app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
    print("✅ روت احراز هویت بارگذاری شد")
except Exception as e:
    print(f"⚠️ خطا در بارگذاری روت احراز هویت: {e}")

try:
    from routes.admin import router as admin_router
    app.include_router(admin_router, prefix="/api/admin", tags=["Admin"])
    print("✅ روت مدیریت بارگذاری شد")
except Exception as e:
    print(f"⚠️ خطا در بارگذاری روت مدیریت: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)