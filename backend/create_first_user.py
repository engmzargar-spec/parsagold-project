# D:/parsagold-project/backend/create_first_user.py
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models.user_models import User, RegularUserProfile, UserStatus
from app.security.core.hashing import password_manager

def create_first_user():
    db = SessionLocal()
    try:
        # بررسی وجود کاربر با مدل SQLAlchemy
        existing_user = db.query(User).filter(User.phone == "09123456789").first()
        if existing_user:
            print("✅ کاربر از قبل وجود دارد!")
            print(f"📱 شماره: {existing_user.phone}")
            print(f"📧 ایمیل: {existing_user.email}")
            print(f"🔑 public_id: {existing_user.public_id}")
            return

        # هش کردن پسورد
        password = "Admin@Gold2024!"
        hashed_password, algorithm = password_manager.hash_password(password)
        
        print(f"🔐 پسورد هش شده با الگوریتم: {algorithm}")

        # ایجاد کاربر جدید - با مدل SQLAlchemy
        new_user = User(
            phone="09123456789",
            email="user@parsagold.com",
            password_hash=hashed_password,
            first_name="کاربر",
            last_name="نمونه",
            country="ایران",
            city="تهران",
            status=UserStatus.ACTIVE,
            email_verified=True,
            phone_verified=True,
            user_type="regular"
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # ایجاد پروفایل کاربر عادی
        user_profile = RegularUserProfile(
            user_id=new_user.id,
            balance=10000000,
            credit_score=80,
            risk_level="low",
            trading_volume=0,
            preferred_assets=["gold", "silver", "oil"]
        )
        
        db.add(user_profile)
        db.commit()
        
        print("\n🎉 کاربر اول با موفقیت ایجاد شد!")
        print("=" * 50)
        print(f"👤 نام: {new_user.full_name}")
        print(f"📱 شماره: {new_user.phone}")
        print(f"📧 ایمیل: {new_user.email}")
        print(f"🔑 public_id: {new_user.public_id}")
        print(f"💰 اعتبار اولیه: ۱۰,۰۰۰,۰۰۰ تومان")
        print("=" * 50)
        print("\n💡 نکته: برای تست لاگین از این اطلاعات استفاده کن:")
        print("   📱 شماره: 09123456789")
        print("   🔑 پسورد: Admin@Gold2024!")
        
    except Exception as e:
        db.rollback()
        print(f"❌ خطا در ایجاد کاربر: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    create_first_user()