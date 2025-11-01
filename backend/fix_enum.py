import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine
from sqlalchemy import text

def fix_enum():
    print("🔧 در حال رفع مشکل Enum...")
    
    try:
        with engine.connect() as conn:
            # حذف تمام enumهای قدیمی
            conn.execute(text("DROP TYPE IF EXISTS userrole CASCADE"))
            conn.execute(text("DROP TYPE IF EXISTS accessgrade CASCADE"))
            conn.execute(text("DROP TYPE IF EXISTS tradetype CASCADE"))
            conn.commit()
            print("✅ Enumهای قدیمی حذف شدند")
        
        # ایجاد مجدد جدول users
        from app.models import User
        User.__table__.create(engine)
        print("✅ جدول users با فیلد balance ایجاد شد")
        
    except Exception as e:
        print(f"❌ خطا: {e}")

if __name__ == "__main__":
    fix_enum()