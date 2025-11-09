import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models.models import User, AdminUser
from app.security.auth import verify_password

def check_users():
    db = SessionLocal()
    try:
        print("🔍 بررسی کاربران عادی:")
        users = db.query(User).all()
        for user in users:
            print(f"👤 User ID: {user.id}, Email: {user.email}, Username: {user.username}, Role: {user.role}")
        
        print("\n🔍 بررسی کاربران ادمین:")
        admins = db.query(AdminUser).all()
        for admin in admins:
            print(f"🛡️ Admin ID: {admin.id}, Username: {admin.username}, Role: {admin.role}, Active: {admin.is_active}")
            
            # تست رمز عبور
            test_passwords = ["Chief123!", "Admin123!", "admin123", "password", "123456", "parsagold"]
            for pwd in test_passwords:
                if verify_password(pwd, admin.password_hash):
                    print(f"   ✅ رمز عبور صحیح: {pwd}")
                    break
            else:
                print(f"   ❌ رمز عبور تست شده: {test_passwords}")
        
        if not admins:
            print("❌ هیچ کاربر ادمینی یافت نشد!")
            
    except Exception as e:
        print(f"❌ خطا در بررسی کاربران: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_users()