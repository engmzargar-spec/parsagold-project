# فایل: backend/app/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

# بارگذاری متغیرهای محیطی
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(env_path)

Base = declarative_base()

# استفاده مستقیم از DATABASE_URL در .env
DATABASE_URL = os.getenv("DATABASE_URL")

print(f"🔗 اتصال به: {DATABASE_URL}")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    """Initialize database"""
    try:
        from app.models import Base
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
    print("🔍 تست مستقیم دیتابیس...")
    init_db()