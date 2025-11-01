import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_complete_system():
    print("🧪 تست کامل سیستم پارسا گلد...")
    
    # 1. تست دیتابیس
    from app.database import SessionLocal
    from app.models import User
    
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print(f"✅ دیتابیس: {len(users)} کاربر موجود")
        
        for user in users:
            status = "فعال" if user.is_active else "غیرفعال"
            print(f"   👤 {user.username} ({user.email}) - {user.role.value} - {status}")
            
    except Exception as e:
        print(f"❌ خطا در تست دیتابیس: {e}")
        return
    finally:
        db.close()
    
    # 2. تست APIها
    import requests
    
    base_url = "http://localhost:8000"
    
    try:
        # تست سلامت
        response = requests.get(f"{base_url}/api/health")
        print(f"✅ API سلامت: {response.status_code}")
        
        # تست لیست ادمین‌ها
        response = requests.get(f"{base_url}/api/admin/admins")
        print(f"✅ لیست ادمین‌ها: {response.status_code}")
        
        if response.status_code == 200:
            admins = response.json()
            print(f"   📋 {len(admins)} ادمین در سیستم")
        
        # تست آمار
        response = requests.get(f"{base_url}/api/admin/dashboard-stats")
        print(f"✅ آمار داشبورد: {response.status_code}")
        
    except Exception as e:
        print(f"⚠️ خطا در تست API: {e}")
    
    print("\n🎉 تست سیستم کامل شد!")
    print("🌐 آدرس API: http://localhost:8000")
    print("📊 مستندات API: http://localhost:8000/docs")
    print("🔧 پنل مدیریت: http://localhost:3000/admin")

if __name__ == "__main__":
    test_complete_system()