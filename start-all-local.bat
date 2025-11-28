@echo off
echo Starting Complete Development Environment...

echo Starting Blockchain Nodes...
start "Blockchain Nodes" npm run start-nodes

timeout /t 15 /nobreak >nul
echo.
echo Compiling Contracts (First Pass)...
start "Compile 1" node scripts/compile.js

timeout /t 10 /nobreak >nul
echo.
echo Deploy Contracts (Second Pass)...
start "Deploy 2" node scripts/deploy.js

timeout /t 10 /nobreak >nul
echo.
echo Starting Backend Server...
start "Backend" cmd /k "cd server && npm run dev"

timeout /t 10 /nobreak >nul
echo.
echo Starting Frontend...
start "Frontend" npm run dev

timeout /t 5 /nobreak >nul
echo.
echo All processes started! Check the opened windows.
pause