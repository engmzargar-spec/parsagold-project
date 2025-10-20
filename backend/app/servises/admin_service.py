# backend/app/services/admin_service.py
import re
from typing import Optional, Dict
from sqlalchemy.orm import Session

class AdminRegistrationService:
    ADMIN_CODES = {
        "adminpg1357": "admin",
        "superadminpg2468": "super_admin"
    }
    
    @classmethod
    def detect_admin_email(cls, email: str) -> Optional[str]:
        """
        تشخیص کدهای ادمین در ایمیل
        """
        for code, role in cls.ADMIN_CODES.items():
            if f"{code}@" in email or email.startswith(f"{code}-"):
                return role
        return None
    
    @classmethod
    def normalize_admin_email(cls, email: str) -> str:
        """
        نرمال‌سازی ایمیل ادمین
        """
        for code in cls.ADMIN_CODES.keys():
            if email.startswith(f"{code}-"):
                return email.replace(f"{code}-", "")
        return email
    
    @classmethod
    def create_admin_user(cls, db: Session, user_data: dict) -> dict:
        """
        ایجاد کاربر ادمین
        """
        role = cls.detect_admin_email(user_data['email'])
        normalized_email = cls.normalize_admin_email(user_data['email'])
        
        if role:
            from ..models import User, UserRole
            user = User(
                email=normalized_email,
                phone=user_data['phone'],
                first_name=user_data['first_name'],
                last_name=user_data['last_name'],
                national_id=user_data['national_id'],
                password=user_data['password'],  # باید hash شده باشد
                role=UserRole(role)
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            
            return {
                "message": "کاربر ادمین با موفقیت ایجاد شد",
                "user_id": user.id,
                "role": role,
                "normalized_email": normalized_email
            }
        
        return {"message": "کد ادمین معتبر نیست"}