import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def create_initial_data():
    print("🚀 در حال ایجاد داده‌های اولیه...")
    
    from app.database import SessionLocal
    from app.models import User, UserRole, AccessGrade
    from app.routes.auth import get_password_hash
    
    db = SessionLocal()
    try:
        # ایجاد Chief
        chief = User(
            username="chiefadmin",
            email="chief@parsagold.com",
            password=get_password_hash("Chief123!"),
            first_name="مدیر",
            last_name="ارشد",
            phone="09120000001",
            national_id="0012345678",
            role=UserRole.ADMIN,
            access_grade=AccessGrade.CHIEF,
            is_active=True,
            needs_approval=False
        )
        
        # ایجاد ادمین سطح 1
        admin1 = User(
            username="admin1",
            email="admin1@parsagold.com",
            password=get_password_hash("Admin123!"),
            first_name="امین",
            last_name="محمدی",
            phone="09120000002",
            national_id="0012345679",
            role=UserRole.ADMIN,
            access_grade=AccessGrade.GRADE1,
            is_active=True,
            needs_approval=False
        )
        
        # ایجاد کاربر معمولی
        user1 = User(
            username="user1",
            email="user1@gmail.com",
            password=get_password_hash("User123!"),
            first_name="علی",
            last_name="رضایی",
            phone="09120000003",
            national_id="0012345680",
            role=UserRole.USER,
            is_active=True
        )
        
        db.add_all([chief, admin1, user1])
        db.commit()
        
        print("✅ کاربران اولیه ایجاد شدند:")
        print("👑 Chief: chief@parsagold.com / Chief123!")
        print("👨‍💼 Admin: admin1@parsagold.com / Admin123!")
        print("👤 User: user1@gmail.com / User123!")
        
        # نمایش تمام کاربران
        users = db.query(User).all()
        print(f"\n📊 تعداد کل کاربران در دیتابیس: {len(users)}")
        
    except Exception as e:
        print(f"❌ خطا در ایجاد داده‌ها: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_initial_data()