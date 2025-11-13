import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models.admin_models import AdminUser, AdminStatus

def check_admin_status():
    """بررسی وضعیت ادمین‌ها"""
    db = SessionLocal()
    
    try:
        admins = db.query(AdminUser).all()
        
        if not admins:
            print("❌ هیچ ادمینی یافت نشد")
            return
        
        print("👥 لیست ادمین‌ها:")
        for admin in admins:
            print(f"   کاربری: {admin.username}")
            print(f"   ایمیل: {admin.email}")
            print(f"   وضعیت: {admin.status.value}")
            print(f"   نقش: {admin.role.value}")
            print("   ──────────────────────")
            
    except Exception as e:
        print(f"❌ خطا: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_admin_status()