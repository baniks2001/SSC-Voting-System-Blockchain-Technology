@echo off
title SSC Voting System - Quick Start
echo ========================================
echo    SSC VOTING SYSTEM - QUICK START
echo ========================================
echo.
echo This batch file will run the entire system automatically.
echo Make sure XAMPP Apache and MySQL are running first!
echo.

:: Check if .env exists, if not create from backup
if not exist ".env" (
    echo Creating .env file from backup...
    copy "environment(env).txt" ".env"
)

:: Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

:: Get local IP address
echo Detecting local IP address...
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr "IPv4"') do (
    set IP=%%i
    goto :ip_found
)
:ip_found
set IP=%IP:~1%
echo Detected IP: %IP%

:: Update .env with current IP
echo Updating .env with current IP address...
powershell -Command "(gc '.env') -replace 'CLIENT_URL=.*', 'CLIENT_URL=http://localhost:5173,http://%IP%:5173' | Out-File -encoding ASCII '.env'"
powershell -Command "(gc '.env') -replace 'ALLOWED_ORIGINS=.*', 'ALLOWED_ORIGINS=http://localhost:5173,http://%IP%:5173,http://localhost:3000,http://%IP%:3000' | Out-File -encoding ASCII '.env'"
powershell -Command "(gc '.env') -replace 'VITE_API_URL=.*', 'VITE_API_URL=http://%IP%:5000' | Out-File -encoding ASCII '.env'"

echo.
echo Step 1: Cleaning Blockchain...
call node scripts/clean-reset.js

echo.
echo Step 2: Starting Blockchain Nodes...
echo This will take 20-30 seconds...
start "Blockchain Node 1" node blockchain/start-nodes.js
timeout /t 25 /nobreak >nul

echo.
echo Step 3: Compiling and Deploying Contracts...
call node scripts/compile.js
call node scripts/deploy.js

echo.
echo Step 4: Starting Backend Server...
cd server
start "Backend Server" npm run dev:network
cd ..
timeout /t 10 /nobreak >nul

echo.
echo Step 5: Starting Frontend Server...
start "Frontend Server" npm run dev -- --host
timeout /t 10 /nobreak >nul

echo.
echo ========================================
echo    SYSTEM STARTUP COMPLETE!
echo ========================================
echo.
echo Frontend URL: http://%IP%:5173
echo Backend API: http://%IP%:5000
echo.
echo Press any key to open the voting system...
pause >nul
start http://%IP%:5173

echo.
echo Press any key to exit...
pause >nul