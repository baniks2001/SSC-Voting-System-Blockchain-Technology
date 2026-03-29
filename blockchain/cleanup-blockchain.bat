@echo off
echo ========================================
echo CLEANUP BLOCKCHAIN DATA
echo ========================================
echo.
echo This script will clean up existing blockchain data
echo to prepare for persistent storage migration.
echo.
echo WARNING: This will delete all existing blockchain data!
echo.
set /p confirm="Are you sure you want to continue? (y/N): "
if /i not "%confirm%"=="y" (
    echo Operation cancelled.
    pause
    exit /b 0
)

echo.
echo [CLEANUP] Stopping any running Geth processes...
taskkill /f /im geth.exe 2>nul

echo [CLEANUP] Removing Node 1 data...
if exist "node1" (
    rmdir /s /q node1
    echo ✅ Node 1 data removed
) else (
    echo ✅ Node 1 data already clean
)

echo [CLEANUP] Removing Node 2 data...
if exist "node2" (
    rmdir /s /q node2
    echo ✅ Node 2 data removed
) else (
    echo ✅ Node 2 data already clean
)

echo.
echo ✅ Cleanup completed successfully!
echo.
echo Next steps:
echo 1. Run: start-nodes.cjs
echo 2. The nodes will initialize with persistent storage
echo.
pause
