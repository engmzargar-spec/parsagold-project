# backend/app/seed_data.py
import bcrypt
from app.database import SessionLocal
from app.models.models import AdminUser

def seed_initial_data():
    db = SessionLocal()
    try:
        chief = db.query(AdminUser).filter(AdminUser.username == 'chief-admin-zargar').first()
        if not chief:
            password_hash = bcrypt.hashpw('Mezr@1360'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            chief = AdminUser(
                username='chief-admin-zargar', password_hash=password_hash,
                email='chief@parsagold.com', full_name='Chief Administrator',
                role='chief', is_active=True, is_approved=True
            )
            db.add(chief)
            db.commit()
            print('✅ داده‌های اولیه ایجاد شدند')
    except Exception as e:
        print('❌ خطا:', e)
    finally:
        db.close()