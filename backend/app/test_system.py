# backend/app/test_system.py
from database import SessionLocal, engine, init_db
from models import User, Trade, Portfolio

def test_system():
    print("🧪 تست کامل سیستم با PostgreSQL...")
    db = None
    
    try:
        # ابتدا جداول را ایجاد کنیم
        init_db()
        print("✅ جداول ایجاد شدند")
        
        # تست اتصال
        with engine.connect():
            print("✅ اتصال به PostgreSQL موفق")
        
        # ایجاد session
        db = SessionLocal()
        
        # تست ایجاد کاربر جدید
        new_user = User(
            username="testuser",
            email="test@parsagold.com",
            password_hash="hashed_password_123",
            is_active=True,
            is_verified=True
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        print("✅ ایجاد کاربر تست موفق")
        
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
        print(f"💰 معامله ایجاد شده: {new_trade.symbol} - {new_trade.trade_type}")
        print(f"📊 پرتفو ایجاد شده: موجودی {new_portfolio.total_balance}")
        
    except Exception as e:
        print(f"❌ خطا در تست: {e}")
        import traceback
        traceback.print_exc()
    finally:
        if db:
            db.close()

if __name__ == "__main__":
    test_system()