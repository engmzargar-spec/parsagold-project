from fastapi import Request
from fastapi.responses import JSONResponse
import time
from typing import Dict, List
from starlette.middleware.base import BaseHTTPMiddleware

class SecurityMiddleware(BaseHTTPMiddleware):
    """
    میدلور امنیتی برای پارسا گلد
    - Rate Limiting
    - Block ابزارهای هک
    - هدرهای امنیتی
    """
    
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
        
        # بررسی User-Agent (غیرفعال موقت برای تست)
        user_agent = request.headers.get("user-agent", "")
        if self.is_suspicious_user_agent(user_agent):
            print(f"⚠️ User-Agent مشکوک شناسایی شد: {user_agent}")
            # فعلاً فقط لاگ کن، مسدود نکن
            # self.blocked_ips.add(client_ip)
            # return JSONResponse(
            #     status_code=403,
            #     content={"detail": "دسترسی غیرمجاز"}
            # )
        
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
        """بررسی User-Agent مشکوک"""
        if not user_agent:
            return False  # User-Agent خالی مشکوک نیست
        
        user_agent_lower = user_agent.lower()
        
        # فقط ابزارهای هک پیشرفته
        hacking_tools = [
            "sqlmap", "nikto", "metasploit",
            "acunetix", "nessus", "burpsuite", "zap"
        ]
        
        suspicious = any(tool in user_agent_lower for tool in hacking_tools)
        if suspicious:
            print(f"🚨 ابزار هک شناسایی شد: {user_agent}")
        return suspicious