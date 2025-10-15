@echo off
chcp 65001 >nul
echo ========================================
echo    Cleanup Unwanted Files from Git
echo ========================================
echo.

echo 🔄 Removing unwanted files from Git...
echo.

:: Remove the files that should be in .gitignore
git rm --cached data/parsagold.db
git rm --cached -r "my-data-for projects/"
git rm --cached -r backend/app/__pycache__/
git rm --cached -r backend/app/routes/__pycache__/

echo.
echo 📁 Adding .gitignore file...
git add .gitignore

echo.
echo 💾 Committing changes...
git commit -m "Add .gitignore and remove unwanted files"

echo.
echo 🚀 Pushing to GitHub...
git push origin master

echo.
echo ✅ Cleanup completed!
echo 📋 Removed from Git (but kept locally):
echo    - data/parsagold.db
echo    - my-data-for projects/
echo    - __pycache__ folders
echo.
pause