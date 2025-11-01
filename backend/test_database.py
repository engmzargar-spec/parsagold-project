import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine
from app.models import Base, User, UserRole, AccessGrade
from app.routes.auth import get_password_hash

def test_database():
    print("🧪 تست اتصال به دیتابیس...")
    
    # ایجاد جداول
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ جداول دیتابیس ایجاد شدند")
    except Exception as e:
        print(f"❌ خطا در ایجاد جداول: {e}")
        return
    
    # تست اتصال و ایجاد کاربر
    db = SessionLocal()
    try:
        # بررسی کاربران موجود
        user_count = db.query(User).count()
        print(f"📊 تعداد کاربران موجود: {user_count}")
        
        # ایجاد یک کاربر تست
        test_user = User(
            username="testuser",
            email="test@parsagold.com",
            password=get_password_hash("Test123!"),
            first_name="تست",
            last_name="کاربر",
            phone="09121111111",
            national_id="1111111111",
            role=UserRole.USER,
            is_active=True
        )
        
        db.add(test_user)
        db.commit()
        
        print("✅ کاربر تست با موفقیت ایجاد شد")
        
        # نمایش کاربران
        users = db.query(User).all()
        print("\n👥 کاربران در دیتابیس:")
        for user in users:
            print(f"  - {user.username} ({user.email}) - نقش: {user.role}")
            
    except Exception as e:
        print(f"❌ خطا در عملیات دیتابیس: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    test_database()