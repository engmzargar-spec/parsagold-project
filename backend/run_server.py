# backend/run_server.py
#!/usr/bin/env python3
"""
فایل اجرایی هوشمند - پورت را به صورت خودکار پیدا می‌کند
"""
import socket
import os
import sys
from app.core.config import settings

def find_available_port(start_port=8000, max_attempts=10):
    """پیدا کردن پورت آزاد"""
    for port in range(start_port, start_port + max_attempts):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('localhost', port))
                return port
        except OSError:
            continue
    raise Exception(f"هیچ پورت آزادی بین {start_port} تا {start_port + max_attempts} پیدا نشد")

def main():
    # پیدا کردن پورت آزاد
    try:
        available_port = find_available_port()
        print(f"🔍 پورت {available_port} آزاد است")
        
        # تنظیم پورت در متغیر محیطی
        os.environ["API_PORT"] = str(available_port)
        
        # نمایش اطلاعات
        print(f"🚀 راه‌اندازی سرور پارسا گلد")
        print(f"📡 پورت: {available_port}")
        print(f"🌐 آدرس: http://localhost:{available_port}")
        print(f"📚 مستندات: http://localhost:{available_port}/docs")
        print("-" * 50)
        
        # اجرای سرور
        import uvicorn
        uvicorn.run(
            "app.main:app",
            host="0.0.0.0",
            port=available_port,
            reload=True,
            log_level="info"
        )
        
    except Exception as e:
        print(f"❌ خطا: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()