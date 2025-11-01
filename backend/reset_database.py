import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base
from app.models import User

def reset_database():
    print("🔄 در حال بازنشانی دیتابیس...")
    
    try:
        # حذف تمام جداول
        Base.metadata.drop_all(bind=engine)
        print("✅ جداول قدیمی حذف شدند")
        
        # ایجاد جداول جدید با ساختار به‌روز
        Base.metadata.create_all(bind=engine)
        print("✅ جداول جدید با ساختار به‌روز ایجاد شدند")
        
        print("🎯 دیتابیس آماده استفاده است!")
        
    except Exception as e:
        print(f"❌ خطا در بازنشانی دیتابیس: {e}")

if __name__ == "__main__":
    reset_database()