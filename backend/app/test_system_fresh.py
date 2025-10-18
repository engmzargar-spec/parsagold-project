# backend/app/test_system_fresh.py
from database import SessionLocal, engine, init_db
from models import User, Trade, Portfolio
import random
import string

def generate_random_email():
    """ایجاد ایمیل تصادفی برای تست"""
    random_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    return f"test_{random_str}@parsagold.com"

def generate_random_username():
    """ایجاد نام کاربری تصادفی برای تست"""
    random_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
    return f"testuser_{random_str}"

def test_system_fresh():
    print("🧪 تست کامل سیستم با داده‌های جدید...")
    
    try:
        # ایجاد جداول (اگر وجود ندارند)
        init_db()
        print("✅ جداول آماده هستند")
        
        # تست اتصال
        with engine.connect():
            print("✅ اتصال به PostgreSQL موفق")
        
        # ایجاد session
        db = SessionLocal()
        
        # ایجاد کاربر جدید با داده‌های تصادفی
        random_username = generate_random_username()
        random_email = generate_random_email()
        
        new_user = User(
            username=random_username,
            email=random_email,
            password_hash="hashed_password_123",
            is_active=True,
            is_verified=True
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        print(f"✅ ایجاد کاربر تست موفق: {new_user.username}")
        
        # تست ایجاد معامله
        new_trade = Trade(
            user_id=new_user.id,
            symbol="XAUUSD",
            quantity=1.5,
            price=1950.50,
            trade_type="buy",
            status="executed"
        )
        
        db.add(new_trade)
        db.commit()
        print("✅ ایجاد معامله تست موفق")
        
        # تست ایجاد پرتفو
        new_portfolio = Portfolio(
            user_id=new_user.id,
            total_balance=10000.00,
            available_balance=8000.00,
            invested_amount=2000.00,
            holdings='{"XAUUSD": 1.5}'
        )
        
        db.add(new_portfolio)
        db.commit()
        print("✅ ایجاد پرتفو تست موفق")
        
        print("🎉 تمام تست‌ها موفقیت‌آمیز بودند!")
        
        # نمایش داده‌های ایجاد شده
        print(f"👤 کاربر ایجاد شده: {new_user.username} (ID: {new_user.id})")
        print(f"📧 ایمیل: {new_user.email}")
        print(f"💰 معامله ایجاد شده: {new_trade.symbol} - {new_trade.trade_type}")
        print(f"📊 پرتفو ایجاد شده: موجودی {new_portfolio.total_balance}")
        
    except Exception as e:
        print(f"❌ خطا در تست: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_system_fresh()