# backend/app/seed_data.py
from app.database import SessionLocal

# import درست مدل‌ها
try:
    from app.models import AdminUser
    print("✅ مدل AdminUser از app.models import شد")
except ImportError:
    try:
        from app.models.models import AdminUser
        print("✅ مدل AdminUser از app.models.models import شد")
    except ImportError as e:
        print(f"❌ خطا در import مدل AdminUser: {e}")
        raise

from app.security.auth import get_password_hash

def seed_initial_data():
    db = SessionLocal()
    try:
        # بررسی وجود کاربر chief
        chief = db.query(AdminUser).filter(AdminUser.username == 'chief-admin-zargar').first()
        if not chief:
            # ✅ استفاده از تابع hash یکسان با سیستم
            password_hash = get_password_hash('Mezr@1360')
            
            # ایجاد کاربر chief با فیلدهای موجود در مدل
            chief_data = {
                'username': 'chief-admin-zargar', 
                'password_hash': password_hash,
                'email': 'chief@parsagold.com', 
                'role': 'chief', 
                'is_active': True, 
                'is_approved': True,
            }
            
            # اضافه کردن فیلدهای اختیاری اگر وجود دارند
            try:
                # بررسی وجود فیلد first_name
                if hasattr(AdminUser, 'first_name'):
                    chief_data['first_name'] = 'مدیر'
                if hasattr(AdminUser, 'last_name'):
                    chief_data['last_name'] = 'ارشد زرگر'
                if hasattr(AdminUser, 'full_name'):
                    chief_data['full_name'] = 'مدیر ارشد زرگر'
                if hasattr(AdminUser, 'gender'):
                    chief_data['gender'] = 'MALE'
            except Exception as attr_error:
                print(f"⚠️ خطا در بررسی فیلدها: {attr_error}")
            
            chief = AdminUser(**chief_data)
            db.add(chief)
            db.commit()
            print('✅ کاربر chief ایجاد شد')
            
            # تأیید ایجاد کاربر
            created_chief = db.query(AdminUser).filter(AdminUser.username == 'chief-admin-zargar').first()
            if created_chief:
                print(f'✅ تأیید ایجاد کاربر chief - ID: {created_chief.id}')
                print(f'📧 ایمیل: {created_chief.email}')
                print(f'👤 نام کاربری: {created_chief.username}')
            else:
                print('❌ خطا در تأیید ایجاد کاربر chief')
                
        else:
            print(f'✅ کاربر chief از قبل وجود دارد - ID: {chief.id}')
            print(f'📧 ایمیل: {chief.email}')
            print(f'👤 نام کاربری: {chief.username}')
            
    except Exception as e:
        print(f'❌ خطا در ایجاد داده اولیه: {e}')
        db.rollback()
        # پرتاب نکنیم خطا رو، بذاریم سرور اجرا بشه
        print('🚀 ادامه اجرای سرور بدون داده اولیه...')
    finally:
        db.close()