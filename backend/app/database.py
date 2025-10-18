# backend/app/database.py (موقت برای سیستم دوم)
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from urllib.parse import quote_plus
import os
from dotenv import load_dotenv

# بارگذاری متغیرهای محیطی
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(env_path)

Base = declarative_base()

# ✅ استفاده موقت از کاربر postgres برای ایجاد جداول
password = "Mezr@1360"  # رمز عبور PostgreSQL سیستم دوم
encoded_password = quote_plus(password)
DATABASE_URL = f"postgresql://postgres:{encoded_password}@localhost:5432/parsagold"

print(f"🔗 اتصال به: localhost:5432/parsagold")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    """Initialize database"""
    try:
        import models
        Base.metadata.create_all(bind=engine)
        print("✅ جداول با موفقیت در PostgreSQL ایجاد شدند!")
        
        # اعطای دسترسی به parsagold_user
        with engine.connect() as conn:
            from sqlalchemy import text
            conn.execute(text("GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO parsagold_user;"))
            conn.execute(text("GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO parsagold_user;"))
            conn.commit()
            print("✅ دسترسی‌ها به parsagold_user اعطا شد")
            
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