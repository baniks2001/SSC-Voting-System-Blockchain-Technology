@echo off
title SSC Voting System - Electron Controller
echo ========================================
echo    SSC VOTING SYSTEM - ELECTRON APP
echo ========================================
echo.
echo Starting Electron Application...
echo.

:: Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

:: Start the Electron application
npm run electron

pause