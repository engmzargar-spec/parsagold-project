import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base
from app.models import User

def fix_database():
    print("🔧 در حال تعمیر دیتابیس...")
    
    try:
        # حذف و ایجاد مجدد جدول users
        User.__table__.drop(engine, checkfirst=True)
        User.__table__.create(engine)
        print("✅ جدول users با فیلد balance ایجاد شد")
        
    except Exception as e:
        print(f"❌ خطا: {e}")

if __name__ == "__main__":
    fix_database()