from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import os
import time
from typing import Dict, List
from starlette.middleware.base import BaseHTTPMiddleware

# ✅ اصلاح SecurityMiddleware
class SecurityMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self.rate_limit_requests: Dict[str, List[float]] = {}
        self.rate_limit_window = 60  # 60 ثانیه
        self.max_requests_per_minute = 100
        
        self.blocked_ips = set()
    
    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host
        
        if client_ip in self.blocked_ips:
            return JSONResponse(
                status_code=403,
                content={"detail": "دسترسی مسدود شده"}
            )
        
        if not self.check_rate_limit(client_ip):
            return JSONResponse(
                status_code=429,
                content={"detail": "تعداد درخواست‌ها بیش از حد مجاز است"}
            )
        
        user_agent = request.headers.get("user-agent", "")
        if self.is_suspicious_user_agent(user_agent):
            self.blocked_ips.add(client_ip)
            return JSONResponse(
                status_code=403,
                content={"detail": "دسترسی غیرمجاز"}
            )
        
        response = await call_next(request)
        
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        return response
    
    def check_rate_limit(self, client_ip: str) -> bool:
        now = time.time()
        if client_ip not in self.rate_limit_requests:
            self.rate_limit_requests[client_ip] = []
        
        self.rate_limit_requests[client_ip] = [
            req_time for req_time in self.rate_limit_requests[client_ip]
            if now - req_time < self.rate_limit_window
        ]
        
        if len(self.rate_limit_requests[client_ip]) >= self.max_requests_per_minute:
            return False
        
        self.rate_limit_requests[client_ip].append(now)
        return True
    
    def is_suspicious_user_agent(self, user_agent: str) -> bool:
        suspicious_patterns = [
            "sqlmap", "nikto", "metasploit", "nmap", 
            "wget", "curl", "python-requests", "havij",
            "sql injection", "xss", "csrf", "bot", "crawler",
            "",
        ]
        
        user_agent_lower = user_agent.lower()
        return any(pattern in user_agent_lower for pattern in suspicious_patterns)