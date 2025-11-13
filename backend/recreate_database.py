import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base
from app.models import *

def recreate_database():
    """حذف و ایجاد مجدد تمام جداول با CASCADE"""
    print("🗑️  در حال حذف جداول قدیمی با CASCADE...")
    
    # استفاده از CASCADE برای حذف
    with engine.connect() as conn:
        conn.execute("SET session_replication_role = 'replica';")  # غیرفعال کردن موقت constraintها
        
    Base.metadata.drop_all(bind=engine)
    
    with engine.connect() as conn:
        conn.execute("SET session_replication_role = 'origin';")  # فعال کردن مجدد constraintها
    
    print("🔄 در حال ایجاد جداول جدید...")
    Base.metadata.create_all(bind=engine)
    
    print("✅ دیتابیس با موفقیت بازسازی شد!")

if __name__ == "__main__":
    recreate_database()