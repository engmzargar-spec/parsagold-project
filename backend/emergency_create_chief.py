# backend/emergency_create_chief.py
import sys
import os

# اضافه کردن مسیر پروژه به sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# import درست مدل‌ها با مدیریت خطا
try:
    from app.models import AdminUser
    print("✅ مدل AdminUser از app.models import شد")
except ImportError:
    try:
        from app.models.models import AdminUser
        print("✅ مدل AdminUser از app.models.models import شد")
    except ImportError as e:
        print(f"❌ خطا در import مدل AdminUser: {e}")
        sys.exit(1)

from app.database import SessionLocal
from app.security.auth import get_password_hash

def emergency_create_chief():
    """تابع اضطراری برای ایجاد کاربر chief در صورت حذف شدن"""
    db = SessionLocal()
    try:
        # حذف کاربر chief موجود (اگر وجود دارد)
        existing_chief = db.query(AdminUser).filter(AdminUser.username == 'chief-admin-zargar').first()
        if existing_chief:
            db.delete(existing_chief)
            db.commit()
            print('🗑️ کاربر chief قدیمی حذف شد')
        
        # ایجاد کاربر chief جدید
        password_hash = get_password_hash('Mezr@1360')
        
        # ایجاد با فیلدهای پایه
        chief_data = {
            'username': 'chief-admin-zargar', 
            'password_hash': password_hash,
            'email': 'chief@parsagold.com'
        }
        
        # اضافه کردن فیلدهای اختیاری اگر وجود دارند
        if hasattr(AdminUser, 'is_active'):
            chief_data['is_active'] = True
        if hasattr(AdminUser, 'is_approved'):
            chief_data['is_approved'] = True
        if hasattr(AdminUser, 'first_name'):
            chief_data['first_name'] = 'مدیر'
        if hasattr(AdminUser, 'last_name'):
            chief_data['last_name'] = 'ارشد زرگر'
        if hasattr(AdminUser, 'full_name'):
            chief_data['full_name'] = 'مدیر ارشد زرگر'
        if hasattr(AdminUser, 'gender'):
            chief_data['gender'] = 'MALE'
        
        # استفاده از مقدار role معتبر
        # ابتدا بررسی کن چه مقادیری برای role معتبر هستند
        try:
            # سعی کن از 'SUPER_ADMIN' یا 'ADMIN' استفاده کنی
            chief_data['role'] = 'SUPER_ADMIN'
        except:
            try:
                chief_data['role'] = 'ADMIN'
            except:
                # اگر هیچکدام کار نکرد، فیلد role را حذف کن
                if 'role' in chief_data:
                    del chief_data['role']
        
        chief = AdminUser(**chief_data)
        db.add(chief)
        db.commit()
        
        # تأیید
        new_chief = db.query(AdminUser).filter(AdminUser.username == 'chief-admin-zargar').first()
        if new_chief:
            print(f'✅ کاربر chief با موفقیت ایجاد شد - ID: {new_chief.id}')
            print(f'📧 ایمیل: {new_chief.email}')
            print(f'👤 نام کاربری: {new_chief.username}')
            print(f'🎯 نقش: {getattr(new_chief, "role", "Not set")}')
            print(f'🔑 پسورد: Mezr@1360')
            print('✅ حالا می‌توانی با این اطلاعات وارد شوی:')
            print('   نام کاربری: chief-admin-zargar')
            print('   رمز عبور: Mezr@1360')
        else:
            print('❌ خطا در ایجاد کاربر chief')
            
    except Exception as e:
        print(f'❌ خطا: {e}')
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    emergency_create_chief()