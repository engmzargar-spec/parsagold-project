# backend/app/seed_data.py
from app.database import SessionLocal
from app.models.models import AdminUser
from app.security.auth import get_password_hash  # ✅ استفاده از تابع یکسان

def seed_initial_data():
    db = SessionLocal()
    try:
        # بررسی وجود کاربر chief
        chief = db.query(AdminUser).filter(AdminUser.username == 'chief-admin-zargar').first()
        if not chief:
            # ✅ استفاده از تابع hash یکسان با سیستم
            password_hash = get_password_hash('Mezr@1360')
            
            chief = AdminUser(
                username='chief-admin-zargar', 
                password_hash=password_hash,
                email='chief@parsagold.com', 
                full_name='مدیر ارشد زرگر',
                role='chief', 
                is_active=True, 
                is_approved=True,
                gender='MALE'  # ✅ اضافه کردن فیلد جنسیت
            )
            db.add(chief)
            db.commit()
            print('✅ کاربر chief ایجاد شد')
        else:
            print('✅ کاربر chief از قبل وجود دارد')
            
    except Exception as e:
        print('❌ خطا در ایجاد داده اولیه:', e)
        db.rollback()
    finally:
        db.close()