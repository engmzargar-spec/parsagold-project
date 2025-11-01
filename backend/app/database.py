# backend/app/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# بارگذاری متغیرهای محیطی
load_dotenv()

# تنظیمات دیتابیس - از SQLite برای توسعه استفاده می‌کنیم
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./parsagold.db")

# ایجاد موتور دیتابیس
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(
        DATABASE_URL,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True
    )

# ایجاد session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base برای مدل‌ها - از models.py شما استفاده می‌کنیم
from .models.models import Base

# Dependency برای گرفتن session دیتابیس
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()