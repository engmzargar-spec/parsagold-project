import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine

def fix_database():
    print("🔧 در حال تعمیر دیتابیس...")
    
    try:
        # اتصال مستقیم و حذف تمام جداول با CASCADE
        with engine.begin() as conn:  # استفاده از begin() برای transaction
            # حذف تمام جداول با CASCADE
            conn.execute("""
                DROP TABLE IF EXISTS 
                    trades CASCADE, 
                    portfolios CASCADE, 
                    users CASCADE,
                    alembic_version CASCADE;
            """)
            print("✅ تمام جداول قدیمی حذف شدند")
        
        print("🎯 دیتابیس کاملاً پاک شد")
        
        # ایجاد جداول جدید
        from app.models import Base
        Base.metadata.create_all(bind=engine)
        print("✅ جداول جدید با ساختار به‌روز ایجاد شدند")
        
    except Exception as e:
        print(f"❌ خطا: {e}")

if __name__ == "__main__":
    fix_database()