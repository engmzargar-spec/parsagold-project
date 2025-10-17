@echo off
chcp 65001 >nul
echo 🚀 ParsaGold - Deploy ALL Files
echo.

set /p commit_msg="💬 Enter commit message: "

if "%commit_msg%"=="" (
    echo ❌ Commit message required!
    pause
    exit /b 1
)

echo.
echo 📁 Adding ALL files to Git...
git add --all

echo 💾 Committing...
git commit -m "%commit_msg%"

echo 🚀 Pushing to GitHub...
git push origin master

echo.
echo ✅ ALL files deployed successfully!
echo.
pause