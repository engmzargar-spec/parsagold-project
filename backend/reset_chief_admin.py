# backend/reset_chief_admin.py
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import get_db
from app.services.password_manager import get_password_hash
from app.models.models import AdminUser

def reset_chief_admin_password():
    """ریست رمز عبور chief در جدول AdminUser"""
    db = next(get_db())
    
    try:
        # پیدا کردن chief در جدول AdminUser
        chief = db.query(AdminUser).filter(AdminUser.username == "chief-admin-zargar").first()
        
        if not chief:
            print("❌ Chief admin not found in AdminUser table!")
            # لیست تمام ادمین‌ها برای دیباگ
            all_admins = db.query(AdminUser).all()
            print(f"🔍 Available admins: {[admin.username for admin in all_admins]}")
            return
        
        print(f"✅ Chief found: {chief.username}")
        print(f"📧 Email: {chief.email}")
        print(f"🔐 Current hash: {chief.password_hash}")
        print(f"🔍 Hash starts with: {chief.password_hash[:20] if chief.password_hash else 'None'}")
        
        # ریست رمز عبور به Mezr@1360 با سیستم جدید
        new_password = "Mezr@1360"
        new_hash = get_password_hash(new_password)
        
        chief.password_hash = new_hash
        db.commit()
        
        print(f"✅ Password reset successfully!")
        print(f"👤 Username: {chief.username}")
        print(f"🔑 New password: {new_password}")
        print(f"🔐 New hash: {new_hash}")
        print(f"🔍 New hash starts with: {new_hash[:10]}")
        print(f"📏 New hash length: {len(new_hash)}")
        
        # تأیید که هش با فرمت bcrypt هست
        if new_hash.startswith("$2b$"):
            print("✅ Hash format: bcrypt (valid)")
        else:
            print("❌ Hash format: invalid")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        import traceback
        print(f"🔍 Traceback: {traceback.format_exc()}")
    finally:
        db.close()

if __name__ == "__main__":
    reset_chief_admin_password()