import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models import User
from app.routes.auth import get_password_hash

def change_password():
    db = SessionLocal()
    try:
        # پیدا کردن کاربر Chief
        user = db.query(User).filter(User.email == "chief@parsagold.com").first()
        
        if user:
            # تغییر رمز عبور
            user.password = get_password_hash("Mezr@1360")
            db.commit()
            
            print("✅ رمز عبور Chief تغییر کرد")
            print("📧 ایمیل: chief@parsagold.com")
            print("🔑 رمز جدید: Mezr@1360")
            
            # تست رمز جدید
            from app.routes.auth import verify_password
            is_correct = verify_password("Mezr@1360", user.password)
            print(f"🔑 تست رمز جدید: {'✅ صحیح' if is_correct else '❌ نادرست'}")
        else:
            print("❌ کاربر Chief پیدا نشد")
            
    except Exception as e:
        print(f"❌ خطا: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    change_password()