@echo off
chcp 65001 >nul
echo ========================================
echo    ParsaGold - First Time Deploy
echo ========================================
echo.

:: Check if git folder exists
if exist ".git" (
    echo ⚠️  Git folder already exists!
    echo.
    goto :menu
)

echo 🔄 Initializing Git repository...
echo.

:: Initialize git
git init
if errorlevel 1 (
    echo ❌ Error initializing Git!
    pause
    exit /b 1
)

:: Add remote origin
git remote add origin https://github.com/engmzargar-spec/parsagold-project.git
if errorlevel 1 (
    echo ❌ Error adding remote!
    pause
    exit /b 1
)

:menu
echo.
echo 📝 Please check repository status:
echo.
git status
echo.
git remote -v
echo.

set /p choice="🤔 Do you want to continue? (y/n): "

if /i not "%choice%"=="y" (
    echo ❌ Operation cancelled.
    pause
    exit /b 0
)

:: Get commit message
set /p commit_msg="💬 Enter initial commit message: "

if "%commit_msg%"=="" (
    set commit_msg="Initial commit - ParsaGold Project"
)

echo.
echo 🔄 Uploading project to GitHub...
echo.

:: Add all files
git add .

:: Initial commit
git commit -m "%commit_msg%"

:: Push to GitHub (try main then master)
git push -u origin main
if errorlevel 1 (
    echo ⚠️  Error pushing to main, trying master...
    git push -u origin master
    if errorlevel 1 (
        echo ❌ Error pushing to GitHub!
        echo 📋 You may need to create the repository manually
        echo 🔗 https://github.com/engmzargar-spec/parsagold-project
        pause
        exit /b 1
    )
)

echo.
echo ✅ Operation completed successfully!
echo 🌐 Project is available at:
echo 🔗 https://github.com/engmzargar-spec/parsagold-project
echo.

pause