# backend/app/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# بارگذاری متغیرهای محیطی
load_dotenv()

# تنظیمات دیتابیس
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://parsagold_user:password@localhost/parsagold")

# ایجاد موتور دیتابیس
engine = create_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True
)

# ایجاد session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base برای مدل‌ها
Base = declarative_base()

# Dependency برای گرفتن session دیتابیس
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()