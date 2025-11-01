import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine
from sqlalchemy import text

def fix_database_cascade():
    print("🔧 در حال تعمیر دیتابیس با CASCADE...")
    
    try:
        # اتصال مستقیم و حذف جدول با CASCADE
        with engine.connect() as conn:
            conn.execute(text("DROP TABLE IF EXISTS users CASCADE"))
            conn.commit()
            print("✅ جدول users با CASCADE حذف شد")
        
        # ایجاد مجدد جدول
        from app.models import User
        User.__table__.create(engine)
        print("✅ جدول users با فیلد balance ایجاد شد")
        
    except Exception as e:
        print(f"❌ خطا: {e}")

if __name__ == "__main__":
    fix_database_cascade()