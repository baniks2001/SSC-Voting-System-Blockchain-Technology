@echo off
title SSC Voting System - Dev Mode with Persistent Storage
echo ========================================
echo SSC VOTING SYSTEM - DEV MODE (PERSISTENT)
echo ========================================
echo.
echo This script starts nodes in dev mode with:
echo - Auto-unlocked accounts for development
echo - Persistent storage (data survives restarts)
echo - Existing contract artifacts
echo.
echo [STEP 1] Stopping any existing processes...
taskkill /f /im node.exe 2>nul
taskkill /f /im geth.exe 2>nul
echo ✅ Processes stopped

echo.
echo [STEP 2] Starting blockchain nodes in dev mode...
cd blockchain
node start-nodes.cjs
echo.
echo [STEP 3] Waiting for nodes to initialize...
timeout /t 15 /nobreak >nul

echo.
echo [STEP 4] Deploying contracts (using existing artifacts)...
cd ..
call npm run deploy-contract

echo.
echo [STEP 5] Starting the server...
call npm run dev:network

echo.
echo 🎉 System startup complete!
echo.
echo 📋 Access URLs:
echo - Frontend: http://localhost:5173
echo - Server API: http://localhost:5000
echo - Node 1: http://localhost:8545
echo - Node 2: http://localhost:8547
echo.
echo 💡 Data Persistence:
echo - Nodes run in dev mode with auto-unlocked accounts
echo - Blockchain data stored in node1/ and node2/ directories
echo - Data survives restarts despite dev mode
echo.
pause
