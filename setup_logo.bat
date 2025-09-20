@echo off
echo.
echo ================================================
echo   CopyCache Icon Generator - Quick Setup
echo ================================================
echo.
echo Choose an option:
echo.
echo 1. Open Icon Generator Tool (Recommended)
echo 2. Run PowerShell Icon Creation Script
echo 3. Open Images Folder
echo 4. Open Setup Instructions
echo.
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" (
    echo Opening Icon Generator...
    start "" "icon_generator.html"
) else if "%choice%"=="2" (
    echo Running PowerShell script...
    powershell -ExecutionPolicy Bypass -File "create_icons.ps1"
    pause
) else if "%choice%"=="3" (
    echo Opening images folder...
    start "" "images"
) else if "%choice%"=="4" (
    echo Opening setup instructions...
    start "" "ICON_SETUP.md"
) else (
    echo Invalid choice. Please run the script again.
)

echo.
echo Done! Your CopyCache extension logo should be ready.
echo Remember to reload the extension in Chrome to see changes.
pause