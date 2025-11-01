import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine
from sqlalchemy import text

def fix_database_correct():
    print("🔧 در حال تعمیر دیتابیس...")
    
    try:
        # اتصال مستقیم و حذف تمام جداول با CASCADE
        with engine.connect() as conn:
            # استفاده از text() برای دستورات SQL
            conn.execute(text("DROP TABLE IF EXISTS trades CASCADE"))
            conn.execute(text("DROP TABLE IF EXISTS portfolios CASCADE")) 
            conn.execute(text("DROP TABLE IF EXISTS users CASCADE"))
            conn.execute(text("DROP TABLE IF EXISTS alembic_version CASCADE"))
            conn.commit()
            print("✅ تمام جداول قدیمی حذف شدند")
        
        print("🎯 دیتابیس کاملاً پاک شد")
        
        # ایجاد جداول جدید
        from app.models import Base
        Base.metadata.create_all(bind=engine)
        print("✅ جداول جدید با ساختار به‌روز ایجاد شدند")
        
    except Exception as e:
        print(f"❌ خطا: {e}")

if __name__ == "__main__":
    fix_database_correct()