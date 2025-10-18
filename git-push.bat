@echo off
chcp 65001 >nul
echo.
echo 🚀 در حال Push کردن تغییرات به GitHub...
echo.

cd /d "D:\parsagold-project"

echo 📊 بررسی وضعیت Git...
git status

echo.
set /p commit_message="📝 پیام Commit را وارد کنید: "

echo.
echo 🔄 در حال اضافه کردن فایل‌ها...
git add .

echo 💾 در حال Commit کردن...
git commit -m "%commit_message%"

echo 📤 در حال Push به GitHub...
git push origin master

echo.
echo ✅ عملیات Push با موفقیت انجام شد!
echo 📍 می‌توانید روی سیستم دیگر پروژه را Pull کنید
echo.

pause