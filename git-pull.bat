@echo off
chcp 65001 >nul
echo.
echo 📥 در حال دریافت آخرین تغییرات از GitHub...
echo.

cd /d "D:\parsagold-project"

echo 🔄 بررسی آخرین تغییرات...
git fetch origin

echo 📥 دریافت تغییرات...
git pull origin master

echo.
echo ✅ عملیات Pull با موفقیت انجام شد!
echo 🧪 در حال تست سیستم...
cd backend\app
python test_system_fresh.py

echo.
echo 🎉 پروژه آماده ادامه توسعه است!
echo.

pause