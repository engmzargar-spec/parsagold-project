# backend/app/seed_data.py
from app.database import SessionLocal

try:
    from app.models import AdminUser, User, UserStatus, RegularUserProfile
    print("✅ مدل‌ها از app.models import شدند")
except ImportError:
    try:
        from app.models.models import AdminUser, User, UserStatus, RegularUserProfile
        print("✅ مدل‌ها از app.models.models import شدند")
    except ImportError as e:
        print(f"❌ خطا در import مدل‌ها: {e}")
        raise

from app.security.auth import get_password_hash

def seed_initial_data():
    db = SessionLocal()
    try:
        print("🌱 در حال ایجاد داده‌های نمونه...")
        
        # === ایجاد ادمین‌ها ===
        admins_data = [
            {
                'username': 'chief-admin-zargar',
                'email': 'chief@parsagold.com',
                'password': 'Mezr@1360',
                'first_name': 'مدیر',
                'last_name': 'ارشد زرگر',
                'role': 'super_admin'
            },
            {
                'username': 'admin-support', 
                'email': 'support@parsagold.com',
                'password': 'Support123',
                'first_name': 'پشتیبان',
                'last_name': 'سیستم',
                'role': 'support'
            }
        ]
        
        for admin_data in admins_data:
            admin = db.query(AdminUser).filter(AdminUser.username == admin_data['username']).first()
            if not admin:
                password_hash = get_password_hash(admin_data['password'])
                admin = AdminUser(
                    username=admin_data['username'],
                    email=admin_data['email'],
                    password_hash=password_hash,
                    first_name=admin_data['first_name'],
                    last_name=admin_data['last_name'],
                    role=admin_data['role']
                )
                db.add(admin)
                print(f"✅ ادمین ایجاد شد: {admin_data['username']}")
        
        # === ایجاد کاربران عادی ===
        users_data = [
            {
                'phone': '09123456789',
                'email': 'user1@parsagold.com',
                'password': '123456',
                'first_name': 'علی',
                'last_name': 'رضایی',
                'balance': 5000000,
                'credit_score': 75
            },
            {
                'phone': '09129876543',
                'email': 'user2@parsagold.com', 
                'password': '123456',
                'first_name': 'مریم',
                'last_name': 'محمدی',
                'balance': 2500000,
                'credit_score': 60
            },
            {
                'phone': '09151112233',
                'email': 'user3@parsagold.com',
                'password': '123456',
                'first_name': 'رضا', 
                'last_name': 'کریمی',
                'balance': 1000000,
                'credit_score': 45
            }
        ]
        
        for user_data in users_data:
            user = db.query(User).filter(User.phone == user_data['phone']).first()
            if not user:
                password_hash = get_password_hash(user_data['password'])
                user = User(
                    phone=user_data['phone'],
                    email=user_data['email'],
                    password_hash=password_hash,
                    first_name=user_data['first_name'],
                    last_name=user_data['last_name'],
                    country='ایران',
                    status=UserStatus.ACTIVE,
                    user_type='regular',
                    full_name=f"{user_data['first_name']} {user_data['last_name']}"
                )
                db.add(user)
                db.flush()  # برای گرفتن ID
                
                # ایجاد پروفایل کاربر
                profile = RegularUserProfile(
                    user_id=user.id,
                    balance=user_data['balance'],
                    credit_score=user_data['credit_score'],
                    risk_level='low' if user_data['credit_score'] > 70 else 'medium' if user_data['credit_score'] > 50 else 'high',
                    trading_volume=user_data['balance'] * 5
                )
                db.add(profile)
                print(f"✅ کاربر ایجاد شد: {user_data['phone']}")
        
        db.commit()
        print("🎉 داده‌های نمونه با موفقیت ایجاد شدند")
        
        # نمایش اطلاعات لاگین
        print("\n🔐 اطلاعات لاگین:")
        print("ادمین‌ها:")
        print("  - chief-admin-zargar / Mezr@1360")
        print("  - admin-support / Support123")
        print("\nکاربران عادی:")
        print("  - 09123456789 / 123456")
        print("  - 09129876543 / 123456") 
        print("  - 09151112233 / 123456")
        
    except Exception as e:
        print(f'❌ خطا در ایجاد داده اولیه: {e}')
        db.rollback()
        raise
    finally:
        db.close()