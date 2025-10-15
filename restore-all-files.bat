@echo off
chcp 65001 >nul
echo ========================================
echo    Restore All Files to Git
echo ========================================
echo.

echo 🔄 Removing .gitignore...
del .gitignore 2>nul

echo 🔄 Adding all files back to Git...
git add --all

echo 💾 Committing changes...
git commit -m "Restore all files - include everything"

echo 🚀 Pushing to GitHub...
git push origin master

echo.
echo ✅ All files restored and pushed!
echo 📁 Now ALL files are included in GitHub
echo.
pause