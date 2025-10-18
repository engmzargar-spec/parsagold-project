# backend/app/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from urllib.parse import quote_plus
import os
from dotenv import load_dotenv

# 🔧 بارگذاری متغیرهای محیطی از فایل .env در مسیر درست
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(env_path)

Base = declarative_base()

# ✅ استفاده از متغیرهای محیطی
DATABASE_URL = os.getenv("DATABASE_URL")

# اگر DATABASE_URL در .env تنظیم نشده، از حالت fallback استفاده کن
if not DATABASE_URL:
    print("⚠️  DATABASE_URL در .env پیدا نشد، از حالت پیش‌فرض استفاده می‌کنم...")
    password = "Mezr@1360"
    encoded_password = quote_plus(password)
    DATABASE_URL = f"postgresql://postgres:{encoded_password}@localhost:5432/parsagold"
else:
    print("✅ فایل .env با موفقیت load شد!")

print(f"🔗 اتصال به: {DATABASE_URL.split('@')[1]}")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    """Initialize database"""
    try:
        import models
        Base.metadata.create_all(bind=engine)
        print("✅ جداول با موفقیت در PostgreSQL ایجاد شدند!")
    except Exception as e:
        print(f"❌ خطا در ایجاد جداول: {e}")
        import traceback
        traceback.print_exc()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

if __name__ == "__main__":
    print("🔍 تست مستقیم دیتابیس با تنظیمات .env...")
    init_db()