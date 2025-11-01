from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from starlette.middleware.base import BaseHTTPMiddleware
import os
import time
from typing import Dict, List

# ✅ تعریف SecurityMiddleware در همین فایل
class SecurityMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self.rate_limit_requests: Dict[str, List[float]] = {}
        self.rate_limit_window = 60  # 60 ثانیه
        self.max_requests_per_minute = 100
        self.blocked_ips = set()
    
    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host
        
        # بررسی IP bloque شده
        if client_ip in self.blocked_ips:
            return JSONResponse(
                status_code=403,
                content={"detail": "دسترسی مسدود شده"}
            )
        
        # بررسی Rate Limiting
        if not self.check_rate_limit(client_ip):
            return JSONResponse(
                status_code=429,
                content={"detail": "تعداد درخواست‌ها بیش از حد مجاز است"}
            )
        
        # بررسی User-Agent
        user_agent = request.headers.get("user-agent", "")
        if self.is_suspicious_user_agent(user_agent):
            self.blocked_ips.add(client_ip)
            return JSONResponse(
                status_code=403,
                content={"detail": "دسترسی غیرمجاز"}
            )
        
        # ادامه پردازش درخواست
        response = await call_next(request)
        
        # اضافه کردن هدرهای امنیتی
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        return response
    
    def check_rate_limit(self, client_ip: str) -> bool:
        """بررسی محدودیت نرخ درخواست"""
        now = time.time()
        if client_ip not in self.rate_limit_requests:
            self.rate_limit_requests[client_ip] = []
        
        # حذف درخواست‌های قدیمی
        self.rate_limit_requests[client_ip] = [
            req_time for req_time in self.rate_limit_requests[client_ip]
            if now - req_time < self.rate_limit_window
        ]
        
        # بررسی تعداد درخواست‌ها
        if len(self.rate_limit_requests[client_ip]) >= self.max_requests_per_minute:
            return False
        
        # اضافه کردن درخواست جدید
        self.rate_limit_requests[client_ip].append(now)
        return True
    
    def is_suspicious_user_agent(self, user_agent: str) -> bool:
        """بررسی User-Agent مشکوک - فقط ابزارهای هک رو مسدود کن"""
        if not user_agent:
            return True  # User-Agent خالی = مشکوک
        
        user_agent_lower = user_agent.lower()
        
        # ❌ فقط ابزارهای هک و اسکنر رو مسدود کن
        hacking_tools = [
            "sqlmap", "nikto", "metasploit", "nmap", 
            "wget", "curl", "python-requests", "havij",
            "acunetix", "nessus", "burpsuite", "zap",
            "sql injection", "xss", "csrf", "dirb", "gobuster"
        ]
        
        # فقط اگر User-Agent شامل ابزار هک بود، مسدود کن
        return any(tool in user_agent_lower for tool in hacking_tools)

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

# ✅ اضافه کردن middleware امنیتی (حالا درست کار می‌کنه)
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

# ایمپورت و include کردن روت‌ها
try:
    from app.routes import auth, admin_management, admin, users
    
    # ✅ ساختار تمیز و بدون تکرار
    app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
    app.include_router(admin_management.router, prefix="/api", tags=["Admin Management"])  # ✅ تغییر: prefix="/api"
    app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
    app.include_router(users.router, prefix="/api/admin", tags=["Users"])
    
    print("✅ روت‌های اصلی بارگذاری شدند")
    
    # نمایش روت‌های ثبت‌شده برای دیباگ
    print("📋 روت‌های فعال:")
    for route in app.routes:
        if hasattr(route, 'path') and hasattr(route, 'methods'):
            methods = ', '.join(route.methods) if route.methods else 'No methods'
            print(f"  - {route.path} ({methods})")
            
except Exception as e:
    print(f"⚠️ خطا در بارگذاری روت‌ها: {e}")
    import traceback
    traceback.print_exc()

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