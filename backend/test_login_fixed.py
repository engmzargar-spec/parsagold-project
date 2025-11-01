import requests
import json

def test_login():
    url = "http://localhost:8000/api/auth/admin-login"
    
    # داده‌های لاگین
    data = {
        "email": "chief@parsagold.com",
        "password": "Chief123!"
    }
    
    try:
        print("📡 در حال ارسال درخواست...")
        response = requests.post(url, json=data)
        
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("🎉 لاگین موفق!")
            print(f"🔑 توکن: {result['access_token']}")
            print(f"👤 کاربر: {result['admin']['email']}")
            print(f"🏷️ نقش: {result['admin']['role']}")
        else:
            print(f"❌ خطا: {response.status_code}")
            print(f"📝 پاسخ: {response.text}")
            
    except Exception as e:
        print(f"❌ خطا: {e}")

if __name__ == "__main__":
    test_login()