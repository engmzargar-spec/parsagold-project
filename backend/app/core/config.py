# backend/app/core/config.py
import os
from typing import Optional

class Settings:
    """تنظیمات مرکزی برنامه"""
    
    def __init__(self):
        # پورت پیش‌فرض - می‌تواند از متغیر محیطی خوانده شود
        self.API_PORT = int(os.getenv("API_PORT", "8000"))
        self.API_HOST = os.getenv("API_HOST", "0.0.0.0")
        self.API_BASE_URL = f"http://localhost:{self.API_PORT}"
        
        # تنظیمات دیتابیس
        self.DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./parsagold.db")
        
        # تنظیمات JWT
        self.SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
        self.ALGORITHM = "HS256"
        self.ACCESS_TOKEN_EXPIRE_MINUTES = 30

# ایجاد instance全局
settings = Settings()

def get_settings() -> Settings:
    """دریافت تنظیمات"""
    return settings