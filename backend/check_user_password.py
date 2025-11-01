import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models import User

def check_user():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "chief@parsagold.com").first()
        if user:
            print(f"👤 کاربر: {user.email}")
            print(f"🔐 رمز ذخیره شده: {user.password}")
            print(f"🔑 طول رمز: {len(user.password)}")
        else:
            print("❌ کاربر پیدا نشد")
    except Exception as e:
        print(f"❌ خطا: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_user()