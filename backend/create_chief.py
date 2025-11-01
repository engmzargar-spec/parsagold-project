import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models import User, UserRole, AccessGrade
from app.routes.auth import get_password_hash

def create_chief():
    db = SessionLocal()
    try:
        # ایجاد کاربر Chief
        chief = User(
            username="chiefadmin",
            email="chief@parsagold.com",
            password=get_password_hash("Chief123!"),
            first_name="مدیر",
            last_name="ارشد",
            phone="09120000001",
            national_id="0012345678",
            role=UserRole.ADMIN,
            access_grade=AccessGrade.CHIEF,
            is_active=True,
            needs_approval=False,
            balance=0.0
        )
        
        db.add(chief)
        db.commit()
        
        print("✅ کاربر Chief ایجاد شد")
        print("📧 ایمیل: chief@parsagold.com")
        print("🔑 رمز: Chief123!")
        
    except Exception as e:
        print(f"❌ خطا: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_chief()