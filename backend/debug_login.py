import requests
import json
import traceback

def debug_login():
    url = "http://localhost:8000/api/auth/admin-login"
    data = {
        "email": "chief@parsagold.com",
        "password": "Chief123!"
    }
    
    try:
        print("📡 ارسال درخواست به سرور...")
        response = requests.post(url, json=data, timeout=10)
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"📋 Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            print("🎉 لاگین موفق!")
            print(f"👤 کاربر: {result['admin']['email']}")
            return True
        else:
            print(f"❌ خطا: {response.status_code}")
            print(f"📝 Response Text: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ خطای شبکه: {e}")
        return False
    except Exception as e:
        print(f"❌ خطای ناشناخته: {e}")
        print(traceback.format_exc())
        return False

if __name__ == "__main__":
    debug_login()