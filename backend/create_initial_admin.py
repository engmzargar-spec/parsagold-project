import sys
import os

# اضافه کردن مسیر پروژه به PATH
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine, Base
from app.models.admin_models import AdminUser, AdminRole
from app.core.auth import get_password_hash

def create_initial_admin():
    """ایجاد ادمین اولیه سیستم"""
    db = SessionLocal()
    
    try:
        # بررسی وجود ادمین
        existing_admin = db.query(AdminUser).filter(
            AdminUser.role == AdminRole.SUPER_ADMIN
        ).first()
        
        if existing_admin:
            print("✅ ادمین سوپرادمین از قبل وجود دارد:")
            print(f"   کاربری: {existing_admin.username}")
            print(f"   ایمیل: {existing_admin.email}")
            print(f"   نقش: {existing_admin.role.value}")
            return
        
        # ایجاد سوپرادمین اولیه
        super_admin = AdminUser(
            username="superadmin",
            email="superadmin@parsagold.com",
            password_hash=get_password_hash("SuperAdmin123!"),
            first_name="Super",
            last_name="Admin", 
            role=AdminRole.SUPER_ADMIN,
            phone="+981234567890"
        )
        
        db.add(super_admin)
        db.commit()
        
        print("🎉 ادمین سوپرادمین ایجاد شد!")
        print("═" * 50)
        print("📋 اطلاعات لاگین:")
        print(f"   کاربری: superadmin")
        print(f"   رمز عبور: SuperAdmin123!")
        print(f"   ایمیل: superadmin@parsagold.com")
        print("═" * 50)
        print("⚠️  لطفاً پس از اولین لاگین رمز عبور را تغییر دهید!")
        
    except Exception as e:
        print(f"❌ خطا در ایجاد ادمین: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_initial_admin()