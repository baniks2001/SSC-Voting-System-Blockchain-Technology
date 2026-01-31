@echo off
echo SSC Voting System - JMeter GUI Mode
echo ====================================
echo.

REM Check if server is running
echo Checking if server is running on localhost:5000...
curl -s http://localhost:5000/api/health >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Server may not be running on localhost:5000
    echo Please ensure the server is running for accurate results
    echo.
)

echo Starting JMeter in GUI mode with test plan...
echo.

REM Start JMeter GUI with test plan
"C:\apache-jmeter-5.6.3\apache-jmeter-5.6.3\bin\jmeter.bat" -t "jmeter-test-plan.jmx"

echo.
echo JMeter GUI closed.
