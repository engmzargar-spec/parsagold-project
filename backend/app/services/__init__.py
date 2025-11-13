# backend/app/services/__init__.py
# نگهداری برای سازگاری با backward - مهاجرت تدریجی

from ..security.core.hashing import (
    password_manager, 
    HashAlgorithm
)

# توابع compatibility برای سیستم‌های قدیمی
from ..security.core.hashing import password_manager as advanced_password_manager

def verify_password(plain_password: str, hashed_password: str, algorithm: str) -> bool:
    """تابع compatibility برای سیستم قدیم"""
    return advanced_password_manager.verify_password(plain_password, hashed_password, algorithm)

def get_password_hash(password: str, algorithm: HashAlgorithm = None) -> str:
    """تابع compatibility برای سیستم قدیم"""
    hashed, algo = advanced_password_manager.hash_password(password, algorithm)
    return hashed

def validate_password_strength(password: str) -> tuple[bool, str]:
    """تابع compatibility برای سیستم قدیم"""
    return advanced_password_manager.validate_password_policy(password)

__all__ = [
    "password_manager", 
    "verify_password", 
    "get_password_hash", 
    "validate_password_strength",
    "HashAlgorithm",
    "advanced_password_manager"  # برای استفاده در سیستم‌های جدید
]